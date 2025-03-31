"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mail, Phone, FileText } from "lucide-react"
import type { Sponsor } from "@/lib/types"

export function SponsorProfile({ sponsor }: { sponsor: Sponsor }) {
  // Calculate fulfillment percentage
  const totalDeliverables = sponsor.deliverables?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const fulfilledDeliverables = sponsor.deliverables?.reduce((sum, item) => sum + (item.fulfilled || 0), 0) || 0
  const fulfillmentPercentage =
    totalDeliverables > 0 ? Math.min(100, Math.round((fulfilledDeliverables / totalDeliverables) * 100)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsor Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sponsor.logo && (
          <div className="flex justify-center">
            <div
              className="w-32 h-32 rounded-lg bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${sponsor.logo})`,
                backgroundColor: sponsor.brandColor || "transparent",
              }}
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Sports</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {sponsor.sports?.map((sport) => (
                <Badge key={sport} variant="outline">
                  {sport}
                </Badge>
              ))}
              {(!sponsor.sports || sponsor.sports.length === 0) && (
                <span className="text-sm text-muted-foreground">No sports specified</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Seasons</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {sponsor.seasons?.map((season) => (
                <Badge key={season} variant="outline">
                  {season}
                </Badge>
              ))}
              {(!sponsor.seasons || sponsor.seasons.length === 0) && (
                <span className="text-sm text-muted-foreground">No seasons specified</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            {sponsor.contactEmail && (
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${sponsor.contactEmail}`} className="text-sm hover:underline">
                  {sponsor.contactEmail}
                </a>
              </div>
            )}
            {sponsor.contactPhone && (
              <div className="mt-1 flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${sponsor.contactPhone}`} className="text-sm hover:underline">
                  {sponsor.contactPhone}
                </a>
              </div>
            )}
            {!sponsor.contactEmail && !sponsor.contactPhone && (
              <span className="text-sm text-muted-foreground">No contact information</span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Fulfillment Progress</h3>
            <div className="mt-2 space-y-2">
              <Progress value={fulfillmentPercentage} />
              <div className="flex justify-between text-sm">
                <span>
                  {fulfilledDeliverables} of {totalDeliverables} items fulfilled
                </span>
                <span className="font-medium">{fulfillmentPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {sponsor.contractNotes && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Contract Notes</h3>
            </div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{sponsor.contractNotes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

