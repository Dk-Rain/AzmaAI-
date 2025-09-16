
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

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // This is a mock implementation.
    // In a real app, you would fetch users from your backend API.
    // For now, we'll try to read from localStorage to simulate a user base.
    try {
      const storedUsers = localStorage.getItem('azma_all_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Create some default users if none exist for demo purposes
        const defaultUsers: User[] = [
            { id: '1', fullName: 'John Doe', email: 'john@azma.com', role: 'Student', createdAt: new Date().toISOString() },
            { id: '2', fullName: 'Jane Smith', email: 'jane@azma.com', role: 'Professor', createdAt: new Date().toISOString() },
            { id: '3', fullName: 'Admin User', email: 'admin@azma.com', role: 'Admin', createdAt: new Date().toISOString() },
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

  const handleDeleteUser = (userId: string) => {
    const newUsers = users.filter(user => user.id !== userId);
    saveUsers(newUsers);
    toast({
        variant: 'destructive',
        title: 'User Deleted',
        description: 'The user has been removed from the system.',
    });
  }

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    const newUsers = users.map(user => user.id === userId ? {...user, role: newRole } : user);
    saveUsers(newUsers);
    toast({
        title: 'Role Updated',
        description: `The user's role has been changed to ${newRole}.`
    })
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
                              This action cannot be undone. This will permanently delete the user account.
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
