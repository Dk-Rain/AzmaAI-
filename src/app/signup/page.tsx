'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MountainIcon } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Placeholder for auth
    setTimeout(() => {
        setIsLoading(false);
        toast({ title: "Account created successfully!" });
        router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <Link href="/" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
                    <MountainIcon className="h-6 w-6 mr-2" />
                    StipsLite AI
                </Link>
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-balance text-muted-foreground">
                    Create an account to get started.
                </p>
            </div>
            <form onSubmit={handleSignup} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                    Login
                </Link>
            </div>
        </div>
      </div>
       <div className="hidden bg-muted lg:block">
        <img
          src="https://picsum.photos/seed/3/1200/800"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="modern abstract"
        />
      </div>
    </div>
  );
}
