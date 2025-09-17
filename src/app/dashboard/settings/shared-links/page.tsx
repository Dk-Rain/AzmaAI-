
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Trash2, Search, Library, Link2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Workspace, SharedDocument } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export default function SharedLinksPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            loadWorkspace(user.uid);
        } else {
            setWorkspace({ projects: [], standaloneDocuments: [], archivedItems: [], sharedDocuments: [] });
        }
    });
    return () => unsubscribe();
  }, []);

  const loadWorkspace = async (uid: string) => {
    const workspaceRef = doc(db, 'workspaces', uid);
    const workspaceSnap = await getDoc(workspaceRef);
    if (workspaceSnap.exists()) {
        const ws = workspaceSnap.data() as Workspace;
        ws.sharedDocuments = ws.sharedDocuments || [];
        setWorkspace(ws);
    } else {
        setWorkspace({ projects: [], standaloneDocuments: [], archivedItems: [], sharedDocuments: [] });
    }
  };

  const saveWorkspace = async (newWorkspace: Workspace) => {
    if (!userId) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to make changes.' });
        return;
    }
    setWorkspace(newWorkspace);
    const workspaceRef = doc(db, 'workspaces', userId);
    await setDoc(workspaceRef, newWorkspace, { merge: true });
  };


  const filteredShared = useMemo(() => {
    if (!workspace || !workspace.sharedDocuments) return [];
    if (!searchQuery) return workspace.sharedDocuments;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return workspace.sharedDocuments.filter(item => item.title.toLowerCase().includes(lowercasedQuery));
  }, [workspace, searchQuery]);

  const copyLink = (publicId: string) => {
    const url = `${window.location.origin}/share/${publicId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(publicId);
    setTimeout(() => setCopiedLink(null), 2000);
    toast({ title: 'Link Copied!'});
  };
  
  const revokeAccess = (publicId: string) => {
    if (!workspace) return;
    
    let docTitle = '';
    const newProjects = workspace.projects.map(p => ({
        ...p,
        documents: p.documents.map(d => {
            if (d.publicId === publicId) {
                docTitle = d.title;
                return { ...d, isShared: false, publicId: undefined };
            }
            return d;
        })
    }));
    const newStandaloneDocs = workspace.standaloneDocuments.map(d => {
        if (d.publicId === publicId) {
            docTitle = d.title;
            return { ...d, isShared: false, publicId: undefined };
        }
        return d;
    });

    const newSharedDocs = workspace.sharedDocuments.filter(item => item.publicId !== publicId);

    const newWorkspace: Workspace = {
        ...workspace,
        projects: newProjects,
        standaloneDocuments: newStandaloneDocs,
        sharedDocuments: newSharedDocs,
    };

    saveWorkspace(newWorkspace);
    toast({
      variant: 'destructive',
      title: 'Access Revoked',
      description: `The public link for "${docTitle}" has been disabled.`,
    });
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Link href="/dashboard/settings">
            <Button size="icon" variant="outline" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Settings</span>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Shared Links</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid w-full max-w-2xl gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Shared Links</CardTitle>
                <CardDescription>
                  Copy or revoke access to your publicly shared documents.
                </CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search shared documents..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {filteredShared.length > 0 ? (
                    filteredShared.map(item => (
                      <div key={item.publicId} className="flex items-center justify-between p-3 border-b group">
                        <div className='flex items-center gap-2'>
                          <Link2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">Shared on: {new Date(item.sharedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="outline" size="sm" onClick={() => copyLink(item.publicId)}>
                            {copiedLink === item.publicId ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4" />}
                          </Button>

                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Link?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will make the public link invalid. You can always share it again later. Are you sure?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => revokeAccess(item.publicId)}>Revoke</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground p-8">
                      <Library className="mx-auto h-10 w-10 mb-2" />
                      <p className="font-semibold">No Shared Documents</p>
                      <p>Use the "Share" option on a document to create a public link.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                  <p className="text-xs text-muted-foreground">
                      You have {filteredShared.length} document(s) shared publicly.
                  </p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
