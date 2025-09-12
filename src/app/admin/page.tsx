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

export default function AdminAuthPage() {
  const [email, setEmail] = useState('admin@azma.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        if (email.toLowerCase() !== 'admin@azma.com') {
            return toast({
                variant: 'destructive',
                title: "Authentication Failed",
                description: 'This login form is for administrators only.'
            });
        }
        
        const adminUser = { fullName: 'Admin User', email: email, role: 'Admin' };

        try {
          localStorage.setItem('azmaUser', JSON.stringify(adminUser));
        } catch (error) {
           console.error("Could not save user to localStorage", error);
        }
        
        toast({ title: "Admin login successful!"});
        router.push('/admin/dashboard');
    }, 1000)
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                 <Link href="/" className="flex items-center justify-center font-bold text-2xl mb-2" prefetch={false}>
                    <School className="h-7 w-7 mr-2 text-primary" />
                    <span>AZMA AI</span>
                </Link>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@azma.com"
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
