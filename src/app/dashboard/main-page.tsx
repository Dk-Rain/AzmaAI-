
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, User, CreditCard, LogOut, Settings, ChevronDown, FileText, FileSpreadsheet, FileType, Menu, ScanLine, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentContent, References, StyleOptions } from '@/types';
import { academicTaskFormats } from '@/types/academic-task-formats';
import type { AcademicTaskType } from '@/types/academic-task-types';
import type { DocumentHistoryEntry } from '@/types/admin';


import { ControlPanel } from '@/components/control-panel';
import { DocumentEditor } from '@/components/document-editor';
import { Button } from '@/components/ui/button';
import { exportTxtAction, exportCsvAction, scanAndCleanAction, checkPlagiarismAction } from '@/app/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScanningAnimation } from '@/components/scanning-animation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { CheckPlagiarismOutput } from '@/ai/flows/check-plagiarism';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const defaultTask: AcademicTaskType = 'Research Paper';
const format = academicTaskFormats[defaultTask];
const sections = format
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.startsWith('- '))
  .map(line => ({
    title: line.substring(2).trim(),
    content: [{ type: 'text' as const, text: `Placeholder for ${line.substring(2).trim()}` }],
  }));


const initialContent: DocumentContent = {
  title: `New ${defaultTask} Title`,
  sections,
};

type UserData = {
  fullName: string;
  role: string;
  username?: string;
  photoUrl?: string;
  isPremium?: boolean; // Let's assume this field exists
}

