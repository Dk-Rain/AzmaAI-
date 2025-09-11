
'use client';

import { useState, useEffect, useRef } from 'react';
import type { DocumentContent, Section, StyleOptions } from '@/types';
import { Button } from './ui/button';
import { Loader2, RefreshCw, PenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { regenerateSectionAction, paraphraseTextAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface DocumentEditorProps {
  content: DocumentContent;
  setContent: React.Dispatch<React.SetStateAction<DocumentContent>>;
  styles: StyleOptions;
}

export function DocumentEditor({
  content,
  setContent,
  styles,
}: DocumentEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null
  );
  const [regenerationInstructions, setRegenerationInstructions] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseUp = () => {
      const currentSelection = window.getSelection();
      if (currentSelection && currentSelection.toString().trim().length > 0) {
        setSelection(currentSelection);
      } else {
        setSelection(null);
      }
    };

    const editorNode = editorRef.current;
    if(editorNode) {
      editorNode.addEventListener('mouseup', handleMouseUp);
      
      // Also listen for focusout to clear selection
      const handleFocusOut = (event: FocusEvent) => {
        if (!editorNode.contains(event.relatedTarget as Node)) {
          setSelection(null);
        }
      };
      editorNode.addEventListener('focusout', handleFocusOut);

      return () => {
        editorNode.removeEventListener('mouseup', handleMouseUp);
        editorNode.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, [editorRef]);

  const handleParaphrase = async () => {
    if (!selection) return;

    const selectedText = selection.toString();
    setIsParaphrasing(true);
    toast({
      title: 'Paraphrasing...',
      description: 'The AI is rephrasing your selected text.',
    });

    const { data, error } = await paraphraseTextAction(selectedText);
    setIsParaphrasing(false);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Paraphrasing Failed',
        description: error,
      });
    } else {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(data));

      // After replacing, we need to manually update the main content state
      if (editorRef.current) {
        const titleElement = editorRef.current.querySelector(
          `[data-title="${range.startContainer.parentElement?.closest('[data-title]')?.getAttribute('data-title')}"]`
        );
        if (titleElement) {
          const newContent = titleElement.textContent || '';
          const sectionTitle = titleElement.getAttribute('data-title')!;
          const isSub = titleElement.getAttribute('data-is-sub') === 'true';
          const parentTitle = titleElement.getAttribute('data-parent-title');
          updateSectionContent(sectionTitle, newContent, isSub, parentTitle || undefined);
        }
      }

      toast({
        title: 'Text Paraphrased',
        description: 'Your selection has been rewritten.',
      });
      setSelection(null); // Clear selection after paraphrasing
    }
  };


  const updateSectionContent = (
    sectionTitle: string,
    newContent: string,
    isSubSection: boolean = false,
    parentSectionTitle?: string
  ) => {
    setContent((prevContent) => {
      const newSections = prevContent.sections.map((section) => {
        if (isSubSection && parentSectionTitle === section.title) {
          return {
            ...section,
            subSections: section.subSections?.map((sub) =>
              sub.title === sectionTitle ? { ...sub, content: newContent } : sub
            ),
          };
        }
        if (!isSubSection && section.title === sectionTitle) {
          return { ...section, content: newContent };
        }
        return section;
      });
      return { ...prevContent, sections: newSections };
    });
  };

  const handleRegenerate = async (sectionTitle: string) => {
    if (!regenerationInstructions) {
      toast({
        variant: 'destructive',
        title: 'Instructions Required',
        description: 'Please tell the AI how to change the section.',
      });
      return;
    }
    setRegeneratingSection(sectionTitle);
    toast({
      title: 'Regenerating Section...',
      description: `The AI is rewriting "${sectionTitle}".`,
    });

    const { data, error } = await regenerateSectionAction(content, sectionTitle, regenerationInstructions);
    setRegeneratingSection(null);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Regeneration Failed',
        description: error,
      });
    } else {
      updateSectionContent(sectionTitle, data);
      toast({
        title: 'Section Regenerated',
        description: `"${sectionTitle}" has been updated.`,
      });
    }
     // Close popover after action
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    setRegenerationInstructions('');
  };

  const fontClassMap = {
    'Literata': 'font-literata',
    'Lato': 'font-lato',
    'Georgia': 'font-georgia',
    'Times New Roman': 'font-times',
    'Arial': 'font-sans',
    'Calibri': 'font-calibri',
  };

  const paperStyles = {
    fontSize: `${styles.fontSize}pt`,
    lineHeight: styles.lineHeight,
    '--margin-cm': `${styles.margin}cm`,
  } as React.CSSProperties;

  const handleBlur = (
    e: React.FocusEvent<HTMLDivElement>,
    section: Section,
    isSub: boolean = false,
    parent?: Section
  ) => {
    const newText = e.currentTarget.innerText;
    if (isSub && parent) {
      updateSectionContent(section.title, newText, true, parent.title);
    } else {
      updateSectionContent(section.title, newText);
    }
  };
  
  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const newTitle = e.currentTarget.innerText;
    if (newTitle !== content.title) {
      setContent(prev => ({...prev, title: newTitle}));
    }
  }

  const ParaphraseButton = () => {
    if (!selection) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if(!editorRect) return null;

    return (
        <div 
          className="absolute z-10"
          style={{
            top: rect.top - editorRect.top - 40, // Position above selection
            left: rect.left - editorRect.left + (rect.width / 2) - 50, // Center on selection
          }}
        >
            <Button
              size="sm"
              onClick={handleParaphrase}
              disabled={isParaphrasing}
              className="shadow-lg"
            >
              {isParaphrasing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PenLine className="mr-2 h-4 w-4" />
              )}
              Paraphrase
            </Button>
        </div>
    );
  };


  return (
    <div
      ref={editorRef}
      className={cn(
        "max-w-4xl mx-auto bg-card p-[var(--margin-cm)] shadow-lg rounded-lg printable-area relative",
        fontClassMap[styles.fontFamily]
        )}
      style={paperStyles}
    >
      {<ParaphraseButton />}
      <h1
        className="text-3xl font-bold text-center mb-6"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTitleBlur}
      >
        {content.title}
      </h1>

      {content.sections.map((section, index) => (
        <div key={index} className="mb-6 group relative print:break-inside-avoid">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold mb-2">
              {section.title}
            </h2>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    disabled={!!regeneratingSection}
                    >
                    {regeneratingSection === section.title ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <PenLine className="h-4 w-4" />
                    )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                  <div className="grid gap-4">
                      <div className="space-y-2">
                          <h4 className="font-medium leading-none">Edit Section</h4>
                          <p className="text-sm text-muted-foreground">
                              Describe the changes you want to make to this section.
                          </p>
                      </div>
                       <div className="grid gap-2">
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea 
                            id="instructions"
                            placeholder="e.g., 'Make this more concise' or 'Add three bullet points summarizing the key ideas.'"
                            value={regenerationInstructions}
                            onChange={(e) => setRegenerationInstructions(e.target.value)}
                          />
                       </div>
                       <Button
                         onClick={() => handleRegenerate(section.title)}
                         disabled={regeneratingSection === section.title}
                       >
                         {regeneratingSection === section.title ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                         Regenerate
                       </Button>
                  </div>
              </PopoverContent>
            </Popover>

          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBlur(e, section)}
            data-title={section.title}
            data-is-sub="false"
            className="prose prose-sm dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2 -m-2"
          >
            {section.content}
          </div>

          {section.subSections && section.subSections.length > 0 && (
            <div className="ml-6 mt-4">
              {section.subSections.map((sub, subIndex) => (
                <div key={subIndex} className="mb-4 print:break-inside-avoid">
                  <h3 className="text-lg font-semibold mb-1">
                    {sub.title}
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleBlur(e, sub, true, section)}
                    data-title={sub.title}
                    data-is-sub="true"
                    data-parent-title={section.title}
                    className="prose prose-sm dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2 -m-2"
                  >
                    {sub.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
