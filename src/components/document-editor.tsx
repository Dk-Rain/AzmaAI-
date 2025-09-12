
'use client';

import { useState, useEffect, useRef } from 'react';
import type { DocumentContent, Section, StyleOptions, ContentBlock } from '@/types';
import { Button } from './ui/button';
import { Loader2, PenLine, ScanSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { editSectionAction, paraphraseTextAction, scanTextSnippetAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';


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
  const [isScanningSnippet, setIsScanningSnippet] = useState(false);
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
      replaceSelection(data);
      toast({
        title: 'Text Paraphrased',
        description: 'Your selection has been rewritten.',
      });
    }
  };
  
  const handleScanSnippet = async () => {
    if (!selection) return;

    const selectedText = selection.toString();
    setIsScanningSnippet(true);
    toast({
      title: 'Scanning Snippet...',
      description: 'The AI is cleaning your selected text.',
    });

    const { data, error } = await scanTextSnippetAction(selectedText);
    setIsScanningSnippet(false);

    if (error || !data) {
        toast({
            variant: 'destructive',
            title: 'Scanning Failed',
            description: error,
        });
    } else {
        replaceSelection(data);
        toast({
            title: 'Snippet Cleaned',
            description: 'Your selection has been fixed.',
        });
    }
  };

 const replaceSelection = (newText: string) => {
    if (!selection) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const newNode = document.createTextNode(newText);
    range.insertNode(newNode);

    // After replacing, we need to manually update the main content state
    // This is a simplified approach. A more robust solution might involve
    // finding the exact block and character offset.
    if (editorRef.current) {
        const titleElement = range.startContainer.parentElement?.closest('[data-title]');
        if (titleElement) {
            const sectionTitle = titleElement.getAttribute('data-title')!;
            const blockIndex = parseInt(titleElement.getAttribute('data-block-index') || '0', 10);
            const isSub = titleElement.getAttribute('data-is-sub') === 'true';
            const parentTitle = titleElement.getAttribute('data-parent-title');
            
            // Re-read the content from the DOM after replacement
            const newContent = titleElement.textContent || '';

            updateBlockContent(sectionTitle, blockIndex, { type: 'text', text: newContent }, isSub, parentTitle || undefined);
        }
    }
    setSelection(null); // Clear selection after action
}

  const updateBlockContent = (
    sectionTitle: string,
    blockIndex: number,
    newBlock: ContentBlock,
    isSubSection: boolean = false,
    parentSectionTitle?: string
  ) => {
    setContent((prevContent) => {
      const newSections = prevContent.sections.map((section) => {
        if (isSubSection && parentSectionTitle === section.title) {
          return {
            ...section,
            subSections: section.subSections?.map((sub) =>
              sub.title === sectionTitle
                ? {
                    ...sub,
                    content: sub.content.map((block, idx) =>
                      idx === blockIndex ? newBlock : block
                    ),
                  }
                : sub
            ),
          };
        }
        if (!isSubSection && section.title === sectionTitle) {
          return {
            ...section,
            content: section.content.map((block, idx) =>
              idx === blockIndex ? newBlock : block
            ),
          };
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
      title: 'Editing Section...',
      description: `The AI is editing "${sectionTitle}".`,
    });
  
    const { data, error } = await editSectionAction(content, sectionTitle, regenerationInstructions);
    setRegeneratingSection(null);
  
    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Edit Failed',
        description: error,
      });
    } else {
      setContent(data);
  
      toast({
        title: 'Section Edited',
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
    blockIndex: number,
    isSub: boolean = false,
    parent?: Section
  ) => {
    const newText = e.currentTarget.innerText;
    const currentBlock = isSub ? parent?.subSections?.find(s => s.title === section.title)?.content[blockIndex] : section.content[blockIndex];
    if (currentBlock?.type === 'text' && currentBlock.text !== newText) {
        const newBlock: ContentBlock = { type: 'text', text: newText };
        if (isSub && parent) {
          updateBlockContent(section.title, blockIndex, newBlock, true, parent.title);
        } else {
          updateBlockContent(section.title, blockIndex, newBlock);
        }
    }
  };
  
  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const newTitle = e.currentTarget.innerText;
    if (newTitle !== content.title) {
      setContent(prev => ({...prev, title: newTitle}));
    }
  }
  
  const renderBlock = (block: ContentBlock, blockIndex: number, section: Section, isSub: boolean, parentSection?: Section) => {
    switch (block.type) {
        case 'text':
            return (
                <div
                    key={blockIndex}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleBlur(e, section, blockIndex, isSub, parentSection)}
                    data-title={section.title}
                    data-block-index={blockIndex}
                    data-is-sub={isSub}
                    data-parent-title={parentSection?.title}
                    className="prose prose-sm dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2 -m-2"
                    dangerouslySetInnerHTML={{ __html: block.text }}
                />
            );
        case 'image':
            return (
                <div key={blockIndex} className="my-4 text-center">
                    <Image
                        src={block.url}
                        alt={block.caption || 'Generated visual'}
                        width={600}
                        height={400}
                        className="mx-auto rounded-lg shadow-md"
                    />
                    {block.caption && <p className="text-sm text-muted-foreground mt-2 italic">{block.caption}</p>}
                </div>
            );
        case 'table':
            return (
                 <Table key={blockIndex} className="my-4">
                    {block.caption && <TableCaption>{block.caption}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            {block.headers.map((header, hIndex) => (
                                <TableHead key={hIndex}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {block.rows.map((row, rIndex) => (
                            <TableRow key={rIndex}>
                                {row.map((cell, cIndex) => (
                                    <TableCell key={cIndex}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        case 'list':
            const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
            const listStyle = block.style === 'ordered' ? 'list-decimal' : 'list-disc';
            return (
                <ListTag key={blockIndex} className={`my-4 ml-6 ${listStyle}`}>
                    {block.items.map((item, iIndex) => (
                        <li key={iIndex} className="mb-1">{item}</li>
                    ))}
                </ListTag>
            );
        default:
            return null;
    }
  };


  const SelectionToolbar = () => {
    if (!selection) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if(!editorRect) return null;

    return (
        <div 
          className="absolute z-10 flex gap-1"
          style={{
            top: rect.top - editorRect.top - 40, // Position above selection
            left: rect.left - editorRect.left + (rect.width / 2) - 100, // Center on selection
          }}
        >
            <Button
              size="sm"
              onClick={handleParaphrase}
              disabled={isParaphrasing || isScanningSnippet}
              className="shadow-lg"
            >
              {isParaphrasing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PenLine className="mr-2 h-4 w-4" />
              )}
              Paraphrase
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleScanSnippet}
              disabled={isParaphrasing || isScanningSnippet}
              className="shadow-lg bg-background"
            >
              {isScanningSnippet ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ScanSearch className="mr-2 h-4 w-4" />
              )}
              Scan & Fix
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
      {<SelectionToolbar />}
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
                            placeholder="e.g., 'Add a bar chart comparing sales figures' or 'Make this more concise'"
                            value={regenerationInstructions}
                            onChange={(e) => setRegenerationInstructions(e.target.value)}
                          />
                       </div>
                       <Button
                         onClick={() => handleRegenerate(section.title)}
                         disabled={regeneratingSection === section.title}
                       >
                         {regeneratingSection === section.title ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                         Apply Edits
                       </Button>
                  </div>
              </PopoverContent>
            </Popover>
          </div>
            
            {Array.isArray(section.content) && section.content.map((block, blockIndex) => renderBlock(block, blockIndex, section, false))}


          {section.subSections && section.subSections.length > 0 && (
            <div className="ml-6 mt-4">
              {section.subSections.map((sub, subIndex) => (
                <div key={subIndex} className="mb-4 print:break-inside-avoid">
                  <h3 className="text-lg font-semibold mb-1">
                    {sub.title}
                  </h3>
                   {Array.isArray(sub.content) && sub.content.map((block, blockIndex) => renderBlock(block, blockIndex, sub, true, section))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