export function MainPage() {
  const [content, setContent] = useState<DocumentContent>(initialContent);
  const [references, setReferences] = useState<References>([]);
  const [styles, setStyles] = useState<StyleOptions>({
    fontSize: 12,
    lineHeight: 1.5,
    margin: 2.54,
    fontFamily: 'Literata',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<CheckPlagiarismOutput | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const userData = localStorage.getItem('azmaUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // For demo purposes, let's assume this field exists
      parsedUser.isPremium = ['Student', 'Researcher', 'Professor', 'Professional', 'Teacher'].includes(parsedUser.role);
      setUser(parsedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('azmaUser');
    toast({ title: 'Logged out successfully.' });
    router.push('/login');
  };
  
  const triggerDownload = (filename: string, content: string, mimeType: string) => {
     try {
      const link = document.createElement('a');
      link.href = `${mimeType},${encodeURIComponent(content)}`;
      const safeTitle = content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = filename;
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
  }


  const handleExport = async (format: 'docx' | 'pdf' | 'xls' | 'txt') => {
    setIsExporting(true);
    toast({
      title: 'Exporting Document',
      description: `Your document is being converted to .${format} format.`,
    });

    const safeTitle = (content.title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (format === 'pdf') {
        window.print();
        setIsExporting(false);
        toast({
            title: 'Print to PDF',
            description: 'Please use your browser\'s print dialog to save as PDF.'
        })
        return;
    }

    if (format === 'xls') {
        const { data, error } = await exportCsvAction(content, references);
        setIsExporting(false);
        if (error || !data) {
            return toast({ variant: 'destructive', title: 'Export Failed', description: error || 'An unknown error occurred.' });
        }
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeTitle}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return toast({ title: 'Export Successful', description: 'Your document has been downloaded as a .csv file.' });
    }

    if (format === 'txt') {
        const { data, error } = await exportTxtAction(content, references);
        setIsExporting(false);
        if (error || !data) {
            return toast({ variant: 'destructive', title: 'Export Failed', description: error || 'An unknown error occurred.' });
        }
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return toast({ title: 'Export Successful', description: 'Your document has been downloaded.' });
    }

    if (format === 'docx') {
      try {
        const response = await fetch('/api/generate-docx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, references, styles }),
        });

        setIsExporting(false);

        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        
        const { file, historyEntry } = await response.json();
        
        // Save history entry to localStorage
        try {
          const history = JSON.parse(localStorage.getItem('azma_document_history') || '[]');
          history.push(historyEntry);
          localStorage.setItem('azma_document_history', JSON.stringify(history));
        } catch (e) {
          console.error("Could not save document history to localStorage", e);
        }

        const blob = new Blob([Buffer.from(file, 'base64')], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeTitle}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        return toast({
          title: 'Export Successful',
          description: 'Your document has been downloaded.',
        });

      } catch (error) {
        setIsExporting(false);
        console.error('Download error:', error);
        return toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: 'An unknown error occurred while generating the docx file.',
        });
      }
    }
  };
  
  const handleScan = async () => {
    setIsScanning(true);
    toast({
        title: 'Scanning Document',
        description: 'Cleaning up formatting and checking for errors.',
    });

    const { data, error } = await scanAndCleanAction(content);

    setIsScanning(false);
    if (error || !data) {
        return toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: error || 'Could not clean the document.',
        });
    }

    setContent(data);
    toast({
        title: 'Scan Complete',
        description: 'Your document has been cleaned.',
    });
  };

  const handlePlagiarismCheck = async () => {
    setIsCheckingPlagiarism(true);
    toast({
      title: 'Checking for Plagiarism',
      description: 'The AI is analyzing your document for originality.',
    });

    const { data, error } = await checkPlagiarismAction(content);
    setIsCheckingPlagiarism(false);

    if (error || !data) {
      return toast({
        variant: 'destructive',
        title: 'Plagiarism Check Failed',
        description: error || 'Could not analyze the document.',
      });
    }

    setPlagiarismResult(data);
    // The dialog trigger is now controlled by the presence of plagiarismResult
    toast({
      title: 'Check Complete',
      description: data.summary,
    });
  };

  const isPremium = user?.isPremium || false;

  const showEditor = true;
  
  return (
    <div className="flex h-screen w-full bg-muted/30 print:block">
      <aside className="hidden md:flex w-[450px] border-r bg-background flex-col print:hidden">
         <ControlPanel
          setContent={setContent}
          setReferences={setReferences}
          styles={styles}
          setStyles={setStyles}
          references={references}
          content={content}
        />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 print:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-full max-w-sm">
                <ControlPanel
                    setContent={(newContent) => {
                        setContent(newContent);
                        setIsMobileMenuOpen(false);
                    }}
                    setReferences={(newRefs) => {
                        setReferences(newRefs);
                        setIsMobileMenuOpen(false);
                    }}
                    styles={styles}
                    setStyles={setStyles}
                    references={references}
                    content={content}
                />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl truncate" title={content.title}>
              {content.title}
            </h1>
          </div>

          <Button 
            onClick={handleScan} 
            disabled={isScanning || !isPremium} 
            size="sm"
            title={!isPremium ? "Upgrade to a premium plan to use this feature" : "Scan for errors"}
          >
            <ScanLine className="mr-2 h-4 w-4" />
            Scan
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting} size="sm">
                 {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
                <ChevronDown className="ml-2 h-4 w-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleExport('txt')}>
                        <FileText className="mr-2 h-4 w-4"/>
                        <span>Export to .txt</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('docx')}>
                        <FileType className="mr-2 h-4 w-4"/>
                        <span>Export to .docx</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                        <FileType className="mr-2 h-4 w-4"/>
                        <span>Export to .pdf</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xls')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4"/>
                        <span>Export to .csv (Excel)</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                {!isPremium && (
                    <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard/upgrade')} className="text-primary focus:text-primary">
                        <span>Upgrade for more options</span>
                    </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.photoUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.username || user?.fullName}`} alt={user?.fullName || 'User'}/>
                        <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/upgrade')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Upgrade Plan</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </header>
        {showEditor && <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0 print:overflow-visible relative">
          {isScanning && <ScanningAnimation />}
          <DocumentEditor
            content={content}
            setContent={setContent}
            styles={styles}
          />
           <Dialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <DialogTrigger asChild>
                            <Button 
                                onClick={handlePlagiarismCheck}
                                disabled={isCheckingPlagiarism || !isPremium}
                                size="icon"
                                className="rounded-full h-12 w-12 absolute bottom-8 right-8 z-10 shadow-lg"
                            >
                                {isCheckingPlagiarism ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <ShieldCheck className="h-6 w-6" />
                                )}
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>{!isPremium ? "Upgrade to check for plagiarism" : "Check for plagiarism"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {plagiarismResult && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Plagiarism Check Results</DialogTitle>
                        <DialogDescription>{plagiarismResult.summary}</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-80 overflow-y-auto">
                        {plagiarismResult.flaggedSections.length > 0 ? (
                            plagiarismResult.flaggedSections.map((item, index) => (
                                <div key={index} className="p-4 mb-2 border rounded-lg">
                                    <p className="font-semibold text-sm">"{item.text}"</p>
                                    <p className="text-xs text-muted-foreground mt-1">In section: <span className="font-medium">{item.sectionTitle}</span></p>
                                    <p className="text-xs text-destructive mt-1">{item.explanation}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-green-600">No potential plagiarism issues were found.</p>
                        )}
                    </div>
                </DialogContent>
            )}
           </Dialog>
        </div>}
      </main>
    </div>
  );
}

    