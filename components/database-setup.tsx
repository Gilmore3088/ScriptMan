"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { gameElementsTableSQL } from "./sql-setup-script"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy } from "lucide-react"

export function DatabaseSetup() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameElementsTableSQL)
    setCopied(true)
    toast({
      title: "SQL Copied",
      description: "SQL script copied to clipboard",
    })

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-800">Database Setup Required</CardTitle>
        <CardDescription className="text-amber-700">
          You need to set up the database tables for the Element Builder to work properly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-amber-700 mb-4">Please run the following SQL in your Supabase SQL Editor:</p>
        <pre className="bg-amber-100 p-4 rounded-md overflow-auto text-xs text-amber-900 max-h-96">
          {gameElementsTableSQL}
        </pre>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-amber-700">This will create the necessary tables and add sample data.</p>
        <Button
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy SQL to Clipboard
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

