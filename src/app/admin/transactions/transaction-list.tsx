
'use client';
import { useState, useEffect } from 'react';
import type { Transaction } from '@/types/admin';
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
import { MoreHorizontal, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('azma_transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        // Create some default transactions if none exist for demo purposes
        const defaultTransactions: Transaction[] = [
          { id: 'txn_1', invoiceId: 'INV001', userFullName: 'John Doe', userEmail: 'john@azma.com', amount: 2000, status: 'Success', date: new Date(2024, 5, 1).toISOString(), plan: 'Student Plan' },
          { id: 'txn_2', invoiceId: 'INV002', userFullName: 'Jane Smith', userEmail: 'jane@azma.com', amount: 8000, status: 'Success', date: new Date(2024, 5, 3).toISOString(), plan: 'Researcher Plan' },
          { id: 'txn_3', invoiceId: 'INV003', userFullName: 'Peter Jones', userEmail: 'peter@example.com', amount: 5000, status: 'Failed', date: new Date(2024, 5, 4).toISOString(), plan: 'Teacher Plan' },
           { id: 'txn_4', invoiceId: 'INV004', userFullName: 'Sarah Miller', userEmail: 'sarah@example.com', amount: 8000, status: 'Pending', date: new Date(2024, 5, 5).toISOString(), plan: 'Professional Plan' },
        ];
        setTransactions(defaultTransactions);
        localStorage.setItem('azma_transactions', JSON.stringify(defaultTransactions));
      }
    } catch (error) {
      console.error("Failed to load transactions from localStorage", error);
    }
  }, []);
  
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  }

  const handleDownloadReceipt = (transaction: Transaction) => {
    const receiptContent = `
      AZMA AI - Transaction Receipt
      -----------------------------
      Transaction ID: ${transaction.id}
      Invoice ID: ${transaction.invoiceId}
      Date: ${new Date(transaction.date).toLocaleString()}

      User: ${transaction.userFullName} (${transaction.userEmail})
      Plan: ${transaction.plan}
      Amount: ₦${transaction.amount.toLocaleString()}
      Status: ${transaction.status}
      -----------------------------
      Thank you for your business.
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${transaction.invoiceId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Receipt Downloaded' });
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch(status) {
      case 'Success':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Success</Badge>;
      case 'Failed':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Failed</Badge>;
      case 'Pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.invoiceId}</TableCell>
              <TableCell>
                  <div className="font-medium">{transaction.userFullName}</div>
                  <div className="text-sm text-muted-foreground">{transaction.userEmail}</div>
              </TableCell>
              <TableCell>{transaction.plan}</TableCell>
              <TableCell>₦{transaction.amount.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
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
                    <DropdownMenuItem onSelect={() => handleViewDetails(transaction)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDownloadReceipt(transaction)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Transaction Details</DialogTitle>
                  <DialogDescription>
                      Invoice: {selectedTransaction?.invoiceId}
                  </DialogDescription>
              </DialogHeader>
              {selectedTransaction && (
                  <div className="grid gap-4 py-4 text-sm">
                      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                          <span className="font-medium text-muted-foreground">User:</span>
                          <span>{selectedTransaction.userFullName} ({selectedTransaction.userEmail})</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                          <span className="font-medium text-muted-foreground">Date:</span>
                          <span>{new Date(selectedTransaction.date).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                          <span className="font-medium text-muted-foreground">Plan:</span>
                          <span>{selectedTransaction.plan}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                          <span className="font-medium text-muted-foreground">Amount:</span>
                          <span className="font-semibold">₦{selectedTransaction.amount.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                          <span className="font-medium text-muted-foreground">Status:</span>
                          <div>{getStatusBadge(selectedTransaction.status)}</div>
                      </div>
                       <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                          <span className="font-medium text-muted-foreground">Transaction ID:</span>
                          <span className="font-mono text-xs">{selectedTransaction.id}</span>
                      </div>
                  </div>
              )}
               <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    <Button onClick={() => selectedTransaction && handleDownloadReceipt(selectedTransaction)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                    </Button>
               </div>
          </DialogContent>
      </Dialog>
    </>
  )
}
