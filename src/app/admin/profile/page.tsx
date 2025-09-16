
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { User, Upload } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

type UserData = {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  username?: string;
  photoUrl?: string;
};

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data() as Omit<UserData, 'uid'>;
                if (userData.role !== 'Admin') {
                    toast({ variant: 'destructive', title: 'Access Denied'});
                    router.push('/admin');
                    return;
                }
                const fullUserData: UserData = {
                    uid: firebaseUser.uid,
                    ...userData,
                    fullName: firebaseUser.displayName || userData.fullName,
                    photoUrl: firebaseUser.photoURL || userData.photoUrl,
                };
                setUser(fullUserData);
                setFullName(fullUserData.fullName);
                setPhotoUrl(fullUserData.photoUrl);
            } else {
                router.push('/admin');
            }
        } else {
            router.push('/admin');
        }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!user || !currentUser) return;
    setIsLoading(true);

    try {
        let newPhotoUrl = photoUrl;

        if (photoPreview) {
            const storageRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);
            await uploadString(storageRef, photoPreview, 'data_url');
            newPhotoUrl = await getDownloadURL(storageRef);
        }

        const dataToUpdate: { [key: string]: any } = {
            fullName,
            photoUrl: newPhotoUrl,
        };

        await updateProfile(currentUser, {
            displayName: fullName,
            photoURL: newPhotoUrl,
        });

        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, dataToUpdate);
        
        const updatedUser: UserData = { ...user, fullName, photoUrl: newPhotoUrl };
        setUser(updatedUser);
        setPhotoUrl(updatedUser.photoUrl);
        setPhotoPreview(null);
        
        toast({
          title: 'Profile Updated',
          description: 'Your information has been saved.',
        });

    } catch (error) {
      console.error(error);
      toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not save changes. Please try again.',
      })
    } finally {
      setIsLoading(false);
    }
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
    <Card>
        <form onSubmit={handleProfileUpdate}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"> <User /> Admin Profile</CardTitle>
                <CardDescription>
                    Update your administrator profile details here.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={photoPreview || photoUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user.username || user.fullName}`} />
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
                        <div className="text-xs text-muted-foreground font-medium py-1 px-2 rounded-full bg-primary/10 text-primary w-fit">{user.role}</div>
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
  );
}
