
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
    AlertDialogTrigger,
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
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';


const initialFormState: Omit<PromoCode, 'id' | 'createdAt' | 'usedCount' | 'redeemedBy'> = {
  code: '',
  type: 'percentage',
  value: 10,
  usageLimit: 100,
  usagePerUser: 1,
  expiresAt: null,
  isActive: true,
  planUpgradePrices: { monthly: 0, yearly: 0 },
};

export default function PromotionsPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPromoCodes = async () => {
    try {
        const promoCodesCollection = collection(db, 'promoCodes');
        const q = query(promoCodesCollection, orderBy("createdAt", "desc"));
        const promoCodeSnapshot = await getDocs(q);
        const promoCodeList = promoCodeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
        setPromoCodes(promoCodeList);
    } catch (error) {
        console.error("Failed to fetch promo codes from Firestore", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load promo codes.'});
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, [toast]);


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
            value: promo.value || 0,
            usageLimit: promo.usageLimit,
            usagePerUser: promo.usagePerUser,
            expiresAt: promo.expiresAt,
            isActive: promo.isActive,
            planUpgradePrices: promo.planUpgradePrices || { monthly: 0, yearly: 0 },
        });
    } else {
        setEditingId(null);
        setFormData(initialFormState);
    }
    setIsDialogOpen(true);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      toast({ variant: 'destructive', title: "Missing field", description: "Code is required." });
      return;
    }
    
    const dataToSave = {
        ...formData,
        planUpgradePrices: formData.type === 'plan_upgrade' ? formData.planUpgradePrices : { monthly: 0, yearly: 0 },
        value: formData.type !== 'plan_upgrade' ? formData.value : 0,
    };


    if (editingId) {
        try {
            const promoDocRef = doc(db, 'promoCodes', editingId);
            await updateDoc(promoDocRef, dataToSave);
            toast({ title: 'Promo Code Updated!' });
        } catch (error) {
            console.error("Update failed:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update promo code.'});
        }
    } else {
        try {
            const newCode: Omit<PromoCode, 'id'> = {
                ...dataToSave,
                usedCount: 0,
                redeemedBy: [],
                createdAt: new Date().toISOString(),
            };
            await addDoc(collection(db, 'promoCodes'), newCode);
            toast({ title: 'Promo Code Created!' });
        } catch (error) {
            console.error("Create failed:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create promo code.'});
        }
    }

    fetchPromoCodes();
    setIsDialogOpen(false);
  };
  
  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "promoCodes", id));
        fetchPromoCodes();
        toast({ variant: 'destructive', title: 'Promo Code Deleted' });
    } catch (error) {
        console.error("Delete failed:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the promo code.'});
    }
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

                <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage Discount</SelectItem>
                            <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
                            <SelectItem value="plan_upgrade">Plan Upgrade (Fixed Price)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {formData.type === 'plan_upgrade' ? (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                      <div className="space-y-2 col-span-2">
                          <Label>Plan Upgrade Prices</Label>
                          <p className="text-xs text-muted-foreground">Set the final price users will pay for a monthly or yearly plan with this code.</p>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="upgrade-monthly">Monthly Price (₦)</Label>
                           <Input
                              id="upgrade-monthly"
                              type="number"
                              value={formData.planUpgradePrices?.monthly || 0}
                              onChange={(e) => setFormData({ ...formData, planUpgradePrices: { ...formData.planUpgradePrices!, monthly: parseInt(e.target.value, 10) || 0 } })}
                              placeholder="e.g., 1000"
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="upgrade-yearly">Yearly Price (₦)</Label>
                           <Input
                              id="upgrade-yearly"
                              type="number"
                              value={formData.planUpgradePrices?.yearly || 0}
                              onChange={(e) => setFormData({ ...formData, planUpgradePrices: { ...formData.planUpgradePrices!, yearly: parseInt(e.target.value, 10) || 0 } })}
                              placeholder="e.g., 10000"
                              required
                          />
                      </div>
                  </div>
                ) : (
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
                )}


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
                        <TableCell className="capitalize">{promo.type.replace('_', ' ')}</TableCell>
                        <TableCell>
                          {promo.type === 'percentage' ? `${promo.value}%` : 
                           promo.type === 'fixed' ? `₦${promo.value}` : 
                           `M: ₦${promo.planUpgradePrices?.monthly || 0}, Y: ₦${promo.planUpgradePrices?.yearly || 0}`}
                        </TableCell>
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

    