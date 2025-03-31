"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createGame } from "@/lib/db"
import type { Game } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seasonId: string
  onGameAdded: (game: Game) => void
}

export function AddGameDialog({ open, onOpenChange, seasonId, onGameAdded }: AddGameDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
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
    })
  }

  const handleSubmit = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault()

    if (!formData.title || !formData.date || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create a date object from the date string
      const gameDate = new Date(formData.date)

      // If time is provided, set the hours and minutes
      if (formData.time) {
        const [hours, minutes] = formData.time.split(":").map(Number)
        gameDate.setHours(hours, minutes)
      } else {
        // If no time provided, set to midnight (00:00)
        gameDate.setHours(0, 0, 0, 0)
      }

      // Create event start time if provided
      let eventStartTime = undefined
      if (formData.eventStartTime) {
        const [hours, minutes] = formData.eventStartTime.split(":")
        const eventDate = new Date(gameDate)
        eventDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))
        eventStartTime = eventDate.toISOString()
      }

      console.log("Creating game with seasonId:", seasonId)

      const newGame = await createGame({
        seasonId,
        title: formData.title,
        date: gameDate.toISOString(),
        eventStartTime,
        location: formData.location,
        theme: formData.theme || undefined,
        titleSponsor: formData.titleSponsor || undefined,
        broadcastNetwork: formData.broadcastNetwork || undefined,
        giveaway: formData.giveaway || undefined,
        status: "draft", // Set as draft by default
        eventCount: 0,
        completedEvents: 0,
      })

      console.log("Game created successfully:", newGame)

      onGameAdded(newGame)

      toast({
        title: "Success",
        description: "Game added successfully",
      })

      // Reset form
      resetForm()

      // Close dialog if not keeping open
      if (!keepOpen) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error adding game:", error)
      toast({
        title: "Error",
        description: "Failed to add game: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Game Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Home Opener vs. Rival"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Kickoff Time (Optional for drafts)</Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} />
              <p className="text-xs text-muted-foreground">You can add this information later if not available now.</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eventStartTime">Gates Open Time (Optional)</Label>
            <Input
              id="eventStartTime"
              name="eventStartTime"
              type="time"
              value={formData.eventStartTime}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Stadium A"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme (Optional)</Label>
              <Input
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="e.g., Homecoming, Military Appreciation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titleSponsor">Title Sponsor (Optional)</Label>
              <Input
                id="titleSponsor"
                name="titleSponsor"
                value={formData.titleSponsor}
                onChange={handleChange}
                placeholder="e.g., Presented by XYZ Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="broadcastNetwork">TV Broadcast (Optional)</Label>
              <Input
                id="broadcastNetwork"
                name="broadcastNetwork"
                value={formData.broadcastNetwork}
                onChange={handleChange}
                placeholder="e.g., ESPN, FOX"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="giveaway">Giveaway (Optional)</Label>
              <Input
                id="giveaway"
                name="giveaway"
                value={formData.giveaway}
                onChange={handleChange}
                placeholder="e.g., T-Shirt for first 5,000 fans"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about this game"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={(e) => handleSubmit(e, true)}>
                {isSubmitting ? "Saving..." : "Save & Add Another"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Game"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

