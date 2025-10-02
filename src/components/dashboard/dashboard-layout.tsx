import * as React from 'react';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SectionCards } from '@/components/dashboard/section-cards';
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
              <div className="px-4 lg:px-6">
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
                  <span className="text-muted-foreground">Chart Area</span>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <div className="bg-muted/50 min-h-[50vh] flex-1 rounded-xl flex items-center justify-center">
                  <span className="text-muted-foreground">Data Table</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
