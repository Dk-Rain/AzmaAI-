
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
import { Trash2, KeyRound, Building, Brush, Tag, Megaphone, Loader2, Cpu } from "lucide-react";
import { useTheme } from "next-themes";
import type { PricingSettings, AppSettings as AppSettingsType } from '@/types/admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


const initialSettings: AppSettingsType = {
    appName: 'AzmaAI',
    allowRegistrations: true,
    defaultUserRole: 'Student',
    maintenanceMode: false,
    paymentGatewayPublicKey: '',
    paymentGatewaySecretKey: '',
    googleAdsenseClientId: '',
    defaultModel: 'googleai/gemini-2.5-pro',
};

const initialPricing: PricingSettings = {
    student: { monthly: 2000, yearly: 8000 },
    professional: { monthly: 2000, yearly: 8000 },
    researcher: { monthly: 8000, yearly: 20000 },
    professor: { monthly: 8000, yearly: 20000 },
    teacher: { monthly: 5000, yearly: 15000 },
};

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<AppSettingsType>(initialSettings);
    const [pricing, setPricing] = useState<PricingSettings>(initialPricing);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');


    useEffect(() => {
        setMounted(true);
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsDocRef = doc(db, 'settings', 'global');
                const settingsDoc = await getDoc(settingsDocRef);
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data();
                    setSettings(prev => ({...prev, ...data.appSettings}));
                    setPricing(prev => ({...prev, ...data.pricingSettings}));
                }
            } catch (error) {
                console.error("Failed to fetch settings from Firestore:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load settings from the database.'})
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);
    
    const handlePricingChange = (role: keyof PricingSettings, cycle: 'monthly' | 'yearly', value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        setPricing(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [cycle]: numericValue,
            }
        }));
    };


    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsDocRef = doc(db, 'settings', 'global');
            await setDoc(settingsDocRef, {
                appSettings: settings,
                pricingSettings: pricing,
            }, { merge: true });

            toast({
                title: 'Settings Saved',
                description: 'Your changes have been successfully saved to the database.',
            });
        } catch (error) {
            console.error("Failed to save settings to Firestore:", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save settings to the database.',
            })
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearData = () => {
        try {
            localStorage.removeItem('azma_workspace');
            localStorage.removeItem('azma_document_history');
            toast({
                variant: 'destructive',
                title: 'Local Data Cleared',
                description: 'Local workspace and history has been cleared from this browser.',
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Failed to Clear Data',
                description: 'Could not clear data from localStorage.',
            });
        } finally {
            setDeleteConfirmation('');
        }
    }
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }


  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brush /> Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of the admin dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">Select a theme for the admin interface.</div>
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
                <CardTitle className="flex items-center gap-2"><Cpu /> Default Generative Model</CardTitle>
                <CardDescription>
                    Choose the default generative model for content creation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <Label htmlFor="default-model">Default Generative Model</Label>
                    <Select
                        value={settings.defaultModel}
                        onValueChange={(value) => setSettings({...settings, defaultModel: value as AppSettingsType['defaultModel']})}
                    >
                        <SelectTrigger id="default-model" className="w-full md:w-1/2">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="googleai/gemini-2.5-pro">Google - Gemini 2.5 Pro (Recommended)</SelectItem>
                            <SelectItem value="googleai/gemini-2.5-flash">Google - Gemini 2.5 Flash (Fast)</SelectItem>
                        </SelectContent>
                    </Select>
                     <p className="text-xs text-muted-foreground">
                        Ensure the appropriate API keys are set in your environment for the selected provider.
                    </p>
                </div>
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Tag /> Subscription Pricing</CardTitle>
                <CardDescription>
                    Set the monthly and yearly prices for each subscription plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.keys(pricing).map(role => (
                    <div key={role} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg">
                        <div className="md:col-span-1">
                            <Label className="capitalize font-semibold">{role} Plan</Label>
                            <p className="text-xs text-muted-foreground">Prices in NGN.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`price-${role}-monthly`}>Monthly Price</Label>
                            <Input
                                id={`price-${role}-monthly`}
                                type="number"
                                value={pricing[role as keyof PricingSettings].monthly}
                                onChange={(e) => handlePricingChange(role as keyof PricingSettings, 'monthly', e.target.value)}
                                placeholder="e.g., 2000"
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor={`price-${role}-yearly`}>Yearly Price</Label>
                            <Input
                                id={`price-${role}-yearly`}
                                type="number"
                                value={pricing[role as keyof PricingSettings].yearly}
                                onChange={(e) => handlePricingChange(role as keyof PricingSettings, 'yearly', e.target.value)}
                                placeholder="e.g., 20000"
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Application Status</CardTitle>
                 <CardDescription>
                    Control the accessibility of the application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                        <span>Maintenance Mode</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        When enabled, users will be shown a maintenance page.
                        </span>
                    </Label>
                    <Switch
                        id="maintenance-mode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                    />
                </div>
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
                <CardTitle className="flex items-center gap-2"><KeyRound /> Payment Gateway</CardTitle>
                <CardDescription>
                    Configure API keys for your payment provider (e.g., Flutterwave, Paystack).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="public-key">Public Key</Label>
                    <Input 
                        id="public-key"
                        placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={settings.paymentGatewayPublicKey}
                        onChange={(e) => setSettings({...settings, paymentGatewayPublicKey: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="secret-key">Secret Key</Label>
                    <Input 
                        id="secret-key"
                        type="password"
                        placeholder="sk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={settings.paymentGatewaySecretKey}
                        onChange={(e) => setSettings({...settings, paymentGatewaySecretKey: e.target.value})}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone /> Advertising</CardTitle>
                <CardDescription>
                    Configure monetization settings for free-plan users.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="adsense-client-id">Google AdSense Client ID</Label>
                    <Input 
                        id="adsense-client-id"
                        placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                        value={settings.googleAdsenseClientId || ''}
                        onChange={(e) => setSettings({...settings, googleAdsenseClientId: e.target.value})}
                    />
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription className="text-destructive">
                This section is for local browser data only. It does not affect the production database.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Local User Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will clear any workspace data (projects, documents, history) saved in this browser's local storage. It will not affect database records. This is a non-destructive action for the database and is primarily for local debugging.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="pt-2">
                            <Label htmlFor="delete-confirm">To confirm, type "delete" below:</Label>
                            <Input 
                            id="delete-confirm"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="mt-1"
                            autoFocus
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleClearData} 
                                disabled={deleteConfirmation !== 'delete'}
                            >
                                Clear Local Data
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
    </div>
  )
}
