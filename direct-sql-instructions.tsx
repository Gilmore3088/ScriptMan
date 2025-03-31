"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Copy, ExternalLink, CheckCircle } from "lucide-react"
import { directSQLFix } from "./direct-sql-fix"

export function DirectSQLInstructions() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(directSQLFix)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-amber-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Database Schema Fix Required
        </CardTitle>
        <CardDescription className="text-amber-700">
          Your database schema needs to be updated to support all the features of the Element Library.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            <p className="mb-2">The following error was encountered:</p>
            <pre className="bg-red-950 text-white p-2 rounded text-sm overflow-x-auto">
              ERROR: 42703: column "script_template" of relation "game_elements" does not exist
            </pre>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">How to Fix This Issue:</h3>

          <Tabs defaultValue="instructions">
            <TabsList>
              <TabsTrigger value="instructions">Step-by-Step Instructions</TabsTrigger>
              <TabsTrigger value="sql">SQL Script</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Step 1: Open Supabase SQL Editor</h4>
                <p>Go to your Supabase project dashboard and click on "SQL Editor" in the left sidebar.</p>
                <a
                  href="https://app.supabase.com/project/_/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Open Supabase SQL Editor <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Step 2: Create a New Query</h4>
                <p>Click the "New Query" button in the SQL Editor.</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Step 3: Paste the SQL Script</h4>
                <p>Copy the SQL script from the "SQL Script" tab and paste it into the query editor.</p>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center">
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy SQL Script
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Step 4: Run the Query</h4>
                <p>
                  Click the "Run" button to execute the SQL script. This will add the missing columns to your database.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Step 5: Refresh the Page</h4>
                <p>After running the SQL script, refresh this page to see if the issue is resolved.</p>
              </div>
            </TabsContent>

            <TabsContent value="sql" className="pt-4">
              <div className="bg-gray-50 p-4 rounded-md border overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">{directSQLFix}</pre>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center">
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">This is a one-time fix to update your database schema.</p>
        <Button onClick={() => window.location.reload()} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
          Refresh Page
        </Button>
      </CardFooter>
    </Card>
  )
}

