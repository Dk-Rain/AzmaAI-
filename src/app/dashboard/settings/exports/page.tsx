
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
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, FileClock, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentHistoryEntry } from '@/types/admin';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';


export default function ExportHistoryPage() {
  const [history, setHistory] = useState<DocumentHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            fetchHistory(user.uid);
        } else {
            setIsLoading(false);
        }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (uid: string) => {
    setIsLoading(true);
    try {
      const exportsCollectionRef = collection(db, 'users', uid, 'exports');
      const q = query(exportsCollectionRef, orderBy('generatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const exportsList = querySnapshot.docs.map(doc => doc.data() as DocumentHistoryEntry);
      setHistory(exportsList);
    } catch (error) {
      console.error("Failed to fetch export history:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your export history.' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return history.filter(item => 
        item.title.toLowerCase().includes(lowercasedQuery) ||
        item.docId.toLowerCase().includes(lowercasedQuery)
    );
  }, [history, searchQuery]);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast({ title: 'Document ID Copied!' });
    setTimeout(() => setCopiedId(null), 2000);
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
          <h1 className="text-xl font-semibold">Export History</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid w-full max-w-3xl gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Exported Documents</CardTitle>
                <CardDescription>
                  A list of all documents you have exported, along with their unique verification IDs.
                </CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search by title or document ID..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {isLoading ? (
                     <div className="text-center text-sm text-muted-foreground p-8">Loading history...</div>
                  ) : filteredHistory.length > 0 ? (
                    filteredHistory.map(item => (
                      <div key={item.docId} className="flex items-start justify-between p-3 border-b group">
                        <div className='flex items-center gap-3'>
                          <FileClock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-grow">
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground font-mono break-all">{item.docId}</p>
                            <p className="text-xs text-muted-foreground">Exported on: {new Date(item.generatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(item.docId)}>
                            {copiedId === item.docId ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground p-8">
                      <p className="font-semibold">No Export History</p>
                      <p>Documents you export will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
