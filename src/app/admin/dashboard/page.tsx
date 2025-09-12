
'use client';
import { useState, useEffect } from "react";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
  FileText,
  Folder,
  Sigma,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton";
import { UserGrowthChart, ContentVolumeChart, TaskDistributionChart } from "./charts";
import type { Workspace } from "@/types";
import type { User } from "@/types/admin";


type DashboardStats = {
    totalRevenue: number;
    subscriptions: number;
    sales: number;
    activeNow: number;
    totalUsers: number;
    totalDocuments: number;
    totalProjects: number;
    avgDocsPerProject: string;
}

type Transaction = {
    name: string;
    email: string;
    amount: string;
    status: 'Approved' | 'Declined' | 'Pending';
    date: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // This is all mock data for financial stats. In a real application, you would fetch this from your backend.
    const financialStats = {
        totalRevenue: 45231.89,
        subscriptions: 2350,
        sales: 12234,
        activeNow: 573,
    };

    const recentSales: Transaction[] = [
        { name: 'Liam Johnson', email: 'liam@example.com', amount: '₦250.00', status: 'Approved', date: '2023-06-23' },
        { name: 'Olivia Smith', email: 'olivia@example.com', amount: '₦150.00', status: 'Declined', date: '2023-06-24' },
        { name: 'Noah Williams', email: 'noah@example.com', amount: '₦350.00', status: 'Pending', date: '2023-06-25' },
        { name: 'Emma Brown', email: 'emma@example.com', amount: '₦450.00', status: 'Approved', date: '2023-06-26' },
        { name: 'James Jones', email: 'james@example.com', amount: '₦550.00', status: 'Approved', date: '2023-06-27' },
    ];
    setRecentTransactions(recentSales);
    
    // This is real data from local storage for app usage stats
    try {
      const storedUsers = localStorage.getItem('azma_all_users');
      const storedWorkspace = localStorage.getItem('azma_workspace');
      
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const workspace: Workspace = storedWorkspace ? JSON.parse(storedWorkspace) : { projects: [], standaloneDocuments: [] };

      const totalUsers = users.length;
      const totalDocuments = (workspace.standaloneDocuments?.length || 0) + (workspace.projects?.reduce((acc, p) => acc + p.documents.length, 0) || 0);
      const totalProjects = workspace.projects?.length || 0;
      const avgDocsPerProject = totalProjects > 0 ? (totalDocuments / totalProjects).toFixed(1) : '0.0';

      setStats({
          ...financialStats,
          totalUsers,
          totalDocuments,
          totalProjects,
          avgDocsPerProject
      });
    } catch (error) {
        console.error("Failed to calculate analysis stats:", error);
         setStats(financialStats as any); // Fallback to just financial
    }
  }, []);


  if (!stats) {
    return (
        <div className="flex flex-col w-full gap-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/3 mt-1" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/3 mt-1" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/3 mt-1" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/3 mt-1" /></CardContent></Card>
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.subscriptions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.sales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Now
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.activeNow}</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>User Growth Trend</CardTitle>
                    <CardDescription>
                        Cumulative user sign-ups over time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserGrowthChart />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Content Generation Volume</CardTitle>
                    <CardDescription>
                        Daily number of documents created across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContentVolumeChart />
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                            A log of the most recent financial activities.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="#">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentTransactions.map((transaction, index) => (
                        <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{transaction.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            {transaction.email}
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge 
                                variant={transaction.status === 'Approved' ? 'default' : transaction.status === 'Pending' ? 'secondary' : 'destructive'}
                            >
                                {transaction.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{transaction.date}</TableCell>
                        <TableCell className="text-right">{transaction.amount}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Task Type Portfolio</CardTitle>
                    <CardDescription>
                        Distribution of generated document types.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TaskDistributionChart />
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
