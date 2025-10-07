import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const activityData = [
  { day: 'Mon', active: 145, new: 32 },
  { day: 'Tue', active: 189, new: 45 },
  { day: 'Wed', active: 156, new: 28 },
  { day: 'Thu', active: 234, new: 67 },
  { day: 'Fri', active: 198, new: 52 },
  { day: 'Sat', active: 167, new: 38 },
  { day: 'Sun', active: 142, new: 29 },
];

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
        <CardDescription>
          Daily active users and new sign-ups for the past week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activityData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--color-border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--color-card))',
                  border: '1px solid hsl(var(--color-border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--color-foreground))',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                  color: 'hsl(var(--color-muted-foreground))',
                }}
              />
              <Bar
                dataKey="active"
                fill="hsl(var(--color-primary))"
                radius={[4, 4, 0, 0]}
                name="Active Users"
              />
              <Bar
                dataKey="new"
                fill="hsl(var(--color-accent))"
                radius={[4, 4, 0, 0]}
                name="New Sign-ups"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
