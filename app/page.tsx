"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Grid, List } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SeasonCard } from "@/components/season-card"
import { AddEditSeasonDialog } from "@/components/add-edit-season-dialog"
import { getSeasons } from "@/lib/db"
import type { Season } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { getGames } from "@/lib/db"
import { TestDbConnection } from "@/components/test-db-connection"
import { AuthWrapper } from "@/components/auth-wrapper"
import { Header } from "@/components/header"
import { useUser } from "@/lib/user-context"
import { SupabaseError } from "@/components/supabase-error"

export default function Dashboard() {
  // Check if Supabase environment variables are available
  const isMissingEnvVars =
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const { currentUser, isLoading: isUserLoading } = useUser()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [filteredSeasons, setFilteredSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddSeasonDialog, setShowAddSeasonDialog] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)

  // Fetch seasons on component mount or when user changes
  useEffect(() => {
    if (currentUser) {
      fetchSeasons()
    }
  }, [currentUser])

  const fetchSeasons = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Fetching seasons...")

      const data = await getSeasons()
      console.log("Fetched seasons:", data)

      if (!data || data.length === 0) {
        console.log("No seasons found or empty array returned")
        setSeasons([])
        setFilteredSeasons([])
        setIsLoading(false)
        return
      }

      // Add this code to calculate game counts for each season
      const seasonsWithGameCounts = await Promise.all(
        data.map(async (season) => {
          try {
            const games = await getGames(season.id)
            const completedGames = games.filter((game) => game.status === "completed").length
            return {
              ...season,
              gameCount: games.length,
              completedGames,
            }
          } catch (error) {
            console.error(`Error fetching games for season ${season.id}:`, error)
            return {
              ...season,
              gameCount: 0,
              completedGames: 0,
            }
          }
        }),
      )

      console.log("Seasons with game counts:", seasonsWithGameCounts)
      setSeasons(seasonsWithGameCounts)
      setFilteredSeasons(seasonsWithGameCounts)
    } catch (error) {
      console.error("Error fetching seasons:", error)
      setError("Failed to load seasons. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load seasons",
        variant: "destructive",
      })
      // Set empty arrays to prevent undefined errors
      setSeasons([])
      setFilteredSeasons([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter seasons when search term or filters change
  useEffect(() => {
    let result = [...seasons]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (season) =>
          season.title.toLowerCase().includes(term) ||
          season.sport.toLowerCase().includes(term) ||
          season.year.toString().includes(term),
      )
    }

    // Apply sport filter
    if (sportFilter !== "all") {
      result = result.filter((season) => season.sport === sportFilter)
    }

    // Apply year filter
    if (yearFilter !== "all") {
      result = result.filter((season) => season.year.toString() === yearFilter)
    }

    setFilteredSeasons(result)
  }, [seasons, searchTerm, sportFilter, yearFilter])

  // Get unique sports and years for filters
  const uniqueSports = Array.from(new Set(seasons.map((season) => season.sport)))
  const uniqueYears = Array.from(new Set(seasons.map((season) => season.year))).sort((a, b) => b - a)

  // Handle season added or updated
  const handleSeasonChange = (updatedSeason: Season) => {
    console.log("Season changed:", updatedSeason)
    if (editingSeason) {
      // Update existing season
      setSeasons(seasons.map((season) => (season.id === updatedSeason.id ? updatedSeason : season)))
    } else {
      // Add new season
      setSeasons([updatedSeason, ...seasons])
    }

    setEditingSeason(null)
    setShowAddSeasonDialog(false)

    // Show success toast
    toast({
      title: editingSeason ? "Season Updated" : "Season Created",
      description: editingSeason
        ? `The season "${updatedSeason.title}" has been updated successfully.`
        : `The season "${updatedSeason.title}" has been created successfully.`,
    })
  }

  // Handle season deletion
  const handleSeasonDeleted = (seasonId: string) => {
    console.log(`Removing season with ID ${seasonId} from UI`)
    setSeasons(seasons.filter((season) => season.id !== seasonId))

    // Show success toast
    toast({
      title: "Season Deleted",
      description: "The season has been deleted successfully.",
    })
  }

  // Force a refresh of the seasons
  const handleRefresh = () => {
    fetchSeasons()
  }

  if (isMissingEnvVars) {
    return <SupabaseError />
  }

  return (
    <AuthWrapper>
      <Header />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Seasons Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
            <Button onClick={() => setShowAddSeasonDialog(true)} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Season
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-1 max-w-md relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search seasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {uniqueSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
              <TabsList>
                <TabsTrigger value="grid" title="Grid View">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" title="List View">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isUserLoading || isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <p className="mb-4">Loading seasons...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        ) : filteredSeasons.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredSeasons.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                viewMode={viewMode}
                onEdit={() => {
                  setEditingSeason(season)
                  setShowAddSeasonDialog(true)
                }}
                onDelete={handleSeasonDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">No seasons found</p>
            <Button onClick={() => setShowAddSeasonDialog(true)}>Create Your First Season</Button>
          </div>
        )}

        <AddEditSeasonDialog
          open={showAddSeasonDialog}
          onOpenChange={setShowAddSeasonDialog}
          season={editingSeason}
          onSeasonChange={handleSeasonChange}
        />

        {/* Database connection test */}
        <div className="mt-8">
          <TestDbConnection />
        </div>
      </main>
    </AuthWrapper>
  )
}

