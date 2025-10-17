

'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ArrowLeft, CheckCircle2, Loader2, Star, XCircle, CalendarClock, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { PricingSettings, Transaction, PromoCode as PromoCodeType, PlanPricing } from '@/types/admin';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Input } from '@/components/ui/input';
import { verifyUpgradePromoCodeAction, redeemPromoCode } from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';


type UserData = {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  isPremium?: boolean;
  subscriptionEndDate?: string;
  phoneNumber?: string;
};

const defaultPlanPricing: PlanPricing = {
    monthly: 0,
    yearly: 0,
    monthlyDiscount: 0,
    yearlyDiscount: 0,
    isDiscountActive: false,
};

const defaultPricing: PricingSettings = {
    student: { ...defaultPlanPricing, monthly: 2000, yearly: 8000 },
    professional: { ...defaultPlanPricing, monthly: 2000, yearly: 8000 },
    researcher: { ...defaultPlanPricing, monthly: 8000, yearly: 20000 },
    professor: { ...defaultPlanPricing, monthly: 8000, yearly: 20000 },
    teacher: { ...defaultPlanPricing, monthly: 5000, yearly: 15000 },
};

const SubscriptionStatusCard = ({ user }: { user: UserData | null }) => {
    if (!user?.isPremium || !user.subscriptionEndDate) {
        return null;
    }

    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <Card className="mb-8 bg-primary/5 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <CalendarClock /> Your Active Subscription
                </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                 <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <h3 className="text-lg font-bold">{getPlanName(user.role)}</h3>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <h3 className="text-lg font-bold">{daysRemaining}</h3>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Next Renewal Date</p>
                    <h3 className="text-lg font-bold">{endDate.toLocaleDateString()}</h3>
                </div>
            </CardContent>
        </Card>
    );
};

