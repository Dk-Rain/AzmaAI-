'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PenSquare, Loader2, Check, AlertCircle, Sparkles, History, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentContent, References, StyleOptions } from '@/types';

import {
  generateContentAction,
  manageReferencesAction,
} from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Disclaimer } from './disclaimer';

interface ControlPanelProps {
  setContent: (content: DocumentContent) => void;
  setReferences: (references: References) => void;
  styles: StyleOptions;
  setStyles: (styles: StyleOptions) => void;
  references: References;
  content: DocumentContent;
}

const generationSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters.'),
  parameters: z.string().optional(),
});

const referenceSchema = z.object({
  numReferences: z.coerce.number().min(1).max(20),
});

type HistoryItem = {
  id: string;
  title: string;
  content: DocumentContent;
  references: References;
  timestamp: string;
}

export function ControlPanel({
  setContent,
  setReferences,
  styles,
  setStyles,
  references,
  content
}: ControlPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManagingRefs, setIsManagingRefs] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('stipslite_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const saveToHistory = (documentContent: DocumentContent, documentReferences: References) => {
    try {
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        title: documentContent.title,
        content: documentContent,
        references: documentReferences,
        timestamp: new Date().toLocaleString(),
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 19)]; // Keep max 20 items
      setHistory(updatedHistory);
      localStorage.setItem('stipslite_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save to history in localStorage", error);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setContent(item.content);
    setReferences(item.references);
    generationForm.setValue('topic', item.content.title);
    toast({
      title: 'Loaded from History',
      description: `Loaded document "${item.title}".`,
    });
  };

  const deleteFromHistory = (id: string) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('stipslite_history', JSON.stringify(updatedHistory));
      toast({
        title: 'History Item Deleted',
        description: `The selected item has been removed from your history.`,
      });
    } catch (error) {
      console.error("Failed to delete from history in localStorage", error);
    }
  };
  
  const generationForm = useForm<z.infer<typeof generationSchema>>({
    resolver: zodResolver(generationSchema),
    defaultValues: { topic: '', parameters: '' },
  });

  const referenceForm = useForm<z.infer<typeof referenceSchema>>({
    resolver: zodResolver(referenceSchema),
    defaultValues: { numReferences: 5 },
  });

  async function onGenerate(values: z.infer<typeof generationSchema>) {
    setIsGenerating(true);
    toast({
      title: 'Generating Content...',
      description: 'The AI is crafting your document. This may take a moment.',
    });

    const { data, error } = await generateContentAction(
      values.topic,
      values.parameters || 'A standard academic paper structure.'
    );

    setIsGenerating(false);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error,
      });
    } else {
      setContent(data);
      setReferences([]); // Reset references for new content
      saveToHistory(data, []);
      toast({
        title: 'Content Generated',
        description: 'Your document has been created and saved to history.',
      });
    }
  }

  async function onManageReferences() {
    const topic = generationForm.getValues('topic');
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Topic Required',
        description: 'Please enter a topic before generating references.',
      });
      return;
    }
    const { numReferences } = referenceForm.getValues();

    setIsManagingRefs(true);
    toast({
      title: 'Generating References...',
      description: `The AI is finding ${numReferences} references.`,
    });

    const { data, error } = await manageReferencesAction(topic, numReferences);
    setIsManagingRefs(false);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Reference Generation Failed',
        description: error,
      });
    } else {
      setReferences(data);
      saveToHistory(content, data);
      toast({
        title: 'References Updated',
        description: 'The reference list has been populated and saved to history.',
      });
    }
  }

  return (
    <aside className="w-full md:w-[400px] border-r bg-background flex flex-col p-4">
      <div className="flex items-center gap-2 p-2 mb-4">
        <PenSquare className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">Stipslite AI</h1>
      </div>

      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          defaultValue={['generate', 'style']}
          className="w-full"
        >
          <AccordionItem value="generate">
            <AccordionTrigger className="text-base font-semibold">
              Generate Content
            </AccordionTrigger>
            <AccordionContent>
              <Form {...generationForm}>
                <form
                  onSubmit={generationForm.handleSubmit(onGenerate)}
                  className="space-y-4"
                >
                  <FormField
                    control={generationForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., The Impact of AI on Climate Change"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generationForm.control}
                    name="parameters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameters (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Include sections on methodology, results, and discussion."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="history">
            <AccordionTrigger className="text-base font-semibold">
              History
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-64 w-full">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div key={item.id} className="p-2 border-b group hover:bg-muted/50 rounded-md">
                       <div className="flex justify-between items-center">
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="text-left flex-1"
                        >
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                        </button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => deleteFromHistory(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-4">
                    <History className="mx-auto h-8 w-8 mb-2" />
                    No history yet.
                  </div>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="style">
            <AccordionTrigger className="text-base font-semibold">
              Customize Style
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <FormLabel>Font Size</FormLabel>
                  <span>{styles.fontSize}pt</span>
                </div>
                <Slider
                  value={[styles.fontSize]}
                  onValueChange={([val]) =>
                    setStyles({ ...styles, fontSize: val })
                  }
                  min={8}
                  max={24}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <FormLabel>Line Spacing</FormLabel>
                  <span>{styles.lineHeight.toFixed(1)}</span>
                </div>
                <Slider
                  value={[styles.lineHeight]}
                  onValueChange={([val]) =>
                    setStyles({ ...styles, lineHeight: val })
                  }
                  min={1}
                  max={2.5}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <FormLabel>Margins</FormLabel>
                  <span>{styles.margin.toFixed(2)}cm</span>
                </div>
                <Slider
                  value={[styles.margin]}
                  onValueChange={([val]) =>
                    setStyles({ ...styles, margin: val })
                  }
                  min={1}
                  max={4}
                  step={0.01}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="references">
            <AccordionTrigger className="text-base font-semibold">
              Manage References
            </AccordionTrigger>
            <AccordionContent>
              <Form {...referenceForm}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onManageReferences();
                  }}
                  className="space-y-4"
                >
                  <FormField
                    control={referenceForm.control}
                    name="numReferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number to Generate</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isManagingRefs} className="w-full">
                    {isManagingRefs ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate References
                  </Button>
                </form>
              </Form>
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Generated References</h4>
                <ScrollArea className="h-48 w-full rounded-md border p-2">
                  {references.length > 0 ? (
                    references.map((ref, index) => (
                      <div key={index} className="text-sm p-2 border-b">
                        <p>{ref.referenceText}</p>
                        {ref.isVerified ? (
                          <Badge variant="secondary" className="mt-1 bg-green-500/20 text-green-700 dark:text-green-400">
                            <Check className="mr-1 h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="mt-1">
                            <AlertCircle className="mr-1 h-3 w-3" /> Unverified
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm p-2">
                      No references generated yet.
                    </p>
                  )}
                </ScrollArea>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>

      <div className="mt-auto pt-4">
        <Disclaimer />
      </div>
    </aside>
  );
}
