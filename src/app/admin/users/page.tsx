
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserList } from "./user-list"

export default function AdminUsersPage() {

  // In a real app, this would be a server component fetching users from a database.
  // For this demo, we'll pass the data fetching to the client component.

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View, edit, and manage all user accounts in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserList />
      </CardContent>
    </Card>
  )
}
