
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

  const portfolioData = [
    { name: "Students", value: 50 },
    { name: "Teachers", value: 25 },
    { name: "Researchers", value: 15 },
    { name: "Professionals", value: 10 },
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const portfolioChartConfig = {
      Students: { label: 'Students', color: COLORS[0]},
      Teachers: { label: 'Teachers', color: COLORS[1]},
      Researchers: { label: 'Researchers', color: COLORS[2]},
      Professionals: { label: 'Professionals', color: COLORS[3]},
  } satisfies ChartConfig


  return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* KPI Cards */}
      <Card className="col-span-1 lg:col-span-3">
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <h2 className="text-2xl font-bold">₦8,700,000</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <h2 className="text-2xl font-bold">₦5,550,000</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <h2 className="text-2xl font-bold text-primary">₦3,150,000</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Growth</p>
            <h2 className="text-2xl font-bold">18.7%</h2>
          </div>
        </CardContent>
      </Card>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Revenue vs Expenses</h3>
           <ChartContainer config={revenueChartConfig} className="min-h-[250px] w-full">
            <BarChart data={revenueData} accessibilityLayer>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Growth Line Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Month
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.month}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold">
                              ₦{payload[0].value?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Role Allocation Pie Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">User Role Allocation</h3>
           <ChartContainer config={portfolioChartConfig} className="min-h-[250px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
              <Pie data={portfolioData} dataKey="value" nameKey="name" outerRadius={90}>
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
