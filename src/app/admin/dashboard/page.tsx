
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { User, Transaction } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlyData {
  month: string;
  revenue: number;
  subscriptions: number;
}

const portfolioChartConfig = {
    Student: { label: 'Students', color: "hsl(var(--chart-1))"},
    Teacher: { label: 'Teachers', color: "hsl(var(--chart-2))"},
    Researcher: { label: 'Researchers', color: "hsl(var(--chart-4))"},
    Professional: { label: 'Professionals', color: "hsl(var(--chart-5))"},
    Professor: { label: 'Professors', color: "hsl(var(--chart-3))"},
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const subscriptionChartConfig = {
  subscriptions: { label: "Subscriptions", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyData[]>([]);
  const [userRoleData, setUserRoleData] = useState<{ name: string; value: number; fill: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users and transactions in parallel
        const [userSnapshot, transactionSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'transactions'))
        ]);

        // Process Users
        const users = userSnapshot.docs.map(doc => doc.data() as User);
        setTotalUsers(users.length);

        const rolesCount: { [key: string]: number } = {};
        users.forEach(user => {
          if (user.role && user.role !== 'Admin') {
            rolesCount[user.role] = (rolesCount[user.role] || 0) + 1;
          }
        });
        
        setUserRoleData(Object.entries(rolesCount).map(([name, value]) => ({
          name,
          value,
          fill: portfolioChartConfig[name as keyof typeof portfolioChartConfig]?.color || `hsl(var(--chart-1))`
        })));


        // Process Transactions
        const transactions = transactionSnapshot.docs
            .map(doc => doc.data() as Transaction)
            .filter(t => t.status === 'Success');
        
        const revenue = transactions.reduce((acc, t) => acc + t.amount, 0);
        setTotalRevenue(revenue);
        setTotalSubscriptions(transactions.length);

        const monthlyTotals: { [key: string]: { revenue: number, subscriptions: number } } = {};
        transactions.forEach(t => {
          const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
          if (!monthlyTotals[month]) {
            monthlyTotals[month] = { revenue: 0, subscriptions: 0 };
          }
          monthlyTotals[month].revenue += t.amount;
          monthlyTotals[month].subscriptions += 1;
        });
        
        const sortedMonthlyData = Object.entries(monthlyTotals).map(([month, totals]) => ({ month, ...totals }))
            .sort((a, b) => new Date(`1 ${a.month}`).getTime() - new Date(`1 ${b.month}`).getTime());


        setMonthlyChartData(sortedMonthlyData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  if (isLoading) {
    return (
        <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-3">
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
            <Card><CardContent className="p-4"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardContent className="p-4"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
            <Card><CardContent className="p-4"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        </div>
    );
  }


  return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* KPI Cards */}
      <Card className="col-span-1 lg:col-span-3">
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Revenue</p>
            <h2 className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subscriptions</p>
            <h2 className="text-2xl font-bold">+{totalSubscriptions.toLocaleString()}</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <h2 className="text-2xl font-bold">{totalUsers.toLocaleString()}</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sales</p>
            <h2 className="text-2xl font-bold">+{totalSubscriptions.toLocaleString()}</h2>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
            <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
           <ChartContainer config={revenueChartConfig} className="min-h-[250px] w-full">
            <BarChart data={monthlyChartData} accessibilityLayer>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Subscription Growth Line Chart */}
      <Card>
        <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={subscriptionChartConfig} className="min-h-[250px] w-full">
            <LineChart data={monthlyChartData} accessibilityLayer>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="subscriptions" stroke="var(--color-subscriptions)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User Role Allocation Pie Chart */}
      <Card>
        <CardHeader>
            <CardTitle>User Role Allocation</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center">
           <ChartContainer config={portfolioChartConfig} className="min-h-[250px] w-full max-w-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
              <Pie data={userRoleData} dataKey="value" nameKey="name" outerRadius={90} labelLine={false} label={({
                  percent,
                  name,
                }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {userRoleData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
