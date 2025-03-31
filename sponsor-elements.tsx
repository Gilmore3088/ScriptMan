"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, ExternalLink } from "lucide-react"
import type { Element } from "@/lib/types"

export function SponsorElements({
  elements,
  usage,
}: {
  elements: Element[]
  usage: any[]
}) {
  // Group usage by element ID to show usage count
  const usageByElement: Record<string, any[]> = {}
  usage.forEach((item) => {
    const elementId = item.element_id
    if (!usageByElement[elementId]) {
      usageByElement[elementId] = []
    }
    usageByElement[elementId].push(item)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Linked Elements</CardTitle>
          <CardDescription>Elements associated with this sponsor across all games</CardDescription>
        </div>
        <Link href="/elements/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Create Element
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {elements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No elements have been created for this sponsor yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elements.map((element) => {
                const elementUsage = usageByElement[element.id] || []
                const lastUsed =
                  elementUsage.length > 0
                    ? new Date(Math.max(...elementUsage.map((u) => new Date(u.created_at).getTime())))
                    : null

                return (
                  <TableRow key={element.id}>
                    <TableCell className="font-medium">{element.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{element.type}</Badge>
                    </TableCell>
                    <TableCell>{elementUsage.length}</TableCell>
                    <TableCell>
                      {lastUsed ? lastUsed.toLocaleDateString() : <span className="text-muted-foreground">Never</span>}
                    </TableCell>
                    <TableCell>
                      <Link href={`/elements/${element.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

