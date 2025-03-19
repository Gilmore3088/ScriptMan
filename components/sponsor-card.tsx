"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Briefcase, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { Sponsor } from "@/lib/types"

interface SponsorCardProps {
  sponsor: Sponsor
  onClick: () => void
  viewMode?: "grid" | "list"
}

export function SponsorCard({ sponsor, onClick, viewMode = "grid" }: SponsorCardProps) {
  // Calculate contract dates
  const startDate = sponsor.startDate ? new Date(sponsor.startDate) : null
  const endDate = sponsor.endDate ? new Date(sponsor.endDate) : null
  const today = new Date()

  // Format dates
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Calculate contract status
  const getContractStatus = () => {
    if (!startDate || !endDate) return "unknown"
    if (today < startDate) return "upcoming"
    if (today > endDate) return "expired"

    // Calculate percentage of contract completed
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsed = today.getTime() - startDate.getTime()
    const percentComplete = Math.round((elapsed / totalDuration) * 100)

    return {
      status: "active",
      percentComplete,
    }
  }

  const contractStatus = getContractStatus()

  // Mock usage data (in a real app, this would come from the database)
  const mockUsageData = {
    totalMentions: 18,
    requiredMentions: sponsor.totalMentionsRequired || 0,
    percentComplete: sponsor.totalMentionsRequired ? Math.round((18 / sponsor.totalMentionsRequired) * 100) : 0,
  }

  // Get status badge
  const getStatusBadge = () => {
    switch (sponsor.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
      default:
        return null
    }
  }

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {sponsor.contractNotes || "No contract notes provided"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {sponsor.totalMentionsRequired && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>
                    {mockUsageData.totalMentions}/{sponsor.totalMentionsRequired} Mentions
                  </span>
                </Badge>
              )}
              {startDate && endDate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </span>
                </Badge>
              )}
            </div>
          </div>

          {sponsor.totalMentionsRequired && sponsor.totalMentionsRequired > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Deliverables Completion</span>
                <span>{mockUsageData.percentComplete}%</span>
              </div>
              <Progress value={mockUsageData.percentComplete} className="h-2" />
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{sponsor.name}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {sponsor.contractNotes || "No contract notes provided"}
        </p>

        <div className="space-y-4">
          {sponsor.totalMentionsRequired && sponsor.totalMentionsRequired > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Mentions</span>
                <span>
                  {mockUsageData.totalMentions}/{sponsor.totalMentionsRequired}
                </span>
              </div>
              <Progress value={mockUsageData.percentComplete} className="h-2" />
            </div>
          )}

          {sponsor.customDeliverables && sponsor.customDeliverables.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Custom Deliverables</p>
              <div className="space-y-2">
                {sponsor.customDeliverables.map((deliverable) => (
                  <div key={deliverable.id} className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">{deliverable.name}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      {deliverable.perGame && (
                        <p className="text-sm text-muted-foreground">{deliverable.perGame} per game</p>
                      )}
                      {deliverable.totalRequired && (
                        <p className="text-sm text-muted-foreground">{deliverable.totalRequired} total</p>
                      )}
                      {deliverable.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{deliverable.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {startDate && endDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </p>
                {typeof contractStatus !== "string" && contractStatus.status === "active" && (
                  <p className="text-xs text-muted-foreground">
                    {contractStatus.percentComplete}% of contract period elapsed
                  </p>
                )}
              </div>
            </div>
          )}

          {sponsor.contactName && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{sponsor.contactName}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        {typeof contractStatus === "string" ? (
          <div className="w-full flex items-center justify-center gap-2 text-sm">
            {contractStatus === "upcoming" && (
              <>
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Contract starts {formatDate(startDate)}</span>
              </>
            )}
            {contractStatus === "expired" && (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Contract expired {formatDate(endDate)}</span>
              </>
            )}
            {contractStatus === "unknown" && (
              <>
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <span>Contract dates not specified</span>
              </>
            )}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Contract active</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

