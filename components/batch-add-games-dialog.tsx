"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Plus, Trash, Calendar, Clock, MapPin } from "lucide-react"
import { createGame } from "@/lib/db"
import type { Game } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

interface BatchAddGamesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seasonId: string
  onGamesAdded: (games: Game[]) => void
}

interface GameFormData {
  id: string // Temporary ID for UI purposes
  title: string
  date: string
  time: string
  location: string
  theme: string
  titleSponsor: string
  broadcastNetwork: string
  giveaway: string
  eventStartTime: string
  notes: string
  expanded: boolean
}

export function BatchAddGamesDialog({ open, onOpenChange, seasonId, onGamesAdded }: BatchAddGamesDialogProps) {
  const [games, setGames] = useState<GameFormData[]>([createNewGameForm()])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  function createNewGameForm(): GameFormData {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      title: "",
      date: "",
      time: "",
      location: "",
      theme: "",
      titleSponsor: "",
      broadcastNetwork: "",
      giveaway: "",
      eventStartTime: "",
      notes: "",
      expanded: true,
    }
  }

  const handleChange = (index: number, field: keyof GameFormData, value: string) => {
    const updatedGames = [...games]
    updatedGames[index] = { ...updatedGames[index], [field]: value }
    setGames(updatedGames)
  }

  const addNewGame = () => {
    setGames([...games, createNewGameForm()])
    setCurrentIndex(games.length)
  }

  const removeGame = (index: number) => {
    if (games.length === 1) {
      // If it's the last game, just reset it instead of removing
      setGames([createNewGameForm()])
      return
    }

    const updatedGames = games.filter((_, i) => i !== index)
    setGames(updatedGames)

    // Adjust current index if needed
    if (currentIndex >= updatedGames.length) {
      setCurrentIndex(updatedGames.length - 1)
    }
  }

  const toggleExpand = (index: number) => {
    const updatedGames = [...games]
    updatedGames[index] = { ...updatedGames[index], expanded: !updatedGames[index].expanded }
    setGames(updatedGames)
  }

  const validateGames = () => {
    // Validate required fields - make time optional
    const requiredFields = ["title", "date", "location"]
    const missingFields: string[] = []

    games.forEach((game, index) => {
      requiredFields.forEach((field) => {
        if (!game[field]) {
          missingFields.push(`Game ${index + 1}: ${field}`)
        }
      })
    })

    return missingFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateGames()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const createdGames: Game[] = []

      // Create each game sequentially
      for (const game of games) {
        // Create a date object from the date string
        const gameDate = new Date(game.date)

        // If time is provided, set the hours and minutes
        if (game.time) {
          const [hours, minutes] = game.time.split(":").map(Number)
          gameDate.setHours(hours, minutes)
        } else {
          // If no time provided, set to midnight (00:00)
          gameDate.setHours(0, 0, 0, 0)
        }

        // Create event start time if provided
        let eventStartTime = undefined
        if (game.eventStartTime) {
          const [hours, minutes] = game.eventStartTime.split(":")
          const eventDate = new Date(gameDate)
          eventDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))
          eventStartTime = eventDate.toISOString()
        }

        const newGame = await createGame({
          seasonId,
          title: game.title,
          date: gameDate.toISOString(),
          eventStartTime,
          location: game.location,
          theme: game.theme || undefined,
          titleSponsor: game.titleSponsor || undefined,
          broadcastNetwork: game.broadcastNetwork || undefined,
          giveaway: game.giveaway || undefined,
          status: "draft", // Set as draft by default
          eventCount: 0,
          completedEvents: 0,
        })

        createdGames.push(newGame)
      }

      toast({
        title: "Success",
        description: `${createdGames.length} games added successfully`,
      })

      onGamesAdded(createdGames)
      onOpenChange(false)

      // Reset form
      setGames([createNewGameForm()])
      setCurrentIndex(0)
    } catch (error) {
      console.error("Error adding games:", error)
      toast({
        title: "Error",
        description: "Failed to add games: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Multiple Games</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            {games.map((game, index) => (
              <Card key={game.id} className={index === currentIndex ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">
                      Game {index + 1}
                      {game.title && `: ${game.title}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => toggleExpand(index)}>
                        {game.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGame(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Game summary when collapsed */}
                  {!game.expanded && game.date && (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {game.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{game.date}</span>
                        </div>
                      )}
                      {game.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{game.time}</span>
                        </div>
                      )}
                      {game.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{game.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded game details */}
                  {game.expanded && (
                    <div className="space-y-4 mt-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`title-${index}`}>Game Title</Label>
                        <Input
                          id={`title-${index}`}
                          value={game.title}
                          onChange={(e) => handleChange(index, "title", e.target.value)}
                          placeholder="e.g., Home Opener vs. Rival"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`date-${index}`}>Date</Label>
                          <Input
                            id={`date-${index}`}
                            type="date"
                            value={game.date}
                            onChange={(e) => handleChange(index, "date", e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`time-${index}`}>Kickoff Time (Optional for drafts)</Label>
                          <Input
                            id={`time-${index}`}
                            type="time"
                            value={game.time || ""}
                            onChange={(e) => handleChange(index, "time", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            You can add this information later if not available now.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`location-${index}`}>Location</Label>
                        <Input
                          id={`location-${index}`}
                          value={game.location}
                          onChange={(e) => handleChange(index, "location", e.target.value)}
                          placeholder="e.g., Stadium A"
                          required
                        />
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="additional-details">
                          <AccordionTrigger>Additional Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div className="grid gap-2">
                                <Label htmlFor={`eventStartTime-${index}`}>Gates Open Time (Optional)</Label>
                                <Input
                                  id={`eventStartTime-${index}`}
                                  type="time"
                                  value={game.eventStartTime}
                                  onChange={(e) => handleChange(index, "eventStartTime", e.target.value)}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor={`theme-${index}`}>Theme (Optional)</Label>
                                  <Input
                                    id={`theme-${index}`}
                                    value={game.theme}
                                    onChange={(e) => handleChange(index, "theme", e.target.value)}
                                    placeholder="e.g., Homecoming"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`titleSponsor-${index}`}>Title Sponsor (Optional)</Label>
                                  <Input
                                    id={`titleSponsor-${index}`}
                                    value={game.titleSponsor}
                                    onChange={(e) => handleChange(index, "titleSponsor", e.target.value)}
                                    placeholder="e.g., XYZ Corp"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor={`broadcastNetwork-${index}`}>TV Broadcast (Optional)</Label>
                                  <Input
                                    id={`broadcastNetwork-${index}`}
                                    value={game.broadcastNetwork}
                                    onChange={(e) => handleChange(index, "broadcastNetwork", e.target.value)}
                                    placeholder="e.g., ESPN, FOX"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor={`giveaway-${index}`}>Giveaway (Optional)</Label>
                                  <Input
                                    id={`giveaway-${index}`}
                                    value={game.giveaway}
                                    onChange={(e) => handleChange(index, "giveaway", e.target.value)}
                                    placeholder="e.g., T-Shirt for first 5,000 fans"
                                  />
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                                <Textarea
                                  id={`notes-${index}`}
                                  value={game.notes}
                                  onChange={(e) => handleChange(index, "notes", e.target.value)}
                                  placeholder="Any additional information about this game"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addNewGame}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Game
          </Button>

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save All Games"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

