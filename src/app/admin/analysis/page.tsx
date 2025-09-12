
'use client';
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserGrowthChart, ContentVolumeChart, TaskDistributionChart } from "./charts";
import type { Workspace } from "@/types";
import type { User } from "@/types/admin";
import { Users, FileText, Folder, Sigma } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


type AnalysisStats = {
    totalUsers: number;
    totalDocuments: number;
    totalProjects: number;
    avgDocsPerProject: string;
}

export default function AdminAnalysisPage() {
  const [stats, setStats] = useState<AnalysisStats | null>(null);

  useEffect(() => {
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
          totalUsers,
          totalDocuments,
          totalProjects,
          avgDocsPerProject
      });
    } catch (error) {
        console.error("Failed to calculate analysis stats:", error);
    }
  }, []);

  if (!stats) {
    return (
       <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold"><Skeleton className="h-8 w-16" /></div></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Documents</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold"><Skeleton className="h-8 w-16" /></div></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><Folder className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold"><Skeleton className="h-8 w-16" /></div></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. Docs/Project</CardTitle><Sigma className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold"><Skeleton className="h-8 w-16" /></div></CardContent></Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[400px] w-full lg:col-span-2" />
            </div>
       </div>
    )
  }

  return (
    <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProjects}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Docs/Project</CardTitle>
                    <Sigma className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.avgDocsPerProject}</div>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-6">
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
            <Card className="lg:col-span-1">
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
