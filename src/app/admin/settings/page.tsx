
'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type AppSettings = {
    appName: string;
    allowRegistrations: boolean;
    defaultUserRole: string;
};

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<AppSettings>({
        appName: 'AzmaAI',
        allowRegistrations: true,
        defaultUserRole: 'Student',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem('azma_app_settings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (error) {
            console.error('Failed to load settings from localStorage', error);
        }
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate saving to backend/localStorage
        setTimeout(() => {
            try {
                localStorage.setItem('azma_app_settings', JSON.stringify(settings));
                toast({
                    title: 'Settings Saved',
                    description: 'Your changes have been successfully saved.',
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Save Failed',
                    description: 'Could not save settings to localStorage.',
                })
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleClearData = () => {
        try {
            localStorage.removeItem('azma_all_users');
            localStorage.removeItem('azmaUser');
            localStorage.removeItem('azma_workspace');
            toast({
                variant: 'destructive',
                title: 'All User Data Cleared',
                description: 'Please reload the page for changes to take full effect.',
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Failed to Clear Data',
                description: 'Could not clear data from localStorage.',
            });
        }
    }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                Manage global application settings and configurations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="app-name">Application Name</Label>
                        <Input
                            id="app-name"
                            value={settings.appName}
                            onChange={(e) => setSettings({...settings, appName: e.target.value})}
                        />
                    </div>
                </form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                Control user registration and default roles.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="allow-registrations" className="flex flex-col space-y-1">
                        <span>Allow New User Registrations</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        Enable or disable the ability for new users to sign up.
                        </span>
                    </Label>
                    <Switch
                        id="allow-registrations"
                        checked={settings.allowRegistrations}
                        onCheckedChange={(checked) => setSettings({...settings, allowRegistrations: checked})}
                    />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="default-role">Default User Role</Label>
                    <Select
                        value={settings.defaultUserRole}
                        onValueChange={(value) => setSettings({...settings, defaultUserRole: value})}
                    >
                        <SelectTrigger id="default-role" className="w-full md:w-1/2">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Teacher">Teacher</SelectItem>
                            <SelectItem value="Researcher">Researcher</SelectItem>
                            <SelectItem value="Professor">Professor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription className="text-destructive">
                Warning: These are destructive actions and cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All User Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all user accounts and their associated data from local storage.
                                This is useful for resetting the application demo.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData}>Delete All Data</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
    </div>
  )
}
