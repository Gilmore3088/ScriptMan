"use client"

import Link from "next/link"
import { ChevronRight, Home, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function SponsorsNavigation({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Link href="/" className="flex items-center hover:text-primary">
        <Home className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link href="/sponsors" className="flex items-center font-medium text-primary">
        <Users className="h-4 w-4 mr-1" />
        <span>Sponsors</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/elements">Game Elements</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sponsors/new">+ Add Sponsor</Link>
        </Button>
      </div>
    </div>
  )
}

