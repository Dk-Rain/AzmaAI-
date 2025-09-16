
'use client';

import { useState, useEffect } from 'react';
import type { User, UserPermissions } from '@/types/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Shield, UserPlus } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, updateDoc, setDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';


export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const { toast } = useToast();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', password: '' });

  const fetchAdmins = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where("role", "==", "Admin"));
      const adminSnapshot = await getDocs(q);
      const adminList = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setAdmins(adminList);
    } catch (error) {
      console.error("Failed to fetch admins from Firestore", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load administrator accounts.'});
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [toast]);
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.fullName || !newAdmin.email || !newAdmin.password) {
        toast({ variant: 'destructive', title: "Missing fields", description: "Please fill out all fields."});
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.password);
        const user = userCredential.user;

        const newUser: User = {
            id: user.uid,
            fullName: newAdmin.fullName,
            email: newAdmin.email,
            role: 'Admin',
            createdAt: new Date().toISOString(),
            permissions: { canManageUsers: true, canManageTransactions: false, canManageSettings: false },
        };

        await setDoc(doc(db, "users", user.uid), newUser);

        setAdmins(prevAdmins => [...prevAdmins, newUser]);

        toast({ title: 'Admin Created', description: `${newUser.fullName} has been added as an admin.`});
        setIsCreateAdminOpen(false);
        setNewAdmin({ fullName: '', email: '', password: '' });

    } catch (error: any) {
        console.error("Admin creation failed:", error);
        toast({ variant: 'destructive', title: 'Admin Creation Failed', description: error.message});
    }
  };

  const handlePermissionChange = async (userId: string, permission: keyof UserPermissions, value: boolean) => {
    const adminToUpdate = admins.find(u => u.id === userId);
    if (!adminToUpdate) return;
    
    const newPermissions = { ...(adminToUpdate.permissions || { canManageUsers: false, canManageTransactions: false, canManageSettings: false }), [permission]: value };

    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { permissions: newPermissions });

      setAdmins(admins.map(user => 
        user.id === userId ? { ...user, permissions: newPermissions } as User : user
      ));
      toast({ title: 'Permissions Updated', description: `Permissions for ${adminToUpdate.fullName} have been saved.`})

    } catch (error) {
       console.error("Permission change failed", error);
       toast({ variant: 'destructive', title: "Error", description: "Failed to update permissions."});
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2"><Shield /> Admin Role Management</CardTitle>
                <CardDescription>
                Assign specific permissions to administrators.
                </CardDescription>
            </div>
            <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><UserPlus className="mr-2 h-4 w-4"/> Create New Admin</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Admin User</DialogTitle>
                        <DialogDescription>Fill in the details below to add a new administrator. This will create a new user in Firebase Authentication.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAdmin}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={newAdmin.fullName} onChange={(e) => setNewAdmin({...newAdmin, fullName: e.target.value})} placeholder="John Doe" required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} placeholder="admin@example.com" required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Choose a secure password" required/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create Admin</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {admins.map((user, index) => (
          <div key={user.id}>
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user.username || user.fullName}`} alt={user.fullName || 'User'}/>
                    <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-semibold">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
            </div>

            <div className="pl-0 md:pl-16 mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`perm-users-${user.id}`}
                  checked={user.permissions?.canManageUsers}
                  onCheckedChange={(checked) => handlePermissionChange(user.id, 'canManageUsers', checked)}
                  disabled={user.email === 'admin@azmaai.com.ng'}
                />
                <Label htmlFor={`perm-users-${user.id}`}>Manage Users</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`perm-transactions-${user.id}`}
                  checked={user.permissions?.canManageTransactions}
                  onCheckedChange={(checked) => handlePermissionChange(user.id, 'canManageTransactions', checked)}
                />
                <Label htmlFor={`perm-transactions-${user.id}`}>Manage Transactions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`perm-settings-${user.id}`}
                  checked={user.permissions?.canManageSettings}
                  onCheckedChange={(checked) => handlePermissionChange(user.id, 'canManageSettings', checked)}
                />
                <Label htmlFor={`perm-settings-${user.id}`}>Manage Settings</Label>
              </div>
            </div>

            {index < admins.length - 1 && <Separator className="mt-6"/>}
          </div>
        ))}
        {admins.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No administrators found.</p>
        )}
      </CardContent>
    </Card>
  );
}
