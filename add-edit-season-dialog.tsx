"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSeason, updateSeason } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import type { Season } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"

interface AddEditSeasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  season: Season | null
  onSeasonChange: (season: Season) => void
}

export function AddEditSeasonDialog({ open, onOpenChange, season, onSeasonChange }: AddEditSeasonDialogProps) {
  const [title, setTitle] = useState("")
  const [sport, setSport] = useState("")
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("draft")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing an existing season
  useEffect(() => {
    if (season) {
      setTitle(season.title)
      setSport(season.sport)
      setYear(season.year)
      setDescription(season.description || "")
      setStatus(season.status || "draft")
      setErrors({})
    } else {
      // Reset form for new season
      setTitle("")
      setSport("")
      setYear(new Date().getFullYear())
      setDescription("")
      setStatus("draft")
      setErrors({})
    }
  }, [season, open])

  // Update the handleSubmit function to only send fields that exist in the database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}
    if (!title.trim()) {
      newErrors.title = "Season Title is required"
    }
    if (!sport) {
      newErrors.sport = "Sport is required"
    }
    if (!year) {
      newErrors.year = "Year is required"
    }

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)
      setErrors({})

      let updatedSeason: Season

      if (season) {
        // Update existing season - only send fields that exist in the database
        updatedSeason = await updateSeason(season.id, {
          title,
          sport,
          year,
          description,
          status,
        })

        toast({
          title: "Success",
          description: "Season updated successfully",
        })
      } else {
        // Create new season - only send fields that exist in the database
        const seasonData = {
          title,
          sport,
          year,
          description,
          status,
        }

        updatedSeason = await createSeason(seasonData)

        toast({
          title: "Success",
          description: "Season created successfully",
        })
      }

      onSeasonChange(updatedSeason)
      onOpenChange(false) // Close the dialog after successful submission
    } catch (error) {
      console.error("Error saving season:", error)

      // More detailed error message
      let errorMessage = "An unexpected error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: season ? `Failed to update season: ${errorMessage}` : `Failed to create season: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate year options (current year +/- 5 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // Common sports options
  const sportOptions = [
    "Football",
    "Basketball",
    "Baseball",
    "Soccer",
    "Hockey",
    "Volleyball",
    "Tennis",
    "Golf",
    "Other",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{season ? "Edit Season" : "Add New Season"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="flex items-center">
              Season Title <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) {
                  setErrors({ ...errors, title: "" })
                }
              }}
              placeholder="e.g., Fall Football Season"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sport" className="flex items-center">
              Sport <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={sport}
              onValueChange={(value) => {
                setSport(value)
                if (errors.sport) {
                  setErrors({ ...errors, sport: "" })
                }
              }}
            >
              <SelectTrigger id="sport" className={errors.sport ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Baseball">Baseball</SelectItem>
                <SelectItem value="Soccer">Soccer</SelectItem>
                <SelectItem value="Hockey">Hockey</SelectItem>
                <SelectItem value="Volleyball">Volleyball</SelectItem>
                <SelectItem value="Tennis">Tennis</SelectItem>
                <SelectItem value="Golf">Golf</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.sport && <p className="text-red-500 text-sm">{errors.sport}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="year" className="flex items-center">
              Year <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={year.toString()}
              onValueChange={(value) => {
                setYear(Number.parseInt(value))
                if (errors.year) {
                  setErrors({ ...errors, year: "" })
                }
              }}
            >
              <SelectTrigger id="year" className={errors.year ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.year && <p className="text-red-500 text-sm">{errors.year}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional notes or context about this season"
              className="min-h-[80px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (season ? "Updating..." : "Creating...") : season ? "Update Season" : "Create Season"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

