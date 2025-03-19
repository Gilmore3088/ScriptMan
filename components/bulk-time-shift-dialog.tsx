"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Clock, ArrowRight } from "lucide-react"

interface BulkTimeShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShiftApplied: (minutes: number, shiftType: "all" | "selected" | "after") => void
}

export function BulkTimeShiftDialog({ open, onOpenChange, onShiftApplied }: BulkTimeShiftDialogProps) {
  const [minutes, setMinutes] = useState("15")
  const [direction, setDirection] = useState<"earlier" | "later">("later")
  const [shiftType, setShiftType] = useState<"all" | "selected" | "after">("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!minutes || isNaN(Number(minutes))) {
      toast({
        title: "Error",
        description: "Please enter a valid number of minutes",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate the shift amount in minutes (positive for later, negative for earlier)
      const shiftAmount = direction === "later" ? Number(minutes) : -Number(minutes)

      // Call the callback with the shift amount
      onShiftApplied(shiftAmount, shiftType)

      toast({
        title: "Success",
        description: `Events shifted ${Math.abs(shiftAmount)} minutes ${direction}`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error shifting events:", error)
      toast({
        title: "Error",
        description: "Failed to shift events",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Bulk Time Shift
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="minutes">Shift by (minutes)</Label>
            <Input
              id="minutes"
              type="number"
              min="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Direction</Label>
            <RadioGroup value={direction} onValueChange={(value) => setDirection(value as "earlier" | "later")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="earlier" id="earlier" />
                <Label htmlFor="earlier" className="cursor-pointer">
                  Earlier
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="later" id="later" />
                <Label htmlFor="later" className="cursor-pointer">
                  Later
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Apply to</Label>
            <RadioGroup
              value={shiftType}
              onValueChange={(value) => setShiftType(value as "all" | "selected" | "after")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">
                  All events
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer">
                  Selected events only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after" className="cursor-pointer">
                  Events after a specific time
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-blue-50 p-3 rounded-md text-sm">
            <div className="flex items-center gap-2 font-medium text-blue-800">
              <Clock className="h-4 w-4" />
              <span>Preview</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span>7:00 PM</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium">
                {direction === "earlier"
                  ? `${6}:${60 - (Number(minutes) % 60) < 10 ? "0" + (60 - (Number(minutes) % 60)) : 60 - (Number(minutes) % 60)} PM`
                  : `${7 + Math.floor(Number(minutes) / 60)}:${Number(minutes) % 60 < 10 ? "0" + (Number(minutes) % 60) : Number(minutes) % 60} PM`}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Applying..." : "Apply Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

