"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSponsor, getSponsorElements, getSponsorUsage, deleteSponsor } from "@/lib/db"
import type { Sponsor, Element } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { AddEditSponsorDialog } from "@/components/add-edit-sponsor-dialog"
import { ElementCard } from "@/components/element-card"
import { SponsorUsageSummary } from "@/components/sponsor-usage-summary"
import { ArrowLeft, Edit, Trash, Calendar, Mail, Phone, AlertTriangle, Clock, FileText, BarChart3 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function SponsorDetailPage({ params }: { params: { sponsorId: string } }) {
  const router = useRouter()
  const [sponsor, setSponsor] = useState<Sponsor | null>(null)
  const [elements, setElements] = useState<Element[]>([])
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchSponsorData = async () => {
      try {
        setIsLoading(true)
        const sponsorData = await getSponsor(params.sponsorId)

        if (sponsorData) {
          setSponsor(sponsorData)

          // Fetch elements and usage stats in parallel
          const [elementsData, usageData] = await Promise.all([
            getSponsorElements(params.sponsorId),
            getSponsorUsage(params.sponsorId),
          ])

          setElements(elementsData)
          setUsageStats(usageData)
        } else {
          toast({
            title: "Error",
            description: "Sponsor not found",
            variant: "destructive",
          })
          router.push("/sponsors")
        }
      } catch (error) {
        console.error("Error fetching sponsor data:", error)
        toast({
          title: "Error",
          description: "Failed to load sponsor data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSponsorData()
  }, [params.sponsorId, router])

  const handleSponsorUpdate = (updatedSponsor: Sponsor) => {
    setSponsor(updatedSponsor)
    setIsEditDialogOpen(false)
    toast({
      title: "Success",
      description: "Sponsor updated successfully",
    })
  }

  const handleDeleteSponsor = async () => {
    try {
      setIsDeleting(true)
      await deleteSponsor(params.sponsorId)
      toast({
        title: "Success",
        description: "Sponsor deleted successfully",
      })
      router.push("/sponsors")
    } catch (error) {
      console.error("Error deleting sponsor:", error)
      toast({
        title: "Error",
        description: "Failed to delete sponsor",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Calculate contract dates
  const startDate = sponsor?.startDate ? new Date(sponsor.startDate) : null
  const endDate = sponsor?.endDate ? new Date(sponsor.endDate) : null
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!sponsor) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-4 text-lg font-semibold">Sponsor Not Found</h3>
          <p className="text-muted-foreground">The sponsor you're looking for doesn't exist or has been deleted.</p>
          <Button className="mt-4" onClick={() => router.push("/sponsors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sponsors
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sponsors")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{sponsor.name}</h1>
          <Badge
            className={`
            ${sponsor.status === "active" ? "bg-green-100 text-green-800 border-green-200" : ""}
            ${sponsor.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
            ${sponsor.status === "completed" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
            ${sponsor.status === "inactive" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
          `}
          >
            {sponsor.status.charAt(0).toUpperCase() + sponsor.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              {sponsor.contractNotes && <CardDescription>{sponsor.contractNotes}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contract Period</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </p>
                  </div>
                </div>

                {typeof contractStatus !== "string" && contractStatus.status === "active" && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Contract Progress</span>
                      <span>{contractStatus.percentComplete}%</span>
                    </div>
                    <Progress value={contractStatus.percentComplete} className="h-2" />
                  </div>
                )}

                {typeof contractStatus === "string" && (
                  <div className="flex items-center gap-2">
                    {contractStatus === "upcoming" && (
                      <>
                        <Clock className="h-4 w-4 text-blue-500" />
                        <p className="text-sm">Contract starts {formatDate(startDate)}</p>
                      </>
                    )}
                    {contractStatus === "expired" && (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <p className="text-sm">Contract expired {formatDate(endDate)}</p>
                      </>
                    )}
                    {contractStatus === "unknown" && (
                      <>
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">Contract dates not specified</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Deliverables</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sponsor.mentionsPerGame || sponsor.totalMentionsRequired ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Mentions</p>
                      <div className="flex flex-col gap-1 mt-1">
                        {sponsor.mentionsPerGame && (
                          <p className="text-sm text-muted-foreground">{sponsor.mentionsPerGame} per game</p>
                        )}
                        {sponsor.totalMentionsRequired && (
                          <p className="text-sm text-muted-foreground">{sponsor.totalMentionsRequired} total</p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {sponsor.scoreboardAdsPerGame || sponsor.totalScoreboardAdsRequired ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Scoreboard Ads</p>
                      <div className="flex flex-col gap-1 mt-1">
                        {sponsor.scoreboardAdsPerGame && (
                          <p className="text-sm text-muted-foreground">{sponsor.scoreboardAdsPerGame} per game</p>
                        )}
                        {sponsor.totalScoreboardAdsRequired && (
                          <p className="text-sm text-muted-foreground">{sponsor.totalScoreboardAdsRequired} total</p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {sponsor.halftimeReadsPerGame || sponsor.totalHalftimeReadsRequired ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Halftime Reads</p>
                      <div className="flex flex-col gap-1 mt-1">
                        {sponsor.halftimeReadsPerGame && (
                          <p className="text-sm text-muted-foreground">{sponsor.halftimeReadsPerGame} per game</p>
                        )}
                        {sponsor.totalHalftimeReadsRequired && (
                          <p className="text-sm text-muted-foreground">{sponsor.totalHalftimeReadsRequired} total</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {sponsor.otherDeliverables && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Other Deliverables</p>
                    <p className="text-sm text-muted-foreground mt-1">{sponsor.otherDeliverables}</p>
                  </div>
                )}

                {sponsor.customDeliverables && sponsor.customDeliverables.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Custom Deliverables</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sponsor.customDeliverables.map((deliverable) => (
                        <div key={deliverable.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{deliverable.name}</p>
                            {deliverable.type && (
                              <Badge variant="outline" className="text-xs">
                                {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                              </Badge>
                            )}
                          </div>
                          {deliverable.description && (
                            <p className="text-xs text-muted-foreground mt-1">{deliverable.description}</p>
                          )}
                          <div className="flex flex-col gap-1 mt-2">
                            {deliverable.perGame !== undefined && (
                              <p className="text-sm text-muted-foreground">{deliverable.perGame} per game</p>
                            )}
                            {deliverable.totalRequired !== undefined && (
                              <p className="text-sm text-muted-foreground">{deliverable.totalRequired} total</p>
                            )}
                            {deliverable.completed !== undefined && deliverable.totalRequired !== undefined && (
                              <div className="mt-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Completed</span>
                                  <span>
                                    {deliverable.completed}/{deliverable.totalRequired}
                                  </span>
                                </div>
                                <Progress
                                  value={Math.min((deliverable.completed / deliverable.totalRequired) * 100, 100)}
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Summary */}
          <SponsorUsageSummary sponsor={sponsor} usageStats={usageStats} />

          {/* Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Sponsor Elements</CardTitle>
              <CardDescription>Elements assigned to this sponsor that can be used in show flows</CardDescription>
            </CardHeader>
            <CardContent>
              {elements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {elements.map((element) => (
                    <ElementCard key={element.id} element={element} onClick={() => {}} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Elements</h3>
                  <p className="text-muted-foreground">This sponsor doesn't have any elements assigned yet.</p>
                  <Button className="mt-4" onClick={() => router.push("/elements")}>
                    Go to Element Library
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sponsor.contactName && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {sponsor.contactName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{sponsor.contactName}</p>
                    <p className="text-xs text-muted-foreground">Primary Contact</p>
                  </div>
                </div>
              )}

              {sponsor.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${sponsor.contactEmail}`} className="text-sm hover:underline">
                    {sponsor.contactEmail}
                  </a>
                </div>
              )}

              {sponsor.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${sponsor.contactPhone}`} className="text-sm hover:underline">
                    {sponsor.contactPhone}
                  </a>
                </div>
              )}

              {!sponsor.contactName && !sponsor.contactEmail && !sponsor.contactPhone && (
                <p className="text-sm text-muted-foreground">No contact information provided</p>
              )}
            </CardContent>
          </Card>

          {/* Brand Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              {sponsor.brandGuidelines ? (
                <div className="text-sm whitespace-pre-wrap">{sponsor.brandGuidelines}</div>
              ) : (
                <p className="text-sm text-muted-foreground">No brand guidelines provided</p>
              )}
            </CardContent>
          </Card>

          {/* Usage Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Mentions</span>
                </div>
                <Badge variant="outline">
                  {usageStats?.totalMentions || 0}/{sponsor.totalMentionsRequired || 0}
                </Badge>
              </div>

              {sponsor.totalMentionsRequired && sponsor.totalMentionsRequired > 0 && (
                <Progress
                  value={Math.min(((usageStats?.totalMentions || 0) / sponsor.totalMentionsRequired) * 100, 100)}
                  className="h-2"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Scoreboard Ads</span>
                </div>
                <Badge variant="outline">
                  {usageStats?.totalScoreboardAds || 0}/{sponsor.totalScoreboardAdsRequired || 0}
                </Badge>
              </div>

              {sponsor.totalScoreboardAdsRequired && sponsor.totalScoreboardAdsRequired > 0 && (
                <Progress
                  value={Math.min(
                    ((usageStats?.totalScoreboardAds || 0) / sponsor.totalScoreboardAdsRequired) * 100,
                    100,
                  )}
                  className="h-2"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Halftime Reads</span>
                </div>
                <Badge variant="outline">
                  {usageStats?.totalHalftimeReads || 0}/{sponsor.totalHalftimeReadsRequired || 0}
                </Badge>
              </div>

              {sponsor.totalHalftimeReadsRequired && sponsor.totalHalftimeReadsRequired > 0 && (
                <Progress
                  value={Math.min(
                    ((usageStats?.totalHalftimeReads || 0) / sponsor.totalHalftimeReadsRequired) * 100,
                    100,
                  )}
                  className="h-2"
                />
              )}

              {sponsor.customDeliverables && sponsor.customDeliverables.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-sm font-medium mb-2">Custom Deliverables</h3>
                  <div className="space-y-4">
                    {sponsor.customDeliverables.map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{deliverable.name}</span>
                        </div>
                        <Badge variant="outline">
                          {deliverable.completed || 0}/{deliverable.totalRequired || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {sponsor && (
        <AddEditSponsorDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          sponsor={sponsor}
          onSponsorChange={handleSponsorUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sponsor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sponsor.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSponsor} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Sponsor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

