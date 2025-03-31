"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { addMissingColumnsSQL } from "./sql-migration-script"

export function DatabaseMigration() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const supabase = createClientComponentClient()

  const runMigration = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      console.log("Running migration script...")
      const { error } = await supabase.rpc("exec_sql", { sql_query: addMissingColumnsSQL })

      if (error) {
        console.error("Migration error:", error)
        setResult({
          success: false,
          message: `Error running migration: ${error.message}`,
        })
        return
      }

      setResult({
        success: true,
        message: "Migration completed successfully! The missing columns have been added to the database.",
      })
    } catch (err) {
      console.error("Exception during migration:", err)
      setResult({
        success: false,
        message: `Exception during migration: ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-amber-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Database Migration Required
        </CardTitle>
        <CardDescription className="text-amber-700">
          Your database schema needs to be updated to support all the features of the Element Library.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="mb-4">
          The error you encountered indicates that some columns are missing from your database tables. This migration
          will add the missing columns required for the Element Library to function properly.
        </p>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={runMigration} disabled={isRunning} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Migration...
            </>
          ) : (
            "Run Database Migration"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

