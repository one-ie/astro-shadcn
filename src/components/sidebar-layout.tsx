import type { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/app-sidebar';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1" />
            <a
              href="/install"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Install
            </a>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-6">
            {children}
          </main>

          <footer className="h-12 border-t flex items-center px-6 text-sm text-muted-foreground">
            © 2025 &nbsp; <a href="https://one.ie"> ONE </a>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
