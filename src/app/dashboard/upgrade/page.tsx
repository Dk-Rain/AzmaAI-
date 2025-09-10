
'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CheckCircle2, Star } from 'lucide-react';

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Link href="/dashboard">
            <Button size="icon" variant="outline" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Upgrade Your Plan</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid w-full max-w-5xl gap-4">
            <div className="flex justify-center items-center gap-2 my-4">
                <Label htmlFor="billing-cycle">Monthly</Label>
                <Switch 
                    id="billing-cycle"
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                />
                <Label htmlFor="billing-cycle">Yearly</Label>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>For trying things out</CardDescription>
                        <div className="text-4xl font-bold">$0 <span className="text-sm font-normal text-muted-foreground">/ forever</span></div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>1,000 AI Words/day</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>3 Documents/day</span>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </CardFooter>
                </Card>
                 <Card className="flex flex-col border-primary shadow-lg relative">
                    <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                        <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-full uppercase flex items-center gap-1">
                            <Star className="h-4 w-4"/>
                            Most Popular
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle>StipsLite Monthly</CardTitle>
                        <CardDescription>Monthly Subscription for StipsLite AI</CardDescription>
                        <div className="text-4xl font-bold">${isYearly ? '200' : '20'} <span className="text-sm font-normal text-muted-foreground">/ {isYearly ? 'year' : 'month'}</span></div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Unlimited AI Words</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Unlimited Documents</span>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <Button className="w-full">Upgrade</Button>
                    </CardFooter>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>For organizations</CardDescription>
                        <div className="text-4xl font-bold">Custom</div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Private Deployment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Custom Integrations</span>
                        </div>
                    </CardContent>
                     <CardFooter className="mt-auto">
                        <Button variant="outline" className="w-full">Contact Sales</Button>
                    </CardFooter>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