const getPlanName = (role: string) => {
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Plan`;
}


export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [pricing, setPricing] = useState<PricingSettings>(defaultPricing);
  const [paymentKey, setPaymentKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<'ask' | 'promo' | 'pay'>('ask');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeType | null>(null);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({ 
                    uid: firebaseUser.uid, 
                    fullName: firebaseUser.displayName || userData.fullName,
                    email: firebaseUser.email || userData.email,
                    ...userData 
                } as UserData);
            } else {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    });

    const fetchSettings = async () => {
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsDocRef);
        if (settingsDoc.exists()) {
            const data = settingsDoc.data();
             const fetchedPricing = data.pricingSettings || {};
             const mergedPricing = { ...defaultPricing };
             for (const role in mergedPricing) {
                if (fetchedPricing[role as keyof PricingSettings]) {
                    mergedPricing[role as keyof PricingSettings] = {
                        ...defaultPricing[role as keyof PricingSettings],
                        ...fetchedPricing[role as keyof PricingSettings]
                    };
                }
             }
            setPricing(mergedPricing);
            setPaymentKey(data.appSettings.paymentGatewayPublicKey || '');
        }
    }
    fetchSettings();
    
    return () => unsubscribe();
  }, [router]);
  
  const currentPlanRole = user?.role ? user.role.toLowerCase() as keyof PricingSettings : null;
  const currentPlanPricing = currentPlanRole ? pricing[currentPlanRole] : null;

  
  const calculatedPrice = useMemo(() => {
    if (!currentPlanPricing) return { original: 0, final: 0, discount: 0, hasActiveDiscount: false };
    
    let originalPrice = isYearly ? currentPlanPricing.yearly : currentPlanPricing.monthly;
    let finalPrice = originalPrice;
    let discount = 0;
    let hasActiveDiscount = false;

    // Check for site-wide discount first
    if (currentPlanPricing.isDiscountActive) {
        const discountedPrice = isYearly ? currentPlanPricing.yearlyDiscount : currentPlanPricing.monthlyDiscount;
        if (discountedPrice && discountedPrice > 0) {
            finalPrice = discountedPrice;
            hasActiveDiscount = true;
        }
    }
    
    // Promo code overrides site-wide discount
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            finalPrice = originalPrice * (1 - (appliedPromo.value / 100));
        } else if (appliedPromo.type === 'fixed') {
            finalPrice = Math.max(0, originalPrice - appliedPromo.value);
        } else if (appliedPromo.type === 'plan_upgrade' && appliedPromo.planUpgradePrices) {
             finalPrice = isYearly ? appliedPromo.planUpgradePrices.yearly : appliedPromo.planUpgradePrices.monthly;
        }
    }

    discount = originalPrice - finalPrice;

    return {
        original: originalPrice,
        final: finalPrice,
        discount,
        hasActiveDiscount,
    };
  }, [currentPlanPricing, isYearly, appliedPromo]);
  
  const getPaymentConfig = (amount: number, planName: string) => ({
    public_key: paymentKey,
    tx_ref: `AZMA-${user?.uid}-${Date.now()}`,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || '',
      phone_number: user?.phoneNumber || '',
      name: user?.fullName || '',
    },
    customizations: {
      title: 'AzmaAI Subscription',
      description: `Payment for ${planName}`,
      logo: 'https://www.azma.ai/logo.png', // Replace with your logo URL
    },
  });

  const handleSuccessfulPayment = async (response: any, planName: string, durationDays: number, promoId?: string) => {
    if (!user) return;

    setIsProcessing(true);
    toast({ title: 'Payment Successful!', description: 'Finalizing your upgrade...' });

    try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Calculate the new subscription end date
        const now = new Date();
        const subscriptionEndDate = new Date(now);
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays);

        const dataToUpdate: { isPremium: boolean; subscriptionEndDate: string; lastPayment?: any } = {
            isPremium: true,
            subscriptionEndDate: subscriptionEndDate.toISOString(),
            lastPayment: serverTimestamp(),
        };

        await updateDoc(userDocRef, dataToUpdate);

        setUser(prevUser => prevUser ? { ...prevUser, isPremium: true, subscriptionEndDate: subscriptionEndDate.toISOString() } : null);

        const newTransaction: Omit<Transaction, 'id'> = {
            invoiceId: response.tx_ref || `INV-${Date.now()}`,
            userFullName: user.fullName,
            userEmail: user.email,
            amount: response.amount || 0,
            status: 'Success',
            date: new Date().toISOString(),
            plan: planName,
        };
        await addDoc(collection(db, 'transactions'), newTransaction);
        
        if (promoId) {
            await redeemPromoCode(promoId, user.email);
        }

        toast({ title: 'Upgrade Complete!', description: 'Welcome to your new premium plan.' });
    } catch (error) {
        console.error("Failed to finalize upgrade:", error);
        toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Your payment was successful, but we failed to update your account. Please contact support.' });
    } finally {
        setIsProcessing(false);
        setIsUpgradeDialogOpen(false); // Close the dialog on completion
    }
  };

  const paymentConfig = getPaymentConfig(
    calculatedPrice.final,
    `${getPlanName(user?.role || 'Premium')} - ${isYearly ? 'Yearly' : 'Monthly'}${appliedPromo ? ` (Promo: ${appliedPromo.code})`: ''}`
  );

  const handleFlutterwavePayment = useFlutterwave(paymentConfig);

  const handlePayment = () => {
    if (!user || !user.role || !paymentKey || !currentPlanRole) {
        toast({ variant: 'destructive', title: 'Error', description: 'User data or payment key is missing. Please configure in admin settings.'});
        return;
    }
    
    setIsProcessing(true); // Set processing to true when payment is initiated
    const duration = isYearly ? 365 : 30;
    const planName = `${getPlanName(user.role)} - ${isYearly ? 'Yearly' : 'Monthly'}${appliedPromo ? ` (Promo: ${appliedPromo.code})`: ''}`;

    handleFlutterwavePayment({
      callback: async (response) => {
        if (response?.status === 'successful') {
            await handleSuccessfulPayment(
                response,
                planName,
                duration,
                appliedPromo?.id
            );
        } else {
            console.error("Flutterwave payment failed with response:", response);
            toast({ variant: 'destructive', title: 'Payment Failed', description: 'The payment was not successful. Please try again or contact support.' });
            setIsProcessing(false); // Reset processing state on failure
        }
        closePaymentModal();
      },
      onClose: () => {
         // Only show this if a payment wasn't already being processed.
         // This prevents the 'closed' message from appearing after a success/fail callback.
         if (!isProcessing) {
            // This is a standard close, not a failure.
         }
         // If it was processing, the success/fail callback will handle the state.
         // If not, we need to reset it here.
         if (isProcessing) {
           setIsProcessing(false);
         }
      },
    });
  }

  const handleContactSales = () => {
    window.location.href = "mailto:info@sfarettech.com.ng?subject=Enterprise%20Plan%20Inquiry";
  };
  
  const handleVerifyPromo = async () => {
    if (!promoCodeInput) {
        setPromoError('Please enter a promo code.');
        return;
    }
    if (!user) {
        setPromoError('You must be logged in to apply a code.');
        return;
    }

    setIsVerifyingPromo(true);
    setPromoError(null);
    setAppliedPromo(null);

    const { data, error } = await verifyUpgradePromoCodeAction(promoCodeInput, user.email);

    setIsVerifyingPromo(false);

    if (error) {
        setPromoError(error);
    } else if (data) {
        setAppliedPromo(data);
        setDialogStep('pay');
        toast({ title: 'Promo Code Applied!', description: `Your discount has been calculated.`});
    }
  }

  const openUpgradeDialog = () => {
    // Reset dialog state every time it opens
    setDialogStep(calculatedPrice.hasActiveDiscount ? 'pay' : 'ask');
    setPromoCodeInput('');
    setAppliedPromo(null);
    setPromoError(null);
    setIsUpgradeDialogOpen(true);
  }

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

            <SubscriptionStatusCard user={user} />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>For trying things out</CardDescription>
                        <div className="text-4xl font-bold">₦0 <span className="text-sm font-normal text-muted-foreground">/ forever</span></div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>5,000 AI Words/day</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>3 Documents/day</span>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <Button variant="outline" className="w-full" disabled={!user?.isPremium}>
                           {user?.isPremium ? 'Downgrade to Free' : 'Your Current Plan'}
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
                            {calculatedPrice.hasActiveDiscount ? (
                                <>
                                <span className="text-2xl font-normal text-muted-foreground line-through mr-2">₦{calculatedPrice.original.toLocaleString()}</span>
                                ₦{calculatedPrice.final.toLocaleString()}
                                </>
                            ) : (
                                <span>₦{calculatedPrice.original.toLocaleString()}</span>
                            )}
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
                        <Button className="w-full" onClick={openUpgradeDialog} disabled={user?.isPremium || isProcessing || !paymentKey}>
                          {isProcessing ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                          ) : user?.isPremium ? (
                              'Your Current Plan'
                          ) : (
                              'Upgrade Now'
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
                        <Button variant="outline" className="w-full" onClick={handleContactSales}>
                            Contact Sales
                        </Button>
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
                      <TableCell className="text-center">5,000 / day</TableCell>
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

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Complete Your Upgrade</DialogTitle>
                <DialogDescription>
                    You are upgrading to the <span className="font-semibold">{currentPlanRole ? getPlanName(currentPlanRole) : 'Premium'} - {isYearly ? 'Yearly' : 'Monthly'}</span> plan.
                </DialogDescription>
            </DialogHeader>

            {dialogStep === 'ask' && (
                <div className="py-4 space-y-4 text-center">
                    <p>Do you have a promo code?</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => setDialogStep('promo')}>Yes, I have a code</Button>
                        <Button variant="outline" onClick={() => {
                            setAppliedPromo(null); 
                            setDialogStep('pay');
                        }}>No, continue to payment</Button>
                    </div>
                </div>
            )}

            {dialogStep === 'promo' && (
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="promo-code-dialog">Promo Code</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="promo-code-dialog"
                                placeholder="Enter your code"
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value)}
                                disabled={isVerifyingPromo}
                            />
                            <Button onClick={handleVerifyPromo} disabled={isVerifyingPromo || !promoCodeInput}>
                                {isVerifyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                        {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                    </div>
                    <Button variant="link" size="sm" onClick={() => setDialogStep('ask')}>Back</Button>
                </div>
            )}

            {dialogStep === 'pay' && (
                <div className="py-4 space-y-4">
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Original Price:</span>
                                <span>₦{calculatedPrice.original.toLocaleString()}</span>
                            </div>
                            {(appliedPromo || calculatedPrice.hasActiveDiscount) && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount {appliedPromo ? `(${appliedPromo.code})` : '(Site-wide)'}:</span>
                                    <span>- ₦{calculatedPrice.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                                <span>Total to Pay:</span>
                                <span>₦{calculatedPrice.final.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <DialogFooter>
                        <Button onClick={handlePayment} disabled={isProcessing} className="w-full">
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            Pay Now
                        </Button>
                    </DialogFooter>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
