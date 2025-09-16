
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, X, Gift, Info, AlertTriangle, Wrench } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';


const fallbackAnnouncement: Announcement = {
  id: 'fallback-1',
  title: 'Stay Updated!',
  message: "This is where you'll find the latest news, updates, and promotions from AzmaAI. Announcements created by an admin will appear here.",
  type: 'Info',
  audience: 'All Users',
  createdAt: new Date().toISOString(),
  status: 'Sent',
};


export function NewsletterPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [status, setStatus] = useState<'hidden' | 'open' | 'minimized'>('hidden');

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
        try {
            const announcementsCollection = collection(db, 'announcements');
            const q = query(announcementsCollection, orderBy("createdAt", "desc"), limit(1));
            const announcementSnapshot = await getDocs(q);

            if (!announcementSnapshot.empty) {
                const latestAnnouncement = announcementSnapshot.docs[0].data() as Announcement;
                latestAnnouncement.id = announcementSnapshot.docs[0].id;
                setAnnouncement(latestAnnouncement);
            } else {
                setAnnouncement(fallbackAnnouncement);
            }
            setStatus('open');
        } catch (error) {
            console.error("Failed to load announcements from Firestore", error);
            setAnnouncement(fallbackAnnouncement);
            setStatus('open');
        }
    };
    fetchLatestAnnouncement();
  }, []);

  useEffect(() => {
    if (status === 'open') {
      const timer = setTimeout(() => {
        setStatus('minimized');
      }, 15000); // Auto-minimize after 15 seconds

      return () => clearTimeout(timer);
    }
  }, [status]);
  
  const getIcon = (type: Announcement['type']) => {
      switch(type) {
        case 'Promotion': return <Gift className="h-6 w-6 text-primary" />;
        case 'Warning': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case 'Update': return <Wrench className="h-6 w-6 text-blue-500" />;
        default: return <Info className="h-6 w-6 text-foreground" />;
      }
  }


  if (!announcement || status === 'hidden') {
    return null;
  }

  if (status === 'minimized') {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setStatus('open')}
        >
          <Megaphone className="h-7 w-7" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <Card className={cn(
            "w-full max-w-md relative animate-in fade-in-0 zoom-in-95",
            "dark:bg-slate-900/80 dark:backdrop-blur-sm"
        )}>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-7 w-7 z-10"
                onClick={() => setStatus('minimized')}
            >
                <X />
            </Button>
            {announcement.imageUrl && (
              <div className="relative w-full h-48">
                <Image src={announcement.imageUrl} alt={announcement.title} layout="fill" objectFit="cover" className="rounded-t-lg" />
              </div>
            )}
            <CardHeader className="flex flex-col items-center text-center pt-6">
                {!announcement.imageUrl && getIcon(announcement.type)}
                <CardTitle>{announcement.title}</CardTitle>
                <div className="flex gap-2">
                    <Badge variant="secondary">{announcement.audience}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">{announcement.message}</p>
            </CardContent>
        </Card>
    </div>
  );
}

    