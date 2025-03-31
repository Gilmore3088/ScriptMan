"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Calendar, PieChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Sponsor } from "@/lib/types"

interface SponsorUsageSummaryProps {
  sponsor: Sponsor
  usageStats: any
}

export function SponsorUsageSummary({ sponsor, usageStats }: SponsorUsageSummaryProps) {
  // Calculate percentages for standard deliverables
  const mentionsPercentage = sponsor.totalMentionsRequired
    ? Math.min(((usageStats?.totalMentions || 0) / sponsor.totalMentionsRequired) * 100, 100)
    : 0

  const scoreboardAdsPercentage = sponsor.totalScoreboardAdsRequired
    ? Math.min(((usageStats?.totalScoreboardAds || 0) / sponsor.totalScoreboardAdsRequired) * 100, 100)
    : 0

  const halftimeReadsPercentage = sponsor.totalHalftimeReadsRequired
    ? Math.min(((usageStats?.totalHalftimeReads || 0) / sponsor.totalHalftimeReadsRequired) * 100, 100)
    : 0

  // Calculate overall completion percentage
  const totalRequired =
    (sponsor.totalMentionsRequired || 0) +
    (sponsor.totalScoreboardAdsRequired || 0) +
    (sponsor.totalHalftimeReadsRequired || 0) +
    (sponsor.customDeliverables?.reduce((sum, d) => sum + (d.totalRequired || 0), 0) || 0)

  const totalCompleted =
    (usageStats?.totalMentions || 0) +
    (usageStats?.totalScoreboardAds || 0) +
    (usageStats?.totalHalftimeReads || 0) +
    (sponsor.customDeliverables?.reduce((sum, d) => sum + (d.completed || 0), 0) || 0)

  const overallPercentage = totalRequired > 0 ? Math.min((totalCompleted / totalRequired) * 100, 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliverables Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Overall Completion</span>
                </div>
                <Badge variant="outline">
                  {totalCompleted}/{totalRequired}
                </Badge>
              </div>
              <Progress value={overallPercentage} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">{Math.round(overallPercentage)}% complete</p>
            </div>

            {usageStats?.gameBreakdown && usageStats.gameBreakdown.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Game Breakdown</h3>
                <div className="space-y-4">
                  {usageStats.gameBreakdown.map((game: any) => (
                    <div key={game.gameId} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{game.gameTitle}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(game.gameDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Mentions</p>
                          <p className="text-sm font-medium">{game.mentions || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Scoreboard</p>
                          <p className="text-sm font-medium">{game.scoreboardAds || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Halftime</p>
                          <p className="text-sm font-medium">{game.halftimeReads || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            {sponsor.totalMentionsRequired && sponsor.totalMentionsRequired > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Mentions</span>
                  </div>
                  <Badge variant="outline">
                    {usageStats?.totalMentions || 0}/{sponsor.totalMentionsRequired}
                  </Badge>
                </div>
                <Progress value={mentionsPercentage} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">{Math.round(mentionsPercentage)}% complete</p>
              </div>
            )}

            {sponsor.totalScoreboardAdsRequired && sponsor.totalScoreboardAdsRequired > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Scoreboard Ads</span>
                  </div>
                  <Badge variant="outline">
                    {usageStats?.totalScoreboardAds || 0}/{sponsor.totalScoreboardAdsRequired}
                  </Badge>
                </div>
                <Progress value={scoreboardAdsPercentage} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">
                  {Math.round(scoreboardAdsPercentage)}% complete
                </p>
              </div>
            )}

            {sponsor.totalHalftimeReadsRequired && sponsor.totalHalftimeReadsRequired > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Halftime Reads</span>
                  </div>
                  <Badge variant="outline">
                    {usageStats?.totalHalftimeReads || 0}/{sponsor.totalHalftimeReadsRequired}
                  </Badge>
                </div>
                <Progress value={halftimeReadsPercentage} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">
                  {Math.round(halftimeReadsPercentage)}% complete
                </p>
              </div>
            )}

            {/* Custom Deliverables Section */}
            {sponsor.customDeliverables && sponsor.customDeliverables.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Custom Deliverables</h3>
                <div className="space-y-4">
                  {sponsor.customDeliverables.map((deliverable) => {
                    const percentage =
                      deliverable.totalRequired && deliverable.totalRequired > 0
                        ? Math.min(((deliverable.completed || 0) / deliverable.totalRequired) * 100, 100)
                        : 0

                    return (
                      <div key={deliverable.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{deliverable.name}</span>
                          </div>
                          <Badge variant="outline">
                            {deliverable.completed || 0}/{deliverable.totalRequired || 0}
                          </Badge>
                        </div>
                        {deliverable.totalRequired && deliverable.totalRequired > 0 && (
                          <>
                            <Progress value={percentage} className="h-2" />
                            <p className="text-xs text-right text-muted-foreground">
                              {Math.round(percentage)}% complete
                            </p>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

