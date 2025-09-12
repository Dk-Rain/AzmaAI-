
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserGrowthChart, ContentVolumeChart, TaskDistributionChart } from "./charts";


export default function AdminAnalysisPage() {

  return (
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
  )
}
