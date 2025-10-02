import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="flex flex-col space-y-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
