"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSponsor, getSponsor } from "@/lib/db"

export function AddDeliverableDialog({
  open,
  onOpenChange,
  sponsorId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sponsorId: string
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    quantity: 1,
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current sponsor data
      const sponsor = await getSponsor(sponsorId)

      if (!sponsor) {
        throw new Error("Sponsor not found")
      }

      // Add new deliverable to existing ones
      const deliverables = [
        ...(sponsor.deliverables || []),
        {
          type: formData.type,
          description: formData.description,
          quantity: formData.quantity,
          fulfilled: 0,
        },
      ]

      // Update sponsor with new deliverables
      await updateSponsor(sponsorId, { deliverables })

      // Reset form and close dialog
      setFormData({ type: "", description: "", quantity: 1 })
      onOpenChange(false)

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("Error adding deliverable:", error)
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Deliverable</DialogTitle>
            <DialogDescription>Add a new contracted deliverable for this sponsor.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Deliverable Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PA Reads">PA Reads</SelectItem>
                  <SelectItem value="Title Sponsorship">Title Sponsorship</SelectItem>
                  <SelectItem value="Social Shoutout">Social Shoutout</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Promo">Promo</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the deliverable"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Deliverable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

