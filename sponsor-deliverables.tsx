"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddDeliverableDialog } from "./add-deliverable-dialog"
import type { Sponsor } from "@/lib/types"

export function SponsorDeliverables({
  sponsor,
  usage,
}: {
  sponsor: Sponsor
  usage: any[]
}) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Group usage by deliverable type
  const usageByType: Record<string, number> = {}
  usage.forEach((item) => {
    const type = item.elements?.type || "unknown"
    usageByType[type] = (usageByType[type] || 0) + 1
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Deliverables</CardTitle>
          <CardDescription>Track contracted items and fulfillment progress</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Deliverable
        </Button>
      </CardHeader>
      <CardContent>
        {!sponsor.deliverables || sponsor.deliverables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No deliverables have been added for this sponsor yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsor.deliverables.map((deliverable, index) => {
                const fulfilled = usageByType[deliverable.type] || 0
                const percentage = Math.min(100, Math.round((fulfilled / deliverable.quantity) * 100))

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{deliverable.type}</Badge>
                    </TableCell>
                    <TableCell>{deliverable.description}</TableCell>
                    <TableCell>{deliverable.quantity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-[100px]" />
                        <span className="text-sm">
                          {fulfilled}/{deliverable.quantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={percentage === 100 ? "success" : percentage > 0 ? "warning" : "destructive"}>
                        {percentage === 100 ? "Complete" : percentage > 0 ? "In Progress" : "Not Started"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AddDeliverableDialog open={showAddDialog} onOpenChange={setShowAddDialog} sponsorId={sponsor.id} />
    </Card>
  )
}

