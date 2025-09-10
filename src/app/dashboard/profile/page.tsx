'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Upload } from 'lucide-react';

type UserData = {
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  username?: string;
  photoUrl?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    try {
      const userData = localStorage.getItem('stipsLiteUser');
      if (userData) {
        const parsedData: UserData = JSON.parse(userData);
        setUser(parsedData);
        setFullName(parsedData.fullName);
        setPhoneNumber(parsedData.phoneNumber || '');
        setUsername(parsedData.username || parsedData.fullName);
        setPhotoUrl(parsedData.photoUrl);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      router.push('/login');
    }
  }, [router]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        const updatedUser: UserData = { ...user, fullName, phoneNumber, username, photoUrl: photoPreview || photoUrl };
        localStorage.setItem('stipsLiteUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setPhotoUrl(updatedUser.photoUrl);
        setPhotoPreview(null); // Clear preview after save
        toast({
          title: 'Profile Updated',
          description: 'Your information has been saved.',
        });
      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not save changes.',
        })
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Link href="/dashboard">
                <Button size="icon" variant="outline" className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
            <h1 className="text-xl font-semibold">User Profile</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid w-full max-w-2xl gap-2">
                <Card>
                    <form onSubmit={handleProfileUpdate}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"> <User /> Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={photoPreview || photoUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${username || user.fullName}`} />
                                        <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="absolute bottom-0 right-0 rounded-full h-7 w-7"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4"/>
                                        <span className="sr-only">Upload Photo</span>
                                    </Button>
                                    <Input 
                                      type="file"
                                      ref={fileInputRef}
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handlePhotoUpload}
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-lg font-semibold">{user.fullName}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                    <div className="text-xs text-muted-foreground font-medium py-1 px-2 rounded-full bg-secondary w-fit">{user.role}</div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input 
                                    id="full-name" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="username">Username (Profile ID)</Label>
                                <Input 
                                    id="username" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will customize your profile avatar.
                                </p>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="phone-number">Phone Number</Label>
                                <Input 
                                    id="phone-number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user.email} disabled />
                                <p className="text-xs text-muted-foreground">
                                    Email address cannot be changed.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </main>
      </div>
    </div>
  );
}
