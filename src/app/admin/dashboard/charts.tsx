
'use client';
import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Area, AreaChart, ResponsiveContainer, Legend } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart"
import type { User } from '@/types/admin';
import type { Workspace, DocumentItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { academicTaskTypes } from '@/types/academic-task-types';


export function UserGrowthChart() {
  const [chartData, setChartData] = useState<any[] | null>(null);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('azma_all_users');
      if (storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        
        users.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        let cumulativeUsers = 0;
        const data = users.map(user => {
          cumulativeUsers++;
          return {
            date: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            users: cumulativeUsers,
          };
        });
        
        // Deduplicate dates, keeping the last entry for each day
        const uniqueData = Array.from(new Map(data.map(item => [item.date, item])).values());

        setChartData(uniqueData);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error(error);
      setChartData([]);
    }
  }, []);

  if (!chartData) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="users"
          type="natural"
          fill="var(--color-users)"
          fillOpacity={0.4}
          stroke="var(--color-users)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function ContentVolumeChart() {
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

                const dailyCounts = allDocuments.reduce((acc, doc) => {
                    const date = new Date(doc.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                const data = Object.keys(dailyCounts).map(date => ({
                    date,
                    documents: dailyCounts[date]
                }));
                
                data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="documents" fill="var(--color-documents)" radius={4} />
          </BarChart>
        </ChartContainer>
    )
}


export function TaskDistributionChart() {
  const [chartData, setChartData] = useState<any[] | null>(null);
  const chartColors = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))"
  ];
  
  useEffect(() => {
    try {
      const storedWorkspace = localStorage.getItem('azma_workspace');
      if (storedWorkspace) {
        const workspace: Workspace = JSON.parse(storedWorkspace);
        const allDocuments = [
          ...workspace.standaloneDocuments,
          ...workspace.projects.flatMap(p => p.documents)
        ];

        const taskTypeCounts = allDocuments.reduce((acc, doc) => {
          const taskType = doc.content?.title?.startsWith("New ") ?
              doc.content.title.split(" - ")[0].replace("New ", "") :
              "Unknown";

          if (academicTaskTypes.includes(taskType as any)) {
             acc[taskType] = (acc[taskType] || 0) + 1;
          } else {
             acc["Other"] = (acc["Other"] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const data = Object.keys(taskTypeCounts).map((task, index) => ({
          name: task,
          value: taskTypeCounts[task],
          fill: chartColors[index % chartColors.length]
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
    return <Skeleton className="h-[400px] w-full" />
  }

  const chartConfig = chartData.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} strokeWidth={5}>
              {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
          </Pie>
          <Legend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
