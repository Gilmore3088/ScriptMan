"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert, Copy, CheckCircle2, AlertCircle } from "lucide-react"

interface RLSFixInstructionsProps {
  onComplete?: () => void
}

export function RLSFixInstructions({ onComplete }: RLSFixInstructionsProps) {
  const [copied, setCopied] = useState(false)

  const sqlScript = `
-- Disable RLS temporarily to fix permissions
ALTER TABLE game_elements DISABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors DISABLE ROW LEVEL SECURITY;

-- Create or replace policies for game_elements
DROP POLICY IF EXISTS "Allow all operations for authenticated users on game_elements" ON game_elements;
DROP POLICY IF EXISTS "Allow all operations for anon on game_elements" ON game_elements;

-- Create or replace policies for sponsors
DROP POLICY IF EXISTS "Allow all operations for authenticated users on sponsors" ON sponsors;
DROP POLICY IF EXISTS "Allow all operations for anon on sponsors" ON sponsors;

-- Re-enable RLS with public access for development
ALTER TABLE game_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for everyone (for development)
CREATE POLICY "Allow all operations for everyone on game_elements" 
ON game_elements FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for everyone on sponsors" 
ON sponsors FOR ALL 
USING (true) 
WITH CHECK (true);
`.trim()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800 flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2" />
          Row-Level Security (RLS) Issue Detected
        </CardTitle>
        <CardDescription className="text-amber-700">
          Your database tables have Row-Level Security enabled, but the policies are not configured correctly. This is
          preventing you from creating or viewing elements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            For development purposes, we'll configure RLS to allow all operations. In a production environment, you
            should set up more restrictive policies based on user authentication.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="sql">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="sql">SQL Fix</TabsTrigger>
          </TabsList>
          <TabsContent value="sql" className="space-y-4">
            <div className="relative">
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
                <code>{sqlScript}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-amber-800">
              <li>Open your Supabase project dashboard</li>
              <li>Click on "SQL Editor" in the left sidebar</li>
              <li>Create a new query</li>
              <li>Paste the SQL script above</li>
              <li>Click "Run" to execute the script</li>
              <li>Refresh this page after running the script</li>
            </ol>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onComplete} className="w-full">
          I've Fixed the RLS Issues - Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}

