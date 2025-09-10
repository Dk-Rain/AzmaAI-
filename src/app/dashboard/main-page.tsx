'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, User, CreditCard, LogOut, Settings, ChevronDown, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentContent, References, StyleOptions } from '@/types';
import { academicTaskFormats } from '@/types/academic-task-formats';
import type { AcademicTaskType } from '@/types/academic-task-types';


import { ControlPanel } from '@/components/control-panel';
import { DocumentEditor } from '@/components/document-editor';
import { Button } from '@/components/ui/button';
import { exportDocxAction } from '@/app/actions';
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
  const [user, setUser] = useState<UserData | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const userData = localStorage.getItem('azmaUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // For demo purposes, let's assume 'Student' and 'Researcher' are premium for now
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

  const handleExport = async (format: 'docx' | 'pdf' | 'xls' | 'txt') => {
    setIsExporting(true);
    toast({
      title: 'Exporting Document',
      description: `Your document is being converted to .${format} format.`,
    });

    if (format !== 'docx') {
        // Placeholder for other formats
         setTimeout(() => {
            setIsExporting(false);
             toast({
                title: 'Export Successful',
                description: `Your document has been downloaded as a .${format} file.`,
            });
         }, 1500)
         return;
    }

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

  const isPremium = user?.isPremium || false;

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
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl truncate">
              {content.title}
            </h1>
          </div>
          
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
            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleExport('txt')}>
                        <FileText className="mr-2 h-4 w-4"/>
                        <span>Export to .txt</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('docx')} disabled={!isPremium}>
                        <FileType className="mr-2 h-4 w-4"/>
                        <span>Export to .docx</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={!isPremium}>
                        <FileType className="mr-2 h-4 w-4"/>
                        <span>Export to .pdf</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xls')} disabled={!isPremium}>
                        <FileSpreadsheet className="mr-2 h-4 w-4"/>
                        <span>Export to .xls</span>
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
