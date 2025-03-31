"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export function TestDbConnection() {
  const [loading, setLoading] = useState(false)
  const [gameElementsExists, setGameElementsExists] = useState<boolean | null>(null)
  const [sponsorsExists, setSponsorsExists] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test game_elements table
      const { error: gameElementsError } = await supabase.from("game_elements").select("id").limit(1)

      setGameElementsExists(!gameElementsError)

      // Test sponsors table
      const { error: sponsorsError } = await supabase.from("sponsors").select("id").limit(1)

      setSponsorsExists(!sponsorsError)
    } catch (err) {
      setError(`Error testing connection: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Test your database connection and check if the required tables exist</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 p-3 rounded-md text-red-700 mb-4">{error}</div>}

        {gameElementsExists !== null && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              {gameElementsExists ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span>game_elements table: {gameElementsExists ? "Exists" : "Does not exist"}</span>
            </div>

            <div className="flex items-center">
              {sponsorsExists ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span>sponsors table: {sponsorsExists ? "Exists" : "Does not exist"}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

