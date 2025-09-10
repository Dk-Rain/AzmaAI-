'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentContent, References, StyleOptions } from '@/types';
import { academicTaskFormats } from '@/types/academic-task-formats';
import type { AcademicTaskType } from '@/types/academic-task-types';


import { ControlPanel } from './control-panel';
import { DocumentEditor } from './document-editor';
import { Button } from './ui/button';
import { exportDocxAction } from '@/app/actions';

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


const initialContent: DocumentContent = {
  title: `New ${defaultTask} Title`,
  abstract:
    'This is a placeholder for your abstract. Generate content to begin.',
  sections,
};

export function MainPage() {
  const [content, setContent] = useState<DocumentContent>(initialContent);
  const [references, setReferences] = useState<References>([]);
  const [styles, setStyles] = useState<StyleOptions>({
    fontSize: 12,
    lineHeight: 1.5,
    margin: 2.54,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    toast({
      title: 'Exporting Document',
      description: 'Your document is being converted to .docx format.',
    });

    const { data, error } = await exportDocxAction(
      content,
      references,
      styles
    );

    setIsExporting(false);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error || 'An unknown error occurred.',
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data}`;
      const safeTitle = content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeTitle || 'document'}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Export Successful',
        description: 'Your document has been downloaded.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not trigger the file download.',
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-muted/30">
      <ControlPanel
        setContent={setContent}
        setReferences={setReferences}
        styles={styles}
        setStyles={setStyles}
        references={references}
        content={content}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <h1 className="text-lg font-semibold md:text-xl truncate">
            {content.title}
          </h1>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="ml-auto"
            size="sm"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export to .docx
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <DocumentEditor
            content={content}
            setContent={setContent}
            styles={styles}
          />
        </div>
      </main>
    </div>
  );
}

    