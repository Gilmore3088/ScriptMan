"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSeason, getGames, deleteSeason } from "@/lib/db"
import type { Season, Game } from "@/lib/types"
import { GameCard } from "@/components/game-card"
import { AddGameDialog } from "@/components/add-game-dialog"
import { BatchAddGamesDialog } from "@/components/batch-add-games-dialog"
import { EditGameDetailsDialog } from "@/components/edit-game-details-dialog"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Header } from "@/components/header"
import { AuthWrapper } from "@/components/auth-wrapper"
import { SeasonTimelineView } from "@/components/season-timeline-view"
import { LayoutGrid, LayoutTemplate } from "lucide-react"

export default function SeasonPage({ params }: { params: { seasonId: string } }) {
  const router = useRouter()
  const [season, setSeason] = useState<Season | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddGameDialog, setShowAddGameDialog] = useState(false)
  const [showBatchAddDialog, setShowBatchAddDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")

  useEffect(() => {
    fetchData()
  }, [params.seasonId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`Fetching season with ID: ${params.seasonId}`)
      const seasonData = await getSeason(params.seasonId)

      if (!seasonData) {
        console.error(`Season not found with ID: ${params.seasonId}`)
        setError("Season not found")
        setIsLoading(false)
        return
      }

      console.log("Season data:", seasonData)
      setSeason(seasonData)

      const gamesData = await getGames(params.seasonId)
      console.log("Games data:", gamesData)
      setGames(gamesData || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(`Failed to load season data: ${err instanceof Error ? err.message : String(err)}`)
      toast({
        title: "Error",
        description: "Failed to load season data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGameAdded = (newGame: Game) => {
    setGames([...games, newGame])
    setShowAddGameDialog(false)
    toast({
      title: "Game Added",
      description: `${newGame.opponent} game has been added to the schedule.`,
    })
  }

  const handleGamesAdded = (newGames: Game[]) => {
    setGames([...games, ...newGames])
    setShowBatchAddDialog(false)
    toast({
      title: "Games Added",
      description: `${newGames.length} games have been added to the schedule.`,
    })
  }

  const handleGameUpdated = (updatedGame: Game) => {
    setGames(games.map((game) => (game.id === updatedGame.id ? updatedGame : game)))
    setEditingGame(null)
    toast({
      title: "Game Updated",
      description: `${updatedGame.opponent} game has been updated.`,
    })
  }

  const handleGameDeleted = (gameId: string) => {
    setGames(games.filter((game) => game.id !== gameId))
    toast({
      title: "Game Deleted",
      description: "The game has been removed from the schedule.",
    })
  }

  const handleDeleteSeason = async () => {
    try {
      await deleteSeason(params.seasonId)
      toast({
        title: "Season Deleted",
        description: "The season and all its games have been deleted.",
      })
      router.push("/")
    } catch (error) {
      console.error("Error deleting season:", error)
      toast({
        title: "Error",
        description: "Failed to delete the season",
        variant: "destructive",
      })
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  // Filter games based on active tab
  const filteredGames = games.filter((game) => {
    const gameDate = new Date(game.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (activeTab === "upcoming") {
      return gameDate >= today && game.status !== "completed"
    } else if (activeTab === "completed") {
      return game.status === "completed"
    } else {
      return true // "all" tab
    }
  })

  // Sort games by date
  const sortedGames = [...filteredGames].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  if (isLoading) {
    return (
      <AuthWrapper>
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <p>Loading season data...</p>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  if (error) {
    return (
      <AuthWrapper>
        <Header />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
              <p className="mb-4">{error}</p>
              <div className="flex gap-4">
                <Button onClick={() => fetchData()}>Try Again</Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthWrapper>
    )
  }

  if (!season) {
    return (
      <AuthWrapper>
        <Header />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <h2 className="text-2xl font-bold mb-4">Season Not Found</h2>
              <p className="mb-4">The season you're looking for doesn't exist or has been deleted.</p>
              <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <Header />
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border">
          <div>
            <h1 className="text-3xl font-bold text-primary">{season.title}</h1>
            <p className="text-muted-foreground">
              {season.sport} • {season.year} • {games.length} Games
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Dashboard
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              Delete Season
            </Button>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg border shadow-sm">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All Games</TabsTrigger>
                </TabsList>

                <div className="border-l h-8 mx-2"></div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex items-center gap-1"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === "timeline" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("timeline")}
                    className="flex items-center gap-1"
                  >
                    <LayoutTemplate className="h-4 w-4" />
                    <span>Timeline</span>
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowBatchAddDialog(true)} variant="outline">
                  Batch Add Games
                </Button>
                <Button onClick={() => setShowAddGameDialog(true)}>Add Game</Button>
              </div>
            </div>

            <TabsContent value="upcoming" className="mt-0">
              {sortedGames.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        seasonId={params.seasonId}
                        onEdit={() => setEditingGame(game)}
                        onDelete={handleGameDeleted}
                        onDuplicate={() => {
                          /* Add duplicate functionality */
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <SeasonTimelineView
                    games={sortedGames}
                    seasonId={params.seasonId}
                    onGameClick={(gameId) => router.push(`/seasons/${params.seasonId}/games/${gameId}`)}
                  />
                )
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="mb-4">No upcoming games found</p>
                    <Button onClick={() => setShowAddGameDialog(true)}>Add Game</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              {sortedGames.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        seasonId={params.seasonId}
                        onEdit={() => setEditingGame(game)}
                        onDelete={handleGameDeleted}
                        onDuplicate={() => {
                          /* Add duplicate functionality */
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <SeasonTimelineView
                    games={sortedGames}
                    seasonId={params.seasonId}
                    onGameClick={(gameId) => router.push(`/seasons/${params.seasonId}/games/${gameId}`)}
                  />
                )
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="mb-4">No completed games found</p>
                    <Button onClick={() => setShowAddGameDialog(true)}>Add Game</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              {sortedGames.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        seasonId={params.seasonId}
                        onEdit={() => setEditingGame(game)}
                        onDelete={handleGameDeleted}
                        onDuplicate={() => {
                          /* Add duplicate functionality */
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <SeasonTimelineView
                    games={sortedGames}
                    seasonId={params.seasonId}
                    onGameClick={(gameId) => router.push(`/seasons/${params.seasonId}/games/${gameId}`)}
                  />
                )
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="mb-4">No games found</p>
                    <Button onClick={() => setShowAddGameDialog(true)}>Add Game</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <AddGameDialog
          open={showAddGameDialog}
          onOpenChange={setShowAddGameDialog}
          seasonId={season.id}
          onGameAdded={handleGameAdded}
        />

        <BatchAddGamesDialog
          open={showBatchAddDialog}
          onOpenChange={setShowBatchAddDialog}
          seasonId={season.id}
          onGamesAdded={handleGamesAdded}
        />

        {editingGame && (
          <EditGameDetailsDialog
            open={!!editingGame}
            onOpenChange={(open) => !open && setEditingGame(null)}
            game={editingGame}
            onGameUpdated={handleGameUpdated}
          />
        )}

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the season "{season.title}" and all its games. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSeason} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthWrapper>
  )
}

