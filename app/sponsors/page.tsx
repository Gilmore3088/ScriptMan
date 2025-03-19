"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSponsors } from "@/lib/db"
import type { Sponsor } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AddEditSponsorDialog } from "@/components/add-edit-sponsor-dialog"
import { Calendar, Grid, List, Plus, Search, User, Mail, Phone, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function SponsorsPage() {
  const router = useRouter()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddSponsorDialogOpen, setIsAddSponsorDialogOpen] = useState(false)

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setIsLoading(true)
        const data = await getSponsors()
        setSponsors(data)
        setFilteredSponsors(data)
      } catch (error) {
        console.error("Error fetching sponsors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSponsors()
  }, [])

  useEffect(() => {
    // Filter sponsors based on status and search query
    let filtered = [...sponsors]

    if (statusFilter !== "all") {
      filtered = filtered.filter((sponsor) => sponsor.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (sponsor) =>
          sponsor.name.toLowerCase().includes(query) ||
          (sponsor.contactName && sponsor.contactName.toLowerCase().includes(query)) ||
          (sponsor.contactEmail && sponsor.contactEmail.toLowerCase().includes(query)),
      )
    }

    setFilteredSponsors(filtered)
  }, [sponsors, statusFilter, searchQuery])

  const handleSponsorCreated = (newSponsor: Sponsor) => {
    setSponsors((prev) => [...prev, newSponsor])
    setIsAddSponsorDialogOpen(false)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Sponsorship Roster</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sponsorship Roster</h1>
        <Button onClick={() => setIsAddSponsorDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sponsors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredSponsors.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-4 text-lg font-semibold">No Sponsors Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Add your first sponsor to get started."}
          </p>
          <Button className="mt-4" onClick={() => setIsAddSponsorDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <Card
              key={sponsor.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/sponsors/${sponsor.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{sponsor.name}</CardTitle>
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
                {sponsor.contractNotes && (
                  <CardDescription className="line-clamp-2">{sponsor.contractNotes}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {sponsor.contactName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{sponsor.contactName}</span>
                    </div>
                  )}
                  {sponsor.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{sponsor.contactEmail}</span>
                    </div>
                  )}
                  {sponsor.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{sponsor.contactPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {sponsor.startDate ? formatDate(sponsor.startDate) : "No start date"} -{" "}
                    {sponsor.endDate ? formatDate(sponsor.endDate) : "No end date"}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/sponsors/${sponsor.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{sponsor.name}</h3>
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
                {sponsor.contractNotes && <p className="text-sm text-muted-foreground mb-2">{sponsor.contractNotes}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {sponsor.contactName && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{sponsor.contactName}</span>
                    </div>
                  )}
                  {sponsor.contactEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{sponsor.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center gap-1 min-w-[200px]">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {sponsor.startDate ? formatDate(sponsor.startDate) : "No start date"} -{" "}
                    {sponsor.endDate ? formatDate(sponsor.endDate) : "No end date"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {sponsor.totalMentionsRequired && (
                    <Badge variant="outline">{sponsor.totalMentionsRequired} Mentions</Badge>
                  )}
                  {sponsor.totalScoreboardAdsRequired && (
                    <Badge variant="outline">{sponsor.totalScoreboardAdsRequired} Ads</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditSponsorDialog
        open={isAddSponsorDialogOpen}
        onOpenChange={setIsAddSponsorDialogOpen}
        sponsor={null}
        onSponsorChange={handleSponsorCreated}
      />
    </div>
  )
}

