import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const revenueData = [
  { month: 'Jan', revenue: 4200, profit: 2400 },
  { month: 'Feb', revenue: 5100, profit: 3100 },
  { month: 'Mar', revenue: 4800, profit: 2800 },
  { month: 'Apr', revenue: 6300, profit: 3800 },
  { month: 'May', revenue: 7200, profit: 4500 },
  { month: 'Jun', revenue: 8100, profit: 5200 },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Profit</CardTitle>
        <CardDescription>
          Monthly revenue and profit trends for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--color-primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--color-primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--color-accent))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--color-accent))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--color-border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--color-muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--color-muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--color-card))',
                  border: '1px solid hsl(var(--color-border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--color-foreground))',
                }}
                formatter={(value: number) => [`$${value}`, '']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--color-primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--color-accent))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
