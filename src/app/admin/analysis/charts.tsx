
'use client';
import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart"
import type { User } from '@/types/admin';
import type { Workspace } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


const roleColors: {[key: string]: string} = {
    Student: "hsl(var(--chart-1))",
    Professor: "hsl(var(--chart-2))",
    Teacher: "hsl(var(--chart-3))",
    Researcher: "hsl(var(--chart-4))",
    Professional: "hsl(var(--chart-5))",
    Admin: "hsl(var(--primary))",
};


export function UserRoleDistributionChart() {
  const [chartData, setChartData] = useState<any[] | null>(null);
  
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('azma_all_users');
      if (storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const roleCounts = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const data = Object.keys(roleCounts).map(role => ({
          role,
          count: roleCounts[role],
          fill: roleColors[role as keyof typeof roleColors] || "hsl(var(--muted))"
        }));
        setChartData(data);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error(error);
      setChartData([]);
    }
  }, []);

  if (!chartData) {
    return <Skeleton className="h-[250px] w-full" />
  }

  const chartConfig = chartData.reduce((config, item) => {
    config[item.role] = { label: item.role, color: item.fill };
    return config;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
        <Pie data={chartData} dataKey="count" nameKey="role" innerRadius={60} strokeWidth={5}>
            {chartData.map((entry) => (
                <Cell key={`cell-${entry.role}`} fill={entry.fill} />
            ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="role" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  )
}

export function DocumentCreationChart() {
    const [chartData, setChartData] = useState<any[] | null>(null);

    useEffect(() => {
        try {
            const storedWorkspace = localStorage.getItem('azma_workspace');
            if (storedWorkspace) {
                const workspace: Workspace = JSON.parse(storedWorkspace);
                const allDocuments = [
                    ...workspace.standaloneDocuments,
                    ...workspace.projects.flatMap(p => p.documents)
                ];

                const monthlyCounts = allDocuments.reduce((acc, doc) => {
                    const date = new Date(doc.timestamp);
                    const month = date.toLocaleString('default', { month: 'short' });
                    acc[month] = (acc[month] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const data = Object.keys(monthlyCounts).map(month => ({
                    month,
                    documents: monthlyCounts[month]
                }));
                
                // Sort by month order
                const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                data.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

                setChartData(data);
            } else {
                setChartData([]);
            }
        } catch(error) {
            console.error(error);
            setChartData([]);
        }
    }, [])

    if (!chartData) {
        return <Skeleton className="h-[250px] w-full" />
    }

    const chartConfig = {
        documents: {
            label: "Documents",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="documents" fill="var(--color-documents)" radius={8} />
          </BarChart>
        </ChartContainer>
    )
}
