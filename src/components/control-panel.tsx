'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    PenSquare, Loader2, Check, AlertCircle, Sparkles, 
    Trash2, Search, Library, PlusCircle, FolderPlus, MountainIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentContent, References, StyleOptions, FontType } from '@/types';
import { GenerationSchema, GenerationFormValues, availableFonts } from '@/types';
import { academicTaskTypes } from '@/types/academic-task-types';
import { academicTaskFormats } from '@/types/academic-task-formats';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Disclaimer } from './disclaimer';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AcademicTaskType } from '@/types/academic-task-types';


interface ControlPanelProps {
  setContent: (content: DocumentContent) => void;
  setReferences: (references: References) => void;
  styles: StyleOptions;
  setStyles: (styles: StyleOptions) => void;
  references: References;
  content: DocumentContent;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const generationForm = useForm<GenerationFormValues>({
    resolver: zodResolver(GenerationSchema),
    defaultValues: { topic: '', parameters: '', taskType: 'Research Paper', numPages: 1 },
  });

  const referenceForm = useForm<z.infer<typeof referenceSchema>>({
    resolver: zodResolver(referenceSchema),
    defaultValues: { numReferences: 5 },
  });

  const taskType = generationForm.watch('taskType');
  
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('azma_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (taskType) {
      const format = academicTaskFormats[taskType as AcademicTaskType];
      const sections = format
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => ({
          title: line.substring(2).trim(),
          content: `Placeholder for ${line.substring(2).trim()}`,
        }));
      
      const newContent: DocumentContent = {
        title: content.title.includes("Your Academic Paper Title") || content.title.includes("New Research Paper Title") || content.title.includes("New Assignment Title") ? `New ${taskType} Title` : content.title,
        abstract: `This is a placeholder abstract for the ${taskType}.`,
        sections,
      };

      setContent(newContent);
    }
  }, [taskType]);
  
  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    return history.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [history, searchQuery]);

  const saveToHistory = (documentContent: DocumentContent, documentReferences: References) => {
    if (!documentContent.title || documentContent.title.includes('New Research Paper Title')) return;
    try {
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        title: documentContent.title,
        content: documentContent,
        references: documentReferences,
        timestamp: new Date().toLocaleString(),
      };
      const updatedHistory = [newHistoryItem, ...history.filter(item => item.title !== newHistoryItem.title).slice(0, 19)]; // Keep max 20 items, prevent duplicates
      setHistory(updatedHistory);
      localStorage.setItem('azma_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save to history in localStorage", error);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setContent(item.content);
    setReferences(item.references);
    generationForm.setValue('topic', item.content.title);
    if(item.content.title) {
        const taskTypeGuess = Object.keys(academicTaskFormats).find(t => item.content.title.toLowerCase().includes(t.toLowerCase())) as AcademicTaskType | undefined;
        generationForm.setValue('taskType', taskTypeGuess || 'Research Paper');
    }
    toast({
      title: 'Loaded from Projects',
      description: `Loaded document "${item.title}".`,
    });
  };

  const deleteFromHistory = (id: string) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('azma_history', JSON.stringify(updatedHistory));
      toast({
        title: 'Project Deleted',
        description: `The selected item has been removed from your projects.`,
      });
    } catch (error) {
      console.error("Failed to delete from history in localStorage", error);
    }
  };

  const handleNewTask = () => {
    const defaultTask: AcademicTaskType = 'Research Paper';
    const format = academicTaskFormats[defaultTask];
      const sections = format
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => ({
          title: line.substring(2).trim(),
          content: `Placeholder for ${line.substring(2).trim()}`,
        }));

    setContent({
        title: `New ${defaultTask} Title`,
        abstract: 'This is a placeholder for your abstract. Generate content to begin.',
        sections,
    });
    setReferences([]);
    generationForm.reset({ topic: '', parameters: '', taskType: defaultTask });
    toast({
        title: 'New Task Started',
        description: 'Ready for a new document.',
    });
  }

  async function onGenerate(values: GenerationFormValues) {
    setIsGenerating(true);
    toast({
      title: 'Generating Content...',
      description: 'The AI is crafting your document. This may take a moment.',
    });

    const { data, error } = await generateContentAction(values);

    setIsGenerating(false);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error,
      });
    } else {
      setContent(data);
      setReferences([]);
      saveToHistory(data, []);
      toast({
        title: 'Content Generated',
        description: 'Your document has been created and saved to your projects.',
      });
    }
  }

  async function onManageReferences() {
    const topic = generationForm.getValues('topic') || content.title;
    if (!topic || topic.includes('Title')) {
      toast({
        variant: 'destructive',
        title: 'Topic Required',
        description: 'Please enter a topic or generate content before generating references.',
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
        description: 'The reference list has been populated and saved.',
      });
    }
  }

  return (
    <aside className="w-full md:w-[450px] border-r bg-background flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <MountainIcon className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">AZMA AI</h1>
      </div>

      <div className="p-4 space-y-2 border-b">
        <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleNewTask}>
                <PlusCircle /> New Task
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => generationForm.handleSubmit(onGenerate)()}>
                <FolderPlus /> Add Project
            </Button>
        </div>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>
      
      <Tabs defaultValue="projects" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4">
            <TabsTrigger value="projects" className="flex-1"><Library className="mr-2"/>Projects</TabsTrigger>
            <TabsTrigger value="edit" className="flex-1"><Sparkles className="mr-2"/>Generate & Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <div key={item.id} className="p-2 border-b group hover:bg-muted/50 rounded-md mx-4">
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
                  <div className="text-center text-sm text-muted-foreground p-8">
                    <Library className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold">No Projects Yet</p>
                    <p>Your generated documents will appear here.</p>
                  </div>
                )}
              </ScrollArea>
        </TabsContent>
        <TabsContent value="edit" className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                    {/* Generate Content Form */}
                    <Form {...generationForm}>
                        <form
                        onSubmit={generationForm.handleSubmit(onGenerate)}
                        className="space-y-4"
                        >
                        <h3 className="text-base font-semibold">Generate Content</h3>
                        <FormField
                            control={generationForm.control}
                            name="taskType"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Task Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a task type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {academicTaskTypes.map(task => (
                                        <SelectItem key={task} value={task}>{task}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
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
                            name="numPages"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Pages (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
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
                    <Separator />
                    {/* Style Customization */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold">Customize Style</h3>
                        <div className="space-y-2">
                             <FormLabel>Font Family</FormLabel>
                            <Select
                                value={styles.fontFamily}
                                onValueChange={(value: FontType) => setStyles({ ...styles, fontFamily: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableFonts.map(font => (
                                        <SelectItem key={font} value={font}>{font}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                            min={8} max={24} step={1}
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
                            min={1} max={2.5} step={0.1}
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
                            min={1} max={4} step={0.01}
                            />
                        </div>
                    </div>
                    <Separator />
                    {/* Manage References */}
                    <div>
                        <Form {...referenceForm}>
                        <form
                            onSubmit={(e) => { e.preventDefault(); onManageReferences(); }}
                            className="space-y-4"
                        >
                            <h3 className="text-base font-semibold">Manage References</h3>
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
                        <h4 className="font-semibold text-sm">Generated References</h4>
                        <ScrollArea className="h-40 w-full rounded-md border p-2">
                            {references.length > 0 ? (
                            references.map((ref, index) => (
                                <div key={index} className="text-sm p-2 border-b">
                                <p>{ref.referenceText}</p>
                                {ref.isVerified ? (
                                    <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
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
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="mt-auto p-4 border-t">
        <Disclaimer />
      </div>
    </aside>
  );
}
