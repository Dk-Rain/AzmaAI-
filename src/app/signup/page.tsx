
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import type { AppSettings } from '@/types/admin';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="h-5 w-5">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
);


export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsDocRef);
        if (settingsDoc.exists()) {
            setSettings(settingsDoc.data().appSettings as AppSettings);
        } else {
            // Fallback if settings are not found, default to allowing registration
            setSettings({ allowRegistrations: true } as AppSettings);
        }
    };
    fetchSettings();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (settings && !settings.allowRegistrations) {
        toast({
            variant: 'destructive',
            title: "Registrations Disabled",
            description: "New user registrations are currently not allowed.",
        });
        return;
    }

    if (!role) {
      toast({
        variant: 'destructive',
        title: "Role is required",
        description: "Please select your role to continue.",
      });
      return;
    }
    setIsLoading(true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });
        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName,
            email,
            role,
            isPremium: false, // All new users start on a Free plan
            createdAt: new Date().toISOString(),
        });
        
        toast({ title: "Account created successfully!", description: "A verification email has been sent." });
        router.push('/verify-email');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Signup failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (settings && !settings.allowRegistrations) {
        toast({
            variant: 'destructive',
            title: "Registrations Disabled",
            description: "New user registrations are currently not allowed.",
        });
        return;
    }

    setIsGoogleLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
             await setDoc(userDocRef, {
                uid: user.uid,
                fullName: user.displayName,
                email: user.email,
                role: settings?.defaultUserRole || 'Student', // Use default role from settings
                isPremium: false, // New Google sign-ins also start on Free plan
                photoUrl: user.photoURL,
                createdAt: new Date().toISOString(),
            });
            toast({ title: "Account created successfully!" });
        } else {
            toast({ title: "Welcome back!" });
        }
        
        router.push('/dashboard');

    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: "Google Sign-In failed",
            description: error.message,
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <Link href="/" className="flex items-center justify-center font-bold text-xl" prefetch={false}>
                    <Image src="/img/Azmaai logo.png" alt="AzmaAI Logo" width={24} height={24} className="mr-2" />
                    AZMA AI
                </Link>
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-balance text-muted-foreground">
                    Create an account to get started.
                </p>
            </div>
            <div className="grid gap-4">
                <form onSubmit={handleSignup} className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input
                            id="full-name"
                            type="text"
                            placeholder="John Doe"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
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
                    <div className="grid gap-2">
                      <Label htmlFor="role">I am a...</Label>
                      <Select onValueChange={setRole} value={role} required>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                          <SelectItem value="Researcher">Researcher</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                    {isGoogleLoading ? 'Signing up...' : <> <GoogleIcon /> <span className="ml-2">Sign up with Google</span> </>}
                </Button>
            </div>
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

    