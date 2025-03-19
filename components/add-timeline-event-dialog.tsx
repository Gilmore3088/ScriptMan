"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createTimelineEvent } from "@/lib/db"
import type { TimelineEvent } from "@/lib/types"
import { Clock, MapPin, FileText, Calendar, Volume2 } from "lucide-react"

interface AddTimelineEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameId: string
  startTime: number
  onEventAdded: (event: TimelineEvent) => void
}

export function AddTimelineEventDialog({
  open,
  onOpenChange,
  gameId,
  startTime,
  onEventAdded,
}: AddTimelineEventDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("PREGAME")
  const [location, setLocation] = useState("")
  const [duration, setDuration] = useState("15")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioNotes, setAudioNotes] = useState("")
  const [clockRef, setClockRef] = useState("")

  // Format time for display
  const formatTime = (seconds: number) => {
    // Convert seconds to hours:minutes format, adding back the 7pm offset
    const totalMinutes = Math.floor(seconds / 60) + 19 * 60
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a title for the event",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate end time based on duration (in minutes)
      const durationInSeconds = Number.parseInt(duration) * 60
      const endTime = startTime + durationInSeconds

      const newEvent = await createTimelineEvent({
        gameId,
        startTime,
        endTime, // This will be kept in the returned object but not stored in DB
        title,
        category,
        location, // This will be kept in the returned object but not stored in DB
        notes,
        audioNotes,
        clockRef,
        components: [],
      })

      toast({
        title: "Success",
        description: "Timeline event added successfully",
      })

      onEventAdded(newEvent)
      onOpenChange(false)

      // Reset form
      setTitle("")
      setCategory("PREGAME")
      setLocation("")
      setDuration("15")
      setNotes("")
      setAudioNotes("")
      setClockRef("")
    } catch (error) {
      console.error("Error adding timeline event:", error)
      toast({
        title: "Error",
        description: "Failed to add timeline event",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Timeline Event at {formatTime(startTime)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Event Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pregame Show"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREGAME" className="text-blue-600">
                    Pregame
                  </SelectItem>
                  <SelectItem value="IN GAME" className="text-green-600">
                    In Game
                  </SelectItem>
                  <SelectItem value="HALFTIME" className="text-orange-600">
                    Halftime
                  </SelectItem>
                  <SelectItem value="POSTGAME" className="text-purple-600">
                    Postgame
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main Stage"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audioNotes" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              Audio Notes
            </Label>
            <Input
              id="audioNotes"
              value={audioNotes}
              onChange={(e) => setAudioNotes(e.target.value)}
              placeholder="e.g., Band plays fight song"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Duration (minutes)
            </Label>
            <Input id="duration" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <div className="text-xs text-muted-foreground">
              Event will end at {formatTime(startTime + Number.parseInt(duration) * 60)}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clockRef" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Clock Reference
            </Label>
            <Input
              id="clockRef"
              value={clockRef}
              onChange={(e) => setClockRef(e.target.value)}
              placeholder="e.g., 15:00 left in Q2, End of Q1"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this event"
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

