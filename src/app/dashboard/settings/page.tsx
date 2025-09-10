'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Brush, User } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();

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
                            <div className="flex items-center gap-2">
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
                            </div>
                        </div>
                    </CardContent>
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
