import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const transactions = [
  {
    id: 'TXN-001',
    customer: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: 1250.0,
    status: 'completed',
    date: '2025-01-15',
  },
  {
    id: 'TXN-002',
    customer: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: 850.0,
    status: 'completed',
    date: '2025-01-14',
  },
  {
    id: 'TXN-003',
    customer: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: 2100.0,
    status: 'pending',
    date: '2025-01-14',
  },
  {
    id: 'TXN-004',
    customer: 'William Kim',
    email: 'will.kim@email.com',
    amount: 475.0,
    status: 'completed',
    date: '2025-01-13',
  },
  {
    id: 'TXN-005',
    customer: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: 1680.0,
    status: 'failed',
    date: '2025-01-13',
  },
  {
    id: 'TXN-006',
    customer: 'Liam Wilson',
    email: 'liam.wilson@email.com',
    amount: 920.0,
    status: 'completed',
    date: '2025-01-12',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          You have {transactions.length} transactions this period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Transaction ID</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials(transaction.customer)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{transaction.customer}</span>
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {transaction.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs">
                  {transaction.id}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={getStatusVariant(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
