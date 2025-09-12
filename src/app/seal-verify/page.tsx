
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Search, CheckCircle, XCircle, FileClock, BadgeCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentHistoryEntry, PromoCode, User } from '@/types/admin';

type VerificationResult = {
    doc: DocumentHistoryEntry;
    promo: PromoCode | null;
    message: string;
}

export default function SealVerifyPage() {
    const [docId, setDocId] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerificationResult | 'not_found' | 'error' | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const { toast } = useToast();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!docId) {
            toast({ variant: 'destructive', title: 'Document ID is required.' });
            return;
        }

        setIsLoading(true);
        setResult(null);
        setErrorMessage('');

        setTimeout(() => {
            try {
                let docHistory: DocumentHistoryEntry[] = JSON.parse(localStorage.getItem('azma_document_history') || '[]');
                let allPromoCodes: PromoCode[] = JSON.parse(localStorage.getItem('azma_promo_codes') || '[]');
                let currentUser: User | null = JSON.parse(localStorage.getItem('azmaUser') || 'null');

                // If localStorage is empty, create fake data for demonstration
                if (docHistory.length === 0) {
                    docHistory.push({
                        docId: 'AZMA-DOC-DEMO-12345',
                        title: 'Sample Document for Demo',
                        generatedAt: new Date().toISOString(),
                        generatedBy: 'Demo System',
                    });
                }
                if (allPromoCodes.length === 0) {
                    allPromoCodes.push({
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
                    });
                }
                if (!currentUser) {
                    currentUser = {
                        id: 'user-demo-1',
                        fullName: 'Demo User',
                        email: 'demo@user.com',
                        role: 'Student',
                        createdAt: new Date().toISOString()
                    };
                }
                
                const foundDoc = docHistory.find(d => d.docId === docId);
                if (!foundDoc) {
                    setResult('not_found');
                    setIsLoading(false);
                    return;
                }

                if (!promoCode) {
                    setResult({ doc: foundDoc, promo: null, message: 'Document is authentic.' });
                    setIsLoading(false);
                    return;
                }
                
                if (!currentUser) {
                    setErrorMessage('You must be logged in to use a promo code.');
                    setResult('error');
                    setIsLoading(false);
                    return;
                }

                const foundPromoIndex = allPromoCodes.findIndex(p => p.code.toLowerCase() === promoCode.toLowerCase());
                if (foundPromoIndex === -1) {
                    setErrorMessage('This promo code is invalid.');
                    setResult('error');
                    setIsLoading(false);
                    return;
                }

                const promo = allPromoCodes[foundPromoIndex];

                if (!promo.isActive) { setErrorMessage('This promo code is not active.'); setResult('error'); setIsLoading(false); return; }
                if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) { setErrorMessage('This promo code has expired.'); setResult('error'); setIsLoading(false); return; }
                if (promo.usedCount >= promo.usageLimit) { setErrorMessage('This promo code has reached its usage limit.'); setResult('error'); setIsLoading(false); return; }

                const userUses = promo.redeemedBy.filter(id => id === currentUser?.email).length;
                if (userUses >= promo.usagePerUser) { setErrorMessage('You have already used this promo code the maximum number of times.'); setResult('error'); setIsLoading(false); return; }

                // All checks passed, update promo code usage
                promo.usedCount += 1;
                promo.redeemedBy.push(currentUser.email);
                allPromoCodes[foundPromoIndex] = promo;
                localStorage.setItem('azma_promo_codes', JSON.stringify(allPromoCodes));
                
                const discountMessage = promo.type === 'percentage'
                    ? `A ${promo.value}% discount has been applied.`
                    : `A discount of ₦${promo.value} has been applied.`;

                setResult({ doc: foundDoc, promo, message: `Promo code successfully applied! ${discountMessage}` });

            } catch (err) {
                console.error(err);
                setResult('error');
                setErrorMessage('An unexpected error occurred during verification.');
            } finally {
                setIsLoading(false);
            }
        }, 500);
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
                        <CardDescription>Verify the authenticity of a document generated by AzmaAI and apply a promo code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="docId">Document ID</Label>
                                <Input id="docId" placeholder="Enter the ID from the document's first page" value={docId} onChange={e => setDocId(e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                                <Input id="promoCode" placeholder="Enter promo code for a discount" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Verifying...' : <><Search className="mr-2 h-4 w-4" />Verify & Apply</>}
                            </Button>
                        </form>

                        <div className="mt-6">
                            {result === 'not_found' && (
                                <div className="p-4 border rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                                    <XCircle className="h-5 w-5" />
                                    <p>No document with the ID "{docId}" was found.</p>
                                </div>
                            )}
                             {result === 'error' && (
                                <div className="p-4 border rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                                    <XCircle className="h-5 w-5" />
                                    <p>{errorMessage}</p>
                                </div>
                            )}
                            {result && typeof result === 'object' && (
                                <div className="p-4 border rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5"/>
                                        <h3 className="font-bold">{result.message}</h3>
                                    </div>
                                    <div className="text-sm text-foreground pl-7 space-y-1">
                                        <p><strong>Document Title:</strong> {result.doc.title}</p>
                                        <p><strong>Generated At:</strong> {new Date(result.doc.generatedAt).toLocaleString()}</p>
                                        <p><strong>Generated By:</strong> {result.doc.generatedBy}</p>
                                        {result.promo && (
                                            <p><strong>Promo Applied:</strong> {result.promo.code}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
