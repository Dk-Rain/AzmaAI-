
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionList } from "./transaction-list"

export default function AdminTransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Management</CardTitle>
        <CardDescription>
          View and manage all transactions in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionList />
      </CardContent>
    </Card>
  )
}
