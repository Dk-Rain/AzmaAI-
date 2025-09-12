
'use client';

import { useState, useEffect } from 'react';
import type { PromoCode } from '@/types/admin';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Ticket, PlusCircle, MoreHorizontal, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";


const initialFormState: Omit<PromoCode, 'id' | 'createdAt' | 'usedCount'> = {
  code: '',
  type: 'percentage',
  value: 10,
  usageLimit: 100,
  usagePerUser: 1,
  expiresAt: null,
  isActive: true,
};

export default function PromotionsPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCodes = localStorage.getItem('azma_promo_codes');
      if (storedCodes) {
        setPromoCodes(JSON.parse(storedCodes));
      }
    } catch (error) {
      console.error("Failed to load promo codes from localStorage", error);
    }
  }, []);

  const savePromoCodes = (newCodes: PromoCode[]) => {
    setPromoCodes(newCodes);
    localStorage.setItem('azma_promo_codes', JSON.stringify(newCodes));
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  const handleOpenDialog = (promo: PromoCode | null = null) => {
    if (promo) {
        setEditingId(promo.id);
        setFormData({
            code: promo.code,
            type: promo.type,
            value: promo.value,
            usageLimit: promo.usageLimit,
            usagePerUser: promo.usagePerUser,
            expiresAt: promo.expiresAt,
            isActive: promo.isActive,
        });
    } else {
        setEditingId(null);
        setFormData(initialFormState);
    }
    setIsDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast({ variant: 'destructive', title: "Missing fields", description: "Code and value are required." });
      return;
    }

    if (editingId) {
        const updatedCodes = promoCodes.map(p => 
            p.id === editingId ? { ...p, ...formData, id: editingId } : p
        );
        savePromoCodes(updatedCodes);
        toast({ title: 'Promo Code Updated!' });
    } else {
        const newCode: PromoCode = {
            id: new Date().toISOString(),
            ...formData,
            usedCount: 0,
            createdAt: new Date().toISOString(),
        };
        savePromoCodes([newCode, ...promoCodes]);
        toast({ title: 'Promo Code Created!' });
    }

    setIsDialogOpen(false);
  };
  
  const handleDelete = (id: string) => {
    const updatedCodes = promoCodes.filter(p => p.id !== id);
    savePromoCodes(updatedCodes);
    toast({ variant: 'destructive', title: 'Promo Code Deleted' });
  }

  const getStatusBadge = (promo: PromoCode) => {
    const now = new Date();
    if (!promo.isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (promo.expiresAt && new Date(promo.expiresAt) < now) return <Badge variant="destructive">Expired</Badge>;
    if (promo.usedCount >= promo.usageLimit) return <Badge variant="destructive">Depleted</Badge>;
    return <Badge className="bg-green-500">Active</Badge>;
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Ticket /> Promotions</CardTitle>
          <CardDescription>
            Create and manage promo codes for your users.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Create Promo Code</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Promo Code' : 'New Promo Code'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Promo Code</Label>
                    <div className="flex gap-2">
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., SAVE20"
                            required
                        />
                        <Button type="button" variant="outline" size="icon" onClick={generateRandomCode}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Discount Type</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as 'percentage' | 'fixed'})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                         <Input
                            id="value"
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value, 10) || 0 })}
                            placeholder={formData.type === 'percentage' ? "e.g., 20 for 20%" : "e.g., 500 for ₦500"}
                            required
                        />
                    </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="usageLimit">Total Usage Limit</Label>
                        <Input
                            id="usageLimit"
                            type="number"
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 1 })}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="usagePerUser">Uses Per User</Label>
                         <Input
                            id="usagePerUser"
                            type="number"
                            value={formData.usagePerUser}
                            onChange={(e) => setFormData({ ...formData, usagePerUser: parseInt(e.target.value, 10) || 1 })}
                        />
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label>Expiration Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                {formData.expiresAt ? format(new Date(formData.expiresAt), "PPP") : "No expiry date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.expiresAt ? new Date(formData.expiresAt) : undefined}
                                onSelect={(date) => setFormData({...formData, expiresAt: date ? date.toISOString() : null})}
                                initialFocus
                            />
                        </PopoverContent>
                     </Popover>
                </div>

                 <div className="flex items-center space-x-2">
                    <Switch id="is-active" checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})}/>
                    <Label htmlFor="is-active">Active</Label>
                </div>


                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit">
                    {editingId ? 'Save Changes' : 'Create Code'}
                  </Button>
                </DialogFooter>
              </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {promoCodes.length > 0 ? promoCodes.map(promo => (
                    <TableRow key={promo.id}>
                        <TableCell className="font-mono">{promo.code}</TableCell>
                        <TableCell className="capitalize">{promo.type}</TableCell>
                        <TableCell>{promo.type === 'percentage' ? `${promo.value}%` : `₦${promo.value}`}</TableCell>
                        <TableCell>{promo.usedCount} / {promo.usageLimit}</TableCell>
                        <TableCell>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell>{getStatusBadge(promo)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleOpenDialog(promo)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete this promo code.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(promo.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No promo codes created yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
