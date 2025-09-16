
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CheckCircle2, Loader2, Star, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { PricingSettings } from '@/types/admin';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


type UserData = {
  uid: string;
  role: string;
  isPremium?: boolean;
};

const defaultPricing: PricingSettings = {
    student: { monthly: 2000, yearly: 8000 },
    professional: { monthly: 2000, yearly: 8000 },
    researcher: { monthly: 8000, yearly: 20000 },
    professor: { monthly: 8000, yearly: 20000 },
    teacher: { monthly: 5000, yearly: 15000 },
};


export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [pricing, setPricing] = useState<PricingSettings>(defaultPricing);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({ uid: firebaseUser.uid, ...userData } as UserData);
            } else {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    });

    try {
        const storedPricing = localStorage.getItem('azma_pricing_settings');
        if (storedPricing) {
            setPricing(JSON.parse(storedPricing));
        }
    } catch (error) {
        console.error("Failed to parse pricing data from localStorage", error);
    }
    
    return () => unsubscribe();
  }, [router]);

  const handleUpgrade = async () => {
    if (!user) return;
    setIsUpgrading(true);
    toast({
        title: 'Processing Upgrade...',
        description: 'Please wait while we confirm your payment.'
    })
    
    // Simulate API call to payment gateway and DB update
    setTimeout(async () => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { isPremium: true });
            
            // Update local user state to reflect the change immediately
            setUser(prevUser => prevUser ? { ...prevUser, isPremium: true } : null);

            toast({
                title: 'Upgrade Successful!',
                description: 'Welcome to your new plan.'
            });

        } catch (error) {
            console.error("Upgrade failed:", error);
            toast({
                variant: 'destructive',
                title: 'Upgrade Failed',
                description: 'Could not update your plan. Please try again.'
            })
        } finally {
            setIsUpgrading(false);
        }
    }, 1500);
  }
  
  const handleContactSales = () => {
    window.location.href = "mailto:sales@azma.com?subject=Enterprise%20Plan%20Inquiry";
  };

  const getPlanName = (role: string) => {
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Plan`;
  }
  
  const currentPlanRole = user?.role ? user.role.toLowerCase() as keyof PricingSettings : null;
  const currentPlanPriceInfo = currentPlanRole ? pricing[currentPlanRole] : null;


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
                        <div className="text-4xl font-bold">₦0 <span className="text-sm font-normal text-muted-foreground">/ forever</span></div>
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
                        <Button variant="outline" className="w-full" disabled={!user?.isPremium}>
                            {user?.isPremium ? 'Downgrade (Not available)' : 'Your Current Plan'}
                        </Button>
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
                        <CardTitle>{currentPlanRole ? getPlanName(currentPlanRole) : 'AZMA Premium'}</CardTitle>
                        <CardDescription>Premium Subscription for {user?.role}</CardDescription>
                        <div className="text-4xl font-bold">
                           ₦{currentPlanPriceInfo ? (isYearly ? currentPlanPriceInfo.yearly.toLocaleString() : currentPlanPriceInfo.monthly.toLocaleString()) : '...'}
                           <span className="text-sm font-normal text-muted-foreground">/ {isYearly ? 'year' : 'month'}</span>
                        </div>
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
                        <Button className="w-full" onClick={handleUpgrade} disabled={user?.isPremium || isUpgrading}>
                          {isUpgrading ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upgrading...</>
                          ) : user?.isPremium ? (
                              'Your Current Plan'
                          ) : (
                              'Upgrade'
                          )}
                        </Button>
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
                        <Button variant="outline" className="w-full" onClick={handleContactSales}>Contact Sales</Button>
                    </CardFooter>
                </Card>
            </div>
             <Card className="mt-8">
              <CardHeader className="text-center">
                <CardTitle>Feature Comparison</CardTitle>
                <CardDescription>
                  See what you get with each plan at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Feature</TableHead>
                      <TableHead className="text-center">Free Plan (Trial)</TableHead>
                      <TableHead className="text-center">AZMA Premium</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">AI Words</TableCell>
                      <TableCell className="text-center">1,000 / day</TableCell>
                      <TableCell className="text-center">Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Documents</TableCell>
                      <TableCell className="text-center">3 / day</TableCell>
                      <TableCell className="text-center">Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Data Analysis Tools</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                          <span>Limited</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <span>Full Suite</span>
                        </div>
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Diagram/Image Support</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                            <span>None</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Advanced AI Diagrams</span>
                        </div>
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Research Structures</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                            <span>Not Included</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Pre-built Structures</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Export Formats</TableCell>
                      <TableCell className="text-center">PDF, DOCX (basic only)</TableCell>
                      <TableCell className="text-center">All formats (PDF, DOCX, PPT, XLS, etc.)</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Collaboration</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                            <span>Single User</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Multi-user Access</span>
                        </div>
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Customer Support</TableCell>
                      <TableCell className="text-center">Community only</TableCell>
                      <TableCell className="text-center">Priority Email + Live Chat</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );

    