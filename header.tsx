"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Package, Settings, LogOut } from "lucide-react"
import { useUser } from "@/lib/user-context"
import { supabase } from "@/lib/supabase"

export function Header() {
  const pathname = usePathname()
  const { user } = useUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl text-primary">
            ScriptMan
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant={isActive("/") && !isActive("/elements") && !isActive("/sponsors") ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>

            <Link href="/elements">
              <Button
                variant={isActive("/elements") ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span>Elements</span>
              </Button>
            </Link>

            <Link href="/sponsors">
              <Button
                variant={isActive("/sponsors") ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Sponsors</span>
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-4 gap-1 p-1">
          <Link href="/" className="flex flex-col items-center justify-center py-2 text-xs">
            <LayoutDashboard
              className={`h-5 w-5 ${isActive("/") && !isActive("/elements") && !isActive("/sponsors") ? "text-primary" : "text-gray-500"}`}
            />
            <span
              className={
                isActive("/") && !isActive("/elements") && !isActive("/sponsors")
                  ? "text-primary font-medium"
                  : "text-gray-500"
              }
            >
              Dashboard
            </span>
          </Link>

          <Link href="/elements" className="flex flex-col items-center justify-center py-2 text-xs">
            <Package className={`h-5 w-5 ${isActive("/elements") ? "text-primary" : "text-gray-500"}`} />
            <span className={isActive("/elements") ? "text-primary font-medium" : "text-gray-500"}>Elements</span>
          </Link>

          <Link href="/sponsors" className="flex flex-col items-center justify-center py-2 text-xs">
            <Users className={`h-5 w-5 ${isActive("/sponsors") ? "text-primary" : "text-gray-500"}`} />
            <span className={isActive("/sponsors") ? "text-primary font-medium" : "text-gray-500"}>Sponsors</span>
          </Link>

          <Link href="/settings" className="flex flex-col items-center justify-center py-2 text-xs">
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="text-gray-500">Settings</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

