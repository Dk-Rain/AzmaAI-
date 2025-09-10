'use client';

import { useState } from 'react';
import type { DocumentContent, Section, StyleOptions } from '@/types';
import { Button } from './ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { regenerateSectionAction } from '@/app/actions';
import { cn } from '@/lib/utils';

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
  const { toast } = useToast();

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
    setRegeneratingSection(sectionTitle);
    toast({
      title: 'Regenerating Section...',
      description: `The AI is rewriting "${sectionTitle}".`,
    });

    const { data, error } = await regenerateSectionAction(content, sectionTitle);
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

  const handleAbstractBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newAbstract = e.currentTarget.innerText;
    if (newAbstract !== content.abstract) {
        setContent(prev => ({...prev, abstract: newAbstract}));
    }
  }

  return (
    <div
      className={cn(
        "max-w-4xl mx-auto bg-card p-[var(--margin-cm)] shadow-lg rounded-lg printable-area",
        fontClassMap[styles.fontFamily]
        )}
      style={paperStyles}
    >
      <h1
        className="text-3xl font-bold text-center mb-6"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTitleBlur}
      >
        {content.title}
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Abstract</h2>
        <div
          className="text-muted-foreground italic"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleAbstractBlur}
        >
          {content.abstract}
        </div>
      </div>

      {content.sections.map((section, index) => (
        <div key={index} className="mb-6 group relative print:break-inside-avoid">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold mb-2">
              {section.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
              onClick={() => handleRegenerate(section.title)}
              disabled={!!regeneratingSection}
            >
              {regeneratingSection === section.title ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleBlur(e, section)}
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
