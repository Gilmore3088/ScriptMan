"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateGame } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

interface EditGameDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: any
  seasonId: string
  onGameUpdated?: () => void
}

export function EditGameDetailsDialog({
  open,
  onOpenChange,
  game,
  seasonId,
  onGameUpdated,
}: EditGameDetailsDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    tvBroadcast: "",
    giveaway: "",
    eventStartTime: "",
    notes: "",
  })

  useEffect(() => {
    if (open && game) {
      // Format the date and time for the input fields
      const gameDate = new Date(game.date)
      const formattedDate = gameDate.toISOString().split("T")[0]
      const formattedTime = gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })

      // Format the gates open time if it exists
      let formattedGatesTime = ""
      if (game.eventStartTime) {
        formattedGatesTime = game.eventStartTime
      }

      setFormData({
        title: game.title || "",
        date: formattedDate || "",
        time: formattedTime || "",
        location: game.location || "",
        tvBroadcast: game.tvBroadcast || "",
        giveaway: game.giveaway || "",
        eventStartTime: formattedGatesTime || "",
        notes: game.notes || "",
      })
    }
  }, [open, game])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create a date object from the date and time
      let gameDate: Date | null = null

      if (formData.date) {
        gameDate = new Date(formData.date)

        // If time is provided, set the hours and minutes
        if (formData.time) {
          const [hours, minutes] = formData.time.split(":").map(Number)
          gameDate.setHours(hours, minutes)
        } else {
          // If no time provided, set to midnight (00:00)
          gameDate.setHours(0, 0, 0, 0)
        }
      }

      // Prepare the update data
      const updateData = {
        title: formData.title,
        date: gameDate ? gameDate.toISOString() : game.date,
        location: formData.location,
        tvBroadcast: formData.tvBroadcast,
        giveaway: formData.giveaway,
        eventStartTime: formData.eventStartTime,
        notes: formData.notes,
        updatedAt: new Date().toISOString(),
      }

      // Update the game
      await updateGame(game.id, updateData)

      toast({
        title: "Game updated",
        description: "The game details have been updated successfully.",
      })

      // Close the dialog and refresh the data
      onOpenChange(false)
      if (onGameUpdated) {
        onGameUpdated()
      }
    } catch (error) {
      console.error("Error updating game:", error)
      toast({
        title: "Error",
        description: "There was an error updating the game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Game Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Game Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Kickoff Time</Label>
                <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} />
                <p className="text-xs text-muted-foreground">Optional for drafts</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tvBroadcast">TV Broadcast</Label>
              <Input
                id="tvBroadcast"
                name="tvBroadcast"
                placeholder="e.g., ESPN, FOX"
                value={formData.tvBroadcast}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="giveaway">Giveaway</Label>
              <Input
                id="giveaway"
                name="giveaway"
                placeholder="e.g., T-Shirt for first 5,000 fans"
                value={formData.giveaway}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventStartTime">Gates Open Time</Label>
              <Input
                id="eventStartTime"
                name="eventStartTime"
                type="time"
                value={formData.eventStartTime}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional information about this game"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

