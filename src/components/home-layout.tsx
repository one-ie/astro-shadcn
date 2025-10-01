import * as React from "react"
import { SimpleSidebarLayout } from "@/components/simple-sidebar-layout"
import { Chart } from "@/components/Chart"

export function HomeLayout() {
  return (
    <SimpleSidebarLayout>
          <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="max-w-[64rem] flex flex-col items-center gap-4 text-center mx-auto">
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                Build beautiful websites with Astro 5 and shadcn/ui
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                A beautiful, modern website template built with Astro and shadcn/ui.
                Featuring dark mode, responsive design, and great typography.
              </p>
              <div className="space-x-4">
                <a
                  href="https://ui.shadcn.com"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Documentation
                </a>
                <a
                  href="https://github.com/one-ie/astro-shadcn"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  GitHub
                </a>
              </div>
            </div>
          </section>

          <section className="space-y-6 py-8 md:py-12 lg:py-24">
            <Chart />
          </section>

          <section className="space-y-6 py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Optimized for the best possible performance and accessibility
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 grid-cols-2 md:grid-cols-4 items-start">
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[150px] flex-col items-center justify-center rounded-md p-6 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 mb-4 text-green-500"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                  </svg>
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl">100</h3>
                    <p className="text-sm text-muted-foreground">Performance</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[150px] flex-col items-center justify-center rounded-md p-6 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 mb-4 text-green-500"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl">100</h3>
                    <p className="text-sm text-muted-foreground">Accessibility</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[150px] flex-col items-center justify-center rounded-md p-6 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 mb-4 text-green-500"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                  </svg>
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl">100</h3>
                    <p className="text-sm text-muted-foreground">Best Practices</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[150px] flex-col items-center justify-center rounded-md p-6 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 mb-4 text-green-500"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl">100</h3>
                    <p className="text-sm text-muted-foreground">SEO</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </SimpleSidebarLayout>
  )
}
