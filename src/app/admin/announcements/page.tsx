
'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Megaphone, PlusCircle, Send, Info, Gift, AlertTriangle, Wrench, Upload, X, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

const audienceOptions = ['All Users', 'Students', 'Professors', 'Teachers', 'Researchers', 'Professionals'];
const typeOptions = ['Info', 'Promotion', 'Warning', 'Update'];

const initialFormState: Omit<Announcement, 'id' | 'createdAt' | 'status'> = {
  title: '',
  message: '',
  type: 'Info',
  audience: 'All Users',
  imageUrl: '',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleOpenDialog = (announcement: Announcement | null = null) => {
    if (announcement) {
        setEditingId(announcement.id);
        setFormData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            audience: announcement.audience,
            imageUrl: announcement.imageUrl,
        });
    } else {
        setEditingId(null);
        setFormData(initialFormState);
    }
    setIsDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast({ variant: 'destructive', title: "Missing fields", description: "Title and message are required." });
      return;
    }

    if (editingId) {
        // Update existing announcement
        const updatedAnnouncements = announcements.map(ann => 
            ann.id === editingId ? { ...ann, ...formData, id: editingId } : ann
        );
        saveAnnouncements(updatedAnnouncements);
        toast({ title: 'Announcement Updated!', description: `"${formData.title}" has been saved.` });
    } else {
        // Create new announcement
        const newAnnouncement: Announcement = {
            id: new Date().toISOString(),
            ...formData,
            createdAt: new Date().toISOString(),
            status: 'Sent',
        };
        const updatedAnnouncements = [newAnnouncement, ...announcements];
        saveAnnouncements(updatedAnnouncements);
        toast({ title: 'Announcement Sent!', description: `"${newAnnouncement.title}" has been published.` });
    }

    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };
  
  const handleDelete = (id: string) => {
    const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
    saveAnnouncements(updatedAnnouncements);
    toast({ variant: 'destructive', title: 'Announcement Deleted' });
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
            <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Create Announcement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Modify the details of your announcement.' : 'Compose a new message to be displayed to users.'}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto pr-4">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {formData.imageUrl ? (
                  <div className="relative">
                    <Image src={formData.imageUrl} alt="Image preview" width={400} height={200} className="w-full h-auto object-cover rounded-md" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Poster/Flyer (Optional)</Label>
                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Upload Image
                    </Button>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., System Maintenance Alert"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="e.g., We will be undergoing scheduled maintenance..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as Announcement['type'] })}
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
                      value={formData.audience}
                      onValueChange={(value) => setFormData({ ...formData, audience: value as Announcement['audience'] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {audienceOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="sticky bottom-0 bg-background/90 pt-4">
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit">
                    {editingId ? 'Save Changes' : <><Send className="mr-2 h-4 w-4" />Send Announcement</>}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <div key={announcement.id} className="p-4 border rounded-lg flex gap-4">
                {announcement.imageUrl && (
                  <Image src={announcement.imageUrl} alt={announcement.title} width={100} height={100} className="rounded-md object-cover hidden sm:block" />
                )}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant={getBadgeVariant(announcement.type)}>
                                    {getIcon(announcement.type)}
                                    {announcement.type}
                                </Badge>
                                <Badge variant="secondary">{announcement.audience}</Badge>
                            </div>
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground">{announcement.message}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenDialog(announcement)}>
                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this announcement.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(announcement.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
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
