
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserList } from "./user-list"

export default function AdminUsersPage() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View, filter, sort, and manage all user accounts in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserList />
      </CardContent>
    </Card>
  )
}
