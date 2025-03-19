"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, List, Plus } from "lucide-react"

export function ElementsNavigation() {
  const pathname = usePathname()

  return (
    <div className="flex items-center space-x-2 mb-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">
          <Home className="h-4 w-4 mr-1" />
          Home
        </Link>
      </Button>
      <span className="text-gray-400">/</span>
      <Button variant={pathname === "/elements" ? "secondary" : "ghost"} size="sm" asChild>
        <Link href="/elements">
          <List className="h-4 w-4 mr-1" />
          Element Library
        </Link>
      </Button>
      {pathname.includes("/elements/new") && (
        <>
          <span className="text-gray-400">/</span>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/elements/new">
              <Plus className="h-4 w-4 mr-1" />
              New Element
            </Link>
          </Button>
        </>
      )}
      {pathname.includes("/elements/") && !pathname.includes("/elements/new") && (
        <>
          <span className="text-gray-400">/</span>
          <Button variant="secondary" size="sm" asChild>
            <Link href={pathname}>
              <Plus className="h-4 w-4 mr-1" />
              Edit Element
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}

