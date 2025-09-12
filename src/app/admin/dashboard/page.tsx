
'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";


export default function AdminDashboard() {
  // Sample investment/financial data
  const revenueData = [
    { month: "Jan", revenue: 12000, expenses: 8000 },
    { month: "Feb", revenue: 15000, expenses: 9500 },
    { month: "Mar", revenue: 18000, expenses: 11000 },
    { month: "Apr", revenue: 20000, expenses: 12000 },
    { month: "May", revenue: 22000, expenses: 15000 },
  ];

  const subscriptionData = [
    { month: "Jan", subscriptions: 1200 },
    { month: "Feb", subscriptions: 1450 },
    { month: "Mar", subscriptions: 1800 },
    { month: "Apr", subscriptions: 2100 },
    { month: "May", subscriptions: 2350 },
  ];

  const portfolioData = [
    { name: "Students", value: 50, fill: "var(--color-students)" },
    { name: "Teachers", value: 25, fill: "var(--color-teachers)" },
    { name: "Researchers", value: 15, fill: "var(--color-researchers)" },
    { name: "Professionals", value: 10, fill: "var(--color-professionals)" },
  ];

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const subscriptionChartConfig = {
    subscriptions: {
      label: "Subscriptions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const portfolioChartConfig = {
      students: { label: 'Students', color: "hsl(var(--chart-1))"},
      teachers: { label: 'Teachers', color: "hsl(var(--chart-2))"},
      researchers: { label: 'Researchers', color: "hsl(var(--chart-4))"},
      professionals: { label: 'Professionals', color: "hsl(var(--chart-5))"},
  } satisfies ChartConfig;


  return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* KPI Cards */}
      <Card className="col-span-1 lg:col-span-3">
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Revenue</p>
            <h2 className="text-2xl font-bold">₦45,231.89</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subscriptions</p>
            <h2 className="text-2xl font-bold">+2,350</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sales</p>
            <h2 className="text-2xl font-bold">+12,234</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <h2 className="text-2xl font-bold">+573</h2>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Revenue</h3>
           <ChartContainer config={revenueChartConfig} className="min-h-[250px] w-full">
            <BarChart data={revenueData} accessibilityLayer>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Subscription Growth Line Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Subscriptions</h3>
          <ChartContainer config={subscriptionChartConfig} className="min-h-[250px] w-full">
            <LineChart data={subscriptionData} accessibilityLayer>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="subscriptions" stroke="var(--color-subscriptions)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User Role Allocation Pie Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">User Role Allocation</h3>
           <ChartContainer config={portfolioChartConfig} className="min-h-[250px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
              <Pie data={portfolioData} dataKey="value" nameKey="name" outerRadius={90}/>
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
