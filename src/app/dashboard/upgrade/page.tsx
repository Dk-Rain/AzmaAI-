
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
import { ArrowLeft, CheckCircle2, Star, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


type UserData = {
  role: string;
};

const pricing = {
    student: { monthly: 2000, yearly: 8000, name: 'Student Plan' },
    professional: { monthly: 2000, yearly: 8000, name: 'Professional Plan' },
    researcher: { monthly: 8000, yearly: 20000, name: 'Researcher Plan' },
    professor: { monthly: 8000, yearly: 20000, name: 'Professor Plan' },
    teacher: { monthly: 5000, yearly: 15000, name: 'Teacher Plan' },
};


export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
        const userData = localStorage.getItem('stipsLiteUser');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            router.push('/login');
        }
    } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        router.push('/login');
    }
  }, [router]);

  const handleUpgrade = () => {
    toast({
        title: 'Redirecting to checkout...',
        description: 'You will be redirected to complete your payment.'
    })
    // In a real app, you would redirect to a payment gateway like Stripe or Paystack.
  }
  
  const handleContactSales = () => {
    window.location.href = "mailto:sales@stipslite.com?subject=Enterprise%20Plan%20Inquiry";
  };

  const currentPlan = user?.role ? pricing[user.role.toLowerCase() as keyof typeof pricing] : null;

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
                        <CardTitle>{currentPlan?.name || 'StipsLite Premium'}</CardTitle>
                        <CardDescription>Premium Subscription for {user?.role}</CardDescription>
                        <div className="text-4xl font-bold">
                           ₦{currentPlan ? (isYearly ? currentPlan.yearly.toLocaleString() : currentPlan.monthly.toLocaleString()) : '...'}
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
                        <Button className="w-full" onClick={handleUpgrade}>Upgrade</Button>
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
              <CardHeader>
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
                      <TableHead>Free Plan (Trial)</TableHead>
                      <TableHead>StipsLite Premium</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">AI Words</TableCell>
                      <TableCell>1,000 / day</TableCell>
                      <TableCell>Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Documents</TableCell>
                      <TableCell>3 / day</TableCell>
                      <TableCell>Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Data Analysis Tools</TableCell>
                      <TableCell className="flex items-center gap-2"><XCircle className="h-5 w-5 text-muted-foreground" /> Limited</TableCell>
                      <TableCell className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Full Suite</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Diagram/Image Support</TableCell>
                      <TableCell className="flex items-center gap-2"><XCircle className="h-5 w-5 text-muted-foreground" /> None</TableCell>
                      <TableCell className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Advanced AI Diagrams</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Research Structures</TableCell>
                      <TableCell className="flex items-center gap-2"><XCircle className="h-5 w-5 text-muted-foreground" /> Not Included</TableCell>
                      <TableCell className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Pre-built Structures</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Export Formats</TableCell>
                      <TableCell>PDF, DOCX (basic only)</TableCell>
                      <TableCell>All formats (PDF, DOCX, PPT, XLS, etc.)</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Collaboration</TableCell>
                      <TableCell className="flex items-center gap-2"><XCircle className="h-5 w-5 text-muted-foreground" /> Single User</TableCell>
                      <TableCell className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Multi-user Access</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Customer Support</TableCell>
                      <TableCell>Community only</TableCell>
                      <TableCell>Priority Email + Live Chat</TableCell>
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
}
