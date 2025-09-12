
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, X, Gift, Info, AlertTriangle, Wrench } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function NewsletterPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [status, setStatus] = useState<'hidden' | 'open' | 'minimized'>('hidden');

  useEffect(() => {
    try {
      const storedAnnouncements = localStorage.getItem('azma_announcements');
      if (storedAnnouncements) {
        const allAnnouncements: Announcement[] = JSON.parse(storedAnnouncements);
        if (allAnnouncements.length > 0) {
          // Get the most recent one
          setAnnouncement(allAnnouncements[0]);
          setStatus('open');
        }
      }
    } catch (error) {
      console.error("Failed to load announcements from localStorage", error);
    }
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
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => setStatus('minimized')}
            >
                <X />
            </Button>
            <CardHeader className="flex flex-col items-center text-center">
                {getIcon(announcement.type)}
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
