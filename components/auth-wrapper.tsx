"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/lib/user-context"

interface AuthWrapperProps {
  children: ReactNode
  publicRoutes?: string[]
}

export function AuthWrapper({ children, publicRoutes = ["/login", "/register"] }: AuthWrapperProps) {
  const { currentUser, isLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // If we're still loading, don't do anything yet
    if (isLoading) return

    // Check if the current route is public
    const isPublicRoute = publicRoutes.includes(pathname || "")

    // If user is not logged in and route is not public, redirect to login
    if (!currentUser && !isPublicRoute) {
      router.push("/login")
    } else {
      // User is either logged in or on a public route
      setIsAuthorized(true)
    }
  }, [currentUser, isLoading, pathname, publicRoutes, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // Show children only if authorized
  return isAuthorized ? <>{children}</> : null
}

