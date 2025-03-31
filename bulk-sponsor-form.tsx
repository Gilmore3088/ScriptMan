"use client"

import { useState } from "react"
import { bulkCreateSponsors } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export function BulkSponsorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleSubmit(formData: FormData) {
    try {
      setIsSubmitting(true)
      const result = await bulkCreateSponsors(formData)
      setResult(result)
    } catch (error) {
      console.error("Error submitting form:", error)
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk Create Sponsors</CardTitle>
        <CardDescription>
          Enter one sponsor name per line. Each name will be created as a separate sponsor record.
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sponsorNames" className="block text-sm font-medium">
                Sponsor Names
              </label>
              <textarea
                id="sponsorNames"
                name="sponsorNames"
                rows={10}
                className="w-full p-2 border rounded-md"
                placeholder="Enter one sponsor name per line
Example:
Acme Corporation
XYZ Industries
Local Business"
                required
              />
              <p className="text-sm text-gray-500">
                Note: This process may take some time as we add a delay between requests to avoid rate limiting.
              </p>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {result.success
                    ? `Success! Created ${result.created} of ${result.total} sponsors`
                    : "Error creating sponsors"}
                </AlertTitle>
                <AlertDescription>
                  {result.success
                    ? result.failed > 0
                      ? `${result.failed} sponsors failed to create. See console for details.`
                      : "All sponsors were created successfully."
                    : result.message || "An unknown error occurred"}
                </AlertDescription>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p>Errors:</p>
                    <ul className="list-disc pl-5">
                      {result.errors.slice(0, 5).map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                      {result.errors.length > 5 && <li>...and {result.errors.length - 5} more errors</li>}
                    </ul>
                  </div>
                )}
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/sponsors">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Sponsors..." : "Create Sponsors"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

