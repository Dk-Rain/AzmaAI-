
'use client';
import { useState, useEffect } from 'react';
import type { User } from '@/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(userList);
    } catch (error) {
      console.error("Failed to fetch users from Firestore", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load user data.',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter(user => user.id !== userId));
        toast({
            variant: 'destructive',
            title: 'User Deleted',
            description: 'The user has been removed from the system.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the user.',
        });
    }
  }

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { role: newRole });
        setUsers(users.map(user => user.id === userId ? {...user, role: newRole } : user));
        toast({
            title: 'Role Updated',
            description: `The user's role has been changed to ${newRole}.`
        });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update user role.',
        });
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Full Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.fullName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
            </TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4"/>
                                Delete
                            </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account from the database.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
