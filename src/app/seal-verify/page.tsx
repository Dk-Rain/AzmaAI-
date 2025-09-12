
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Search, CheckCircle, XCircle, FileClock, BadgeCheck, Ticket, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentHistoryEntry, PromoCode, User } from '@/types/admin';
import { AnimatePresence, motion } from 'framer-motion';

const FAKE_DOC_HISTORY: DocumentHistoryEntry[] = [{
    docId: 'AZMA-DOC-DEMO-12345',
    title: 'Sample Document for Demo',
    generatedAt: new Date().toISOString(),
    generatedBy: 'Demo System',
}];

const FAKE_PROMO_CODES: PromoCode[] = [
    {
        id: 'promo-demo-1',
        code: 'DEMO2024',
        type: 'percentage',
        value: 25,
        usageLimit: 10,
        usedCount: 0,
        usagePerUser: 1,
        redeemedBy: [],
        expiresAt: null,
        createdAt: new Date().toISOString(),
        isActive: true,
    },
    {
        id: 'promo-demo-2',
        code: 'SAVE500',
        type: 'fixed',
        value: 500,
        usageLimit: 20,
        usedCount: 0,
        usagePerUser: 1,
        redeemedBy: [],
        expiresAt: null,
        createdAt: new Date().toISOString(),
        isActive: true,
    }
];

export default function SealVerifyPage() {
    const [step, setStep] = useState(1); // 1: Doc ID, 2: Promo, 3: Result
    const [docId, setDocId] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [verifiedDoc, setVerifiedDoc] = useState<DocumentHistoryEntry | null>(null);
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();

    // The useEffect for setting up localStorage data is removed as we are now using hardcoded defaults.

    const handleVerifyDoc = () => {
        if (!docId) {
            setError('Document ID is required.');
            return;
        }
        setIsLoading(true);
        setError(null);

        setTimeout(() => {
            try {
                const docHistory: DocumentHistoryEntry[] = JSON.parse(localStorage.getItem('azma_document_history') || '[]');
                const allDocs = [...docHistory, ...FAKE_DOC_HISTORY];
                const foundDoc = allDocs.find(d => d.docId === docId);

                if (foundDoc) {
                    setVerifiedDoc(foundDoc);
                    setStep(2);
                    toast({ title: 'Document Verified!', description: 'The document is authentic.' });
                } else {
                    setError(`No document with the ID "${docId}" was found.`);
                }
            } catch (e) {
                setError('An error occurred during verification.');
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    const handleApplyPromo = () => {
        if (!promoCode) {
            // User can skip this step
            setStep(3);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            try {
                let allPromoCodes: PromoCode[] = JSON.parse(localStorage.getItem('azma_promo_codes') || '[]');
                allPromoCodes = [...allPromoCodes, ...FAKE_PROMO_CODES];
                const currentUser: User | null = JSON.parse(localStorage.getItem('azmaUser') || 'null');

                if (!currentUser) {
                    setError('You must be logged in to use a promo code.');
                    setIsLoading(false);
                    return;
                }

                const promoIndex = allPromoCodes.findIndex(p => p.code.toLowerCase() === promoCode.toLowerCase());
                if (promoIndex === -1) {
                    setError('This promo code is invalid.');
                    setIsLoading(false);
                    return;
                }

                const promo = allPromoCodes[promoIndex];
                if (!promo.isActive) { setError('This promo code is not active.'); setIsLoading(false); return; }
                if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) { setError('This promo code has expired.'); setIsLoading(false); return; }
                if (promo.usedCount >= promo.usageLimit) { setError('This promo code has reached its usage limit.'); setIsLoading(false); return; }

                const userUses = promo.redeemedBy.filter(email => email === currentUser.email).length;
                if (userUses >= promo.usagePerUser) { setError('You have already used this promo code the maximum number of times.'); setIsLoading(false); return; }

                // All checks passed. Update the real storage if it's not a fake code.
                if (!FAKE_PROMO_CODES.some(p => p.id === promo.id)) {
                    let realPromoCodes: PromoCode[] = JSON.parse(localStorage.getItem('azma_promo_codes') || '[]');
                    const realPromoIndex = realPromoCodes.findIndex(p => p.id === promo.id);
                    if (realPromoIndex > -1) {
                        realPromoCodes[realPromoIndex].usedCount += 1;
                        realPromoCodes[realPromoIndex].redeemedBy.push(currentUser.email);
                        localStorage.setItem('azma_promo_codes', JSON.stringify(realPromoCodes));
                    }
                }
                
                setAppliedPromo(promo);
                setStep(3);
                toast({ title: 'Promo Code Applied!', description: 'Your discount has been successfully recorded.' });
            } catch (e) {
                setError('An unexpected error occurred while applying the code.');
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };
    
    const startOver = () => {
        setStep(1);
        setDocId('');
        setPromoCode('');
        setVerifiedDoc(null);
        setAppliedPromo(null);
        setError(null);
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background">
                <Link href="/" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
                <School className="h-6 w-6 mr-2 text-primary" />
                <span>AZMA AI</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                >
                    Get Started
                </Link>
                </nav>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BadgeCheck /> SEAL Verify</CardTitle>
                        <CardDescription>A multi-step process to verify your document and apply promotions.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Document ID */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
                                    <h3 className="font-semibold">Step 1: Verify Document Authenticity</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="docId">Document ID</Label>
                                        <Input id="docId" placeholder="Enter the ID from the document" value={docId} onChange={e => setDocId(e.target.value)} required />
                                    </div>
                                    <Button onClick={handleVerifyDoc} className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                                        Verify Document
                                    </Button>
                                </motion.div>
                            )}

                            {/* Step 2: Promo Code */}
                            {step === 2 && verifiedDoc && (
                                <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
                                    <div className="p-3 border rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>Document "{verifiedDoc.title}" is authentic.</span>
                                    </div>
                                    <h3 className="font-semibold">Step 2: Apply a Promotion</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                                        <Input id="promoCode" placeholder="Enter promo code for a discount" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                                    </div>
                                    <Button onClick={handleApplyPromo} className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Ticket className="mr-2 h-4 w-4" />}
                                        {promoCode ? 'Apply Code' : 'Skip & Continue'}
                                    </Button>
                                    <Button variant="link" size="sm" onClick={() => setStep(1)}>Go Back</Button>
                                </motion.div>
                            )}
                            
                            {/* Step 3: Result */}
                            {step === 3 && verifiedDoc && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                                    <h3 className="text-xl font-bold">Verification Complete!</h3>
                                    <div className="p-4 border rounded-lg text-left text-sm space-y-2 bg-muted/50">
                                       <p><strong>Document ID:</strong> {verifiedDoc.docId}</p>
                                       <p><strong>Title:</strong> {verifiedDoc.title}</p>
                                       <p><strong>Generated At:</strong> {new Date(verifiedDoc.generatedAt).toLocaleString()}</p>
                                    </div>
                                    {appliedPromo && (
                                        <div className="p-4 border rounded-lg text-left text-sm space-y-2 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                            <p className="font-bold">Promotion Applied: {appliedPromo.code}</p>
                                            <p>
                                                You have received a discount of {appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : `₦${appliedPromo.value}`}.
                                            </p>
                                        </div>
                                    )}
                                    <Button onClick={startOver} className="w-full">
                                        Verify Another Document
                                    </Button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                        
                        {error && (
                            <div className="mt-4 p-3 border rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                <XCircle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
