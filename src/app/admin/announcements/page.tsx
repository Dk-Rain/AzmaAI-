
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/types/admin';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, PlusCircle, Send, Info, Gift, AlertTriangle, Wrench } from 'lucide-react';

const audienceOptions = ['All Users', 'Students', 'Professors', 'Teachers', 'Researchers', 'Professionals'];
const typeOptions = ['Info', 'Promotion', 'Warning', 'Update'];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'Info' as Announcement['type'],
    audience: 'All Users' as Announcement['audience'],
  });
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAnnouncements = localStorage.getItem('azma_announcements');
      if (storedAnnouncements) {
        setAnnouncements(JSON.parse(storedAnnouncements));
      }
    } catch (error) {
      console.error("Failed to load announcements from localStorage", error);
    }
  }, []);

  const saveAnnouncements = (newAnnouncements: Announcement[]) => {
    newAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAnnouncements(newAnnouncements);
    localStorage.setItem('azma_announcements', JSON.stringify(newAnnouncements));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast({ variant: 'destructive', title: "Missing fields", description: "Title and message are required." });
      return;
    }

    const announcement: Announcement = {
      id: new Date().toISOString(),
      ...newAnnouncement,
      createdAt: new Date().toISOString(),
      status: 'Sent',
    };

    const updatedAnnouncements = [announcement, ...announcements];
    saveAnnouncements(updatedAnnouncements);
    toast({ title: 'Announcement Sent!', description: `"${announcement.title}" has been published.` });
    setIsDialogOpen(false);
    setNewAnnouncement({ title: '', message: '', type: 'Info', audience: 'All Users' });
  };
  
  const getBadgeVariant = (type: Announcement['type']) => {
    switch(type) {
      case 'Promotion': return 'default';
      case 'Warning': return 'destructive';
      case 'Update': return 'secondary';
      default: return 'outline';
    }
  }

  const getIcon = (type: Announcement['type']) => {
      switch(type) {
        case 'Promotion': return <Gift className="h-4 w-4" />;
        case 'Warning': return <AlertTriangle className="h-4 w-4" />;
        case 'Update': return <Wrench className="h-4 w-4" />;
        default: return <Info className="h-4 w-4" />;
      }
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Megaphone /> Announcements</CardTitle>
          <CardDescription>
            Create and manage announcements for your users.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Announcement</DialogTitle>
              <DialogDescription>
                Compose a new message to be displayed to users.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="e.g., System Maintenance Alert"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  placeholder="e.g., We will be undergoing scheduled maintenance..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newAnnouncement.type}
                    onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, type: value as Announcement['type'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Audience</Label>
                  <Select
                    value={newAnnouncement.audience}
                    onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, audience: value as Announcement['audience'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit"><Send className="mr-2 h-4 w-4" />Send Announcement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <div key={announcement.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <Badge variant={getBadgeVariant(announcement.type)}>
                                {getIcon(announcement.type)}
                                {announcement.type}
                            </Badge>
                            <Badge variant="secondary">{announcement.audience}</Badge>
                        </div>
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground">{announcement.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Megaphone className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Announcements Yet</h3>
            <p className="mt-1 text-sm">Click "Create Announcement" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
