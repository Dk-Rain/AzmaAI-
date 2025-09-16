
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { School } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminAuthPage() {
  const [email, setEmail] = useState('admin@azmaai.com.ng');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user has 'Admin' role in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'Admin') {
            toast({ title: "Admin login successful!"});
            router.push('/admin/dashboard');
        } else {
            // Not an admin or user doc doesn't exist
            await signOut(auth); // Sign out the user
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: 'You do not have administrative privileges.'
            });
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: 'Invalid email or password.'
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                 <Link href="/" className="flex items-center justify-center font-bold text-2xl mb-2" prefetch={false}>
                    <School className="h-7 w-7 mr-2 text-primary" />
                    <span>AZMA AI</span>
                </Link>
                <CardTitle className="text-2xl">General Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@azmaai.com.ng"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <div className="text-center text-sm">
                        <Link
                        href="/login"
                        className="underline"
                        >
                        Not an admin? Login here
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}

