
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
import { ArrowLeft, ArchiveRestore, Trash2, Search, Library, Folder, File } from 'lucide-react';
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
import type { Workspace, ArchivedItem, DocumentItem, Project } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export default function ArchivedChatsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            loadWorkspace(user.uid);
        } else {
            // Handle user not logged in case
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
        // Ensure archivedItems exists
        ws.archivedItems = ws.archivedItems || [];
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


  const filteredArchived = useMemo(() => {
    if (!workspace || !workspace.archivedItems) return [];
    if (!searchQuery) return workspace.archivedItems;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return workspace.archivedItems.filter(item => {
        const name = item.itemType === 'project' ? item.name : item.title;
        return name.toLowerCase().includes(lowercasedQuery);
    });
  }, [workspace, searchQuery]);

  const unarchiveItem = (id: string) => {
    if (!workspace) return;
    const itemToUnarchive = workspace.archivedItems.find(item => item.id === id);
    if (!itemToUnarchive) return;

    const newWorkspace = { ...workspace };
    // Remove from archive
    newWorkspace.archivedItems = newWorkspace.archivedItems.filter(item => item.id !== id);

    // Add back to active items
    if (itemToUnarchive.itemType === 'project') {
        const { itemType, ...project } = itemToUnarchive as ArchivedItem & {itemType: 'project'};
        newWorkspace.projects = [project as Project, ...(newWorkspace.projects || [])];
    } else {
        const { itemType, ...document } = itemToUnarchive as ArchivedItem & {itemType: 'document'};
        newWorkspace.standaloneDocuments = [document as DocumentItem, ...(newWorkspace.standaloneDocuments || [])];
    }

    saveWorkspace(newWorkspace);
    toast({
      title: 'Item Unarchived',
      description: 'The item has been restored.',
    });
  };
  
  const deleteItem = (id: string) => {
    if (!workspace) return;
    const newWorkspace = {
        ...workspace,
        archivedItems: workspace.archivedItems.filter(item => item.id !== id),
    };
    saveWorkspace(newWorkspace);
    toast({
      variant: 'destructive',
      title: 'Item Deleted Permanently',
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
          <h1 className="text-xl font-semibold">Archived Items</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid w-full max-w-2xl gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Archives</CardTitle>
                <CardDescription>
                  Restore or permanently delete your archived projects and documents.
                </CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search archives..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {filteredArchived.length > 0 ? (
                    filteredArchived.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border-b group">
                        <div className='flex items-center gap-2'>
                          {item.itemType === 'project' ? <Folder className="h-5 w-5 text-primary" /> : <File className="h-5 w-5 text-muted-foreground" />}
                          <div>
                            <p className="font-medium">{item.itemType === 'project' ? item.name : item.title}</p>
                            <p className="text-sm text-muted-foreground">Archived on: {new Date(item.id).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => unarchiveItem(item.id)}>
                            <ArchiveRestore className="h-4 w-4 mr-2" />
                            Restore
                          </Button>

                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  item.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteItem(item.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground p-8">
                      <Library className="mx-auto h-10 w-10 mb-2" />
                      <p className="font-semibold">No Archived Items</p>
                      <p>Your archived projects and documents will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                  <p className="text-xs text-muted-foreground">
                      You have {filteredArchived.length} item(s) in your archive.
                  </p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
