
'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ArrowLeft, Brush, User, Globe, Bell, Mail, Smartphone, Share2, Archive, Trash2, Database, Cloud, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useGoogleLogin } from '@react-oauth/google';
import type { Workspace } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';


export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [pushNotificationStatus, setPushNotificationStatus] = useState<NotificationPermission>('default');
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);


  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushNotificationStatus(Notification.permission);
      setIsPushEnabled(Notification.permission === 'granted');
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user) {
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePushToggle = async (checked: boolean) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Push notifications are not supported in this browser.',
      });
      return;
    }
    
    if (checked) {
      if (pushNotificationStatus === 'granted') {
        setIsPushEnabled(true);
        toast({ title: 'Push notifications are already enabled.' });
        return;
      }

      if (pushNotificationStatus === 'denied') {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You have previously blocked notifications. Please enable them in your browser settings.',
        });
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPushNotificationStatus(permission);

      if (permission === 'granted') {
        setIsPushEnabled(true);
        toast({ title: 'Push Notifications Enabled!', description: "You'll be notified of important updates." });
        // In a real app, you would now get the subscription and send it to your server.
        // e.g., navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription().then(sub => ...));
      } else {
        setIsPushEnabled(false);
        toast({
          variant: 'destructive',
          title: 'Permission Not Granted',
          description: 'You will not receive push notifications.',
        });
      }
    } else {
      // Logic for disabling push notifications (e.g., telling the server to remove the subscription)
      setIsPushEnabled(false);
      toast({ title: 'Push Notifications Disabled', description: 'You can re-enable them anytime.' });
    }
  };


  const handleArchiveAll = () => {
    // In a real app, you would have logic to archive all chats.
    // For this demo, we can just show a toast.
    toast({
      title: 'Action Not Implemented',
      description: 'Archiving all chats is not yet available.',
    });
  };

  const handleDeleteAll = () => {
    try {
      localStorage.removeItem('azma_workspace');
      toast({
        variant: 'destructive',
        title: 'All Projects Deleted',
        description: 'Your entire workspace has been cleared.',
      });
      // Reload to reflect the cleared state
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete workspace from localStorage", error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not clear your workspace.',
      });
    }
  };
  
  const handleConnectGoogleDrive = useGoogleLogin({
    onSuccess: async (codeResponse) => {
        if (!userId) {
             toast({ variant: 'destructive', title: 'Error', description: 'User not found. Cannot sync archive.'});
             return;
        }

        setIsSyncing(true);
        toast({
            title: 'Permissions Granted!',
            description: 'Syncing your archive to Google Drive...',
        });

        // 1. Fetch the user's workspace to get archived items
        const workspaceRef = doc(db, 'workspaces', userId);
        const workspaceSnap = await getDoc(workspaceRef);
        const archivedItems = workspaceSnap.exists() ? (workspaceSnap.data() as Workspace).archivedItems : [];
        
        // 2. Send the one-time code AND the archive data to our backend
        try {
            const response = await fetch('/api/google/oauth-callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: codeResponse.code, archive: archivedItems }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server-side token exchange failed.');
            }

            const data = await response.json();
            toast({
                title: 'Google Drive Sync Complete!',
                description: data.message,
            });
            setIsGoogleDriveConnected(true);

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Sync Failed',
                description: error.message,
            });
        } finally {
            setIsSyncing(false);
        }
    },
    onError: (error) => {
        console.error('Google login error', error);
        toast({
            variant: 'destructive',
            title: 'Google Connection Failed',
            description: 'Could not get permission from Google.',
        });
    },
    flow: 'auth-code', // This is crucial to get the one-time code for your backend
    scope: 'https://www.googleapis.com/auth/drive.file', // Request permission to create files
  });

  const handleDisconnectGoogleDrive = () => {
    // In a real app, you would make an API call to your backend here to revoke the token.
    // For this prototype, we'll just update the client-side state.
    setIsGoogleDriveConnected(false);
    toast({
        title: 'Google Drive Disconnected',
        description: 'Your account is no longer linked to Google Drive.',
    });
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Link href="/dashboard">
                <Button size="icon" variant="outline" className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-xl font-semibold">Settings</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid w-full max-w-2xl gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Brush /> Appearance</CardTitle>
                        <CardDescription>
                            Customize the look and feel of the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="font-medium">Theme</div>
                            <div className="text-sm text-muted-foreground">Select your preferred theme.</div>
                            {mounted && <div className="flex items-center gap-2">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    onClick={() => setTheme('light')}
                                >
                                    Light
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    onClick={() => setTheme('dark')}
                                >
                                    Dark
                                </Button>
                                <Button
                                     variant={theme === 'system' ? 'default' : 'outline'}
                                     onClick={() => setTheme('system')}
                                >
                                    System
                                </Button>
                            </div>}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                        <CardDescription>
                            Configure how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                       <div className="flex items-center justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">Responses</h4>
                            <p className="text-sm text-muted-foreground">
                                Get notified when AI responds to requests that take time, like research or image generation.
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                             <Smartphone className="h-5 w-5 text-muted-foreground"/>
                             <Switch
                                id="responses-push"
                                checked={isPushEnabled}
                                onCheckedChange={handlePushToggle}
                              />
                          </div>
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">Tasks</h4>
                             <p className="text-sm text-muted-foreground">
                                Get notified when tasks you’ve created have updates.
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                               <Smartphone className="h-5 w-5 text-muted-foreground"/>
                               <Switch id="tasks-push" defaultChecked/>
                            </div>
                            <div className="flex items-center space-x-2">
                               <Mail className="h-5 w-5 text-muted-foreground"/>
                               <Switch id="tasks-email" />
                            </div>
                          </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/dashboard">
                        <Button variant="outline">Manage tasks</Button>
                      </Link>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe /> Language</CardTitle>
                        <CardDescription>
                            Set your preferred language for the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <Label htmlFor="language-select">Language</Label>
                             <Select defaultValue="en">
                                <SelectTrigger id="language-select">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                    <SelectItem value="pt">Português</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database /> Data Controls</CardTitle>
                        <CardDescription>
                            Manage your data and privacy settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                       <div className="flex items-center justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">Improve the model for everyone</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                             <Switch id="improve-model-for-everyone" defaultChecked />
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">Google Drive Sync</h4>
                            <p className="text-sm text-muted-foreground">
                                Back up your archived projects and documents to Google Drive.
                            </p>
                          </div>
                           {isGoogleDriveConnected ? (
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" disabled>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                        Connected
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={handleDisconnectGoogleDrive} title="Disconnect Google Drive">
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                          ) : (
                            <Button variant="outline" onClick={() => handleConnectGoogleDrive()} disabled={isSyncing}>
                                {isSyncing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Syncing...</>
                                ) : (
                                    <><Cloud className="mr-2 h-4 w-4" /> Connect & Sync</>
                                )}
                            </Button>
                          )}
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">Shared links</h4>
                          </div>
                          <Link href="/dashboard/settings/shared-links">
                            <Button variant="outline">
                              <Share2 className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </Link>
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">Archived chats</h4>
                          </div>
                          <Link href="/dashboard/settings/archived">
                            <Button variant="outline">
                              <Archive className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </Link>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                      <div className="flex items-center justify-between w-full">
                           <h4 className="font-medium">Archive all chats</h4>
                           <Button variant="outline" onClick={handleArchiveAll}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive all
                           </Button>
                      </div>
                      <div className="flex items-center justify-between w-full">
                           <h4 className="font-medium">Delete all chats</h4>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete all
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all of
                                    your projects and documents from your browser's storage.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                      </div>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> Account</CardTitle>
                        <CardDescription>
                           Manage your account settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/profile">
                            <Button variant="outline">Go to Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
      </div>
    </div>
  );
}
