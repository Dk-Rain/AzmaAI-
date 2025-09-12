
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserRoleDistributionChart, DocumentCreationChart } from "./charts";


export default function AdminAnalysisPage() {

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>
                    A breakdown of all registered users by their assigned role.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserRoleDistributionChart />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Document Generation Over Time</CardTitle>
                <CardDescription>
                    Monthly count of all documents created across the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DocumentCreationChart />
            </CardContent>
        </Card>
    </div>
  )
}
