import * as React from 'react';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SectionCards } from '@/components/dashboard/section-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function DashboardLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16rem',
          '--header-height': '3rem',
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="grid gap-4 px-4 md:gap-6 lg:px-6 lg:grid-cols-2">
                <RevenueChart />
                <ActivityChart />
              </div>
              <div className="px-4 lg:px-6">
                <RecentTransactions />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
