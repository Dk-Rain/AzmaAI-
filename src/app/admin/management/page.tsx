
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

export default function AdminManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', password: '' });


  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('azma_all_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const defaultUsers: User[] = [
            { id: '1', fullName: 'John Doe', email: 'john@azma.com', role: 'Student', createdAt: new Date().toISOString() },
            { id: '2', fullName: 'Jane Smith', email: 'jane@azma.com', role: 'Professor', createdAt: new Date().toISOString() },
            { id: '3', fullName: 'Admin User', email: 'admin@azmaai.com.ng', role: 'Admin', createdAt: new Date().toISOString(), permissions: { canManageUsers: true, canManageTransactions: true, canManageSettings: true } },
            { id: '4', fullName: 'Dike Paul', email: 'dike.paul@sfarettech.com.ng', role: 'Admin', createdAt: new Date().toISOString(), permissions: { canManageUsers: true, canManageTransactions: false, canManageSettings: false } },
        ];
        setUsers(defaultUsers);
        localStorage.setItem('azma_all_users', JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('azma_all_users', JSON.stringify(newUsers));
  }
  
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.fullName || !newAdmin.email) {
        toast({ variant: 'destructive', title: "Missing fields", description: "Please fill out all fields."});
        return;
    }

    const newUser: User = {
        id: new Date().toISOString(),
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: 'Admin',
        createdAt: new Date().toISOString(),
        permissions: { canManageUsers: false, canManageTransactions: false, canManageSettings: false },
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    toast({ title: 'Admin Created', description: `${newUser.fullName} has been added as an admin.`});
    setIsCreateAdminOpen(false);
    setNewAdmin({ fullName: '', email: '', password: '' });
  };


  const handleRoleChange = (userId: string, isAdmin: boolean) => {
    const newUsers = users.map(user => {
      if (user.id === userId) {
        // Prevent primary admin from being demoted
        if (user.email === 'admin@azmaai.com.ng') {
            toast({ variant: 'destructive', title: 'Action Forbidden', description: 'The primary admin role cannot be changed.'});
            return user;
        }
        return { 
          ...user, 
          role: isAdmin ? 'Admin' : 'Student', // Revert to student if admin is revoked
          permissions: isAdmin ? user.permissions || { canManageUsers: false, canManageTransactions: false, canManageSettings: false } : undefined
        } as User;
      }
      return user;
    });
    saveUsers(newUsers);
    toast({ title: "Permissions updated successfully."})
  };

  const handlePermissionChange = (userId: string, permission: keyof UserPermissions, value: boolean) => {
    const newUsers = users.map(user => {
      if (user.id === userId && user.role === 'Admin') {
        const newPermissions = { ...user.permissions, [permission]: value };
        return { ...user, permissions: newPermissions } as User;
      }
      return user;
    });
    saveUsers(newUsers);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2"><Shield /> Admin Role Management</CardTitle>
                <CardDescription>
                Grant admin access and assign specific permissions to users.
                </CardDescription>
            </div>
            <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><UserPlus className="mr-2 h-4 w-4"/> Create New Admin</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Admin User</DialogTitle>
                        <DialogDescription>Fill in the details below to add a new administrator.</DialogDescription>
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
        {users.map((user, index) => (
          <div key={user.id}>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
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
                 <div className="flex items-center space-x-2">
                    <Switch
                        id={`is-admin-${user.id}`}
                        checked={user.role === 'Admin'}
                        onCheckedChange={(checked) => handleRoleChange(user.id, checked)}
                        disabled={user.email === 'admin@azmaai.com.ng'}
                    />
                    <Label htmlFor={`is-admin-${user.id}`} className="font-medium">
                        Is Admin
                    </Label>
                </div>
            </div>

            {user.role === 'Admin' && (
              <div className="pl-0 md:pl-16 mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`perm-users-${user.id}`}
                    checked={user.permissions?.canManageUsers}
                    onCheckedChange={(checked) => handlePermissionChange(user.id, 'canManageUsers', checked)}
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
            )}

            {index < users.length - 1 && <Separator className="mt-6"/>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
