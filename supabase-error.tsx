"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function SupabaseError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive" className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Connection Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">Unable to connect to Supabase. Please check your environment variables.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Make sure you have the following in your .env.local file:
            </p>
            <pre className="bg-secondary p-2 rounded-md text-xs mb-4 overflow-x-auto">
              <code>
                NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
              </code>
            </pre>
            <div className="flex flex-col space-y-2">
              <Button asChild variant="outline" size="sm">
                <Link href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Go to Supabase Dashboard
                </Link>
              </Button>
              <Button variant="default" size="sm" onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

