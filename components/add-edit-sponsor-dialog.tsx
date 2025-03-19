"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSponsor, updateSponsor } from "@/lib/db"
import type { Sponsor, CustomDeliverable } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash } from "lucide-react"
import { Card } from "@/components/ui/card"

interface AddEditSponsorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sponsor: Sponsor | null
  onSponsorChange: (sponsor: Sponsor) => void
}

export function AddEditSponsorDialog({ open, onOpenChange, sponsor, onSponsorChange }: AddEditSponsorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    brandGuidelines: "",
    contractNotes: "",
    startDate: "",
    endDate: "",
    mentionsPerGame: "",
    totalMentionsRequired: "",
    scoreboardAdsPerGame: "",
    totalScoreboardAdsRequired: "",
    halftimeReadsPerGame: "",
    totalHalftimeReadsRequired: "",
    otherDeliverables: "",
    status: "active",
  })
  const [customDeliverables, setCustomDeliverables] = useState<CustomDeliverable[]>([])

  // Populate form when editing an existing sponsor
  useEffect(() => {
    if (sponsor) {
      setFormData({
        name: sponsor.name,
        contactName: sponsor.contactName || "",
        contactEmail: sponsor.contactEmail || "",
        contactPhone: sponsor.contactPhone || "",
        brandGuidelines: sponsor.brandGuidelines || "",
        contractNotes: sponsor.contractNotes || "",
        startDate: sponsor.startDate || "",
        endDate: sponsor.endDate || "",
        mentionsPerGame: sponsor.mentionsPerGame?.toString() || "",
        totalMentionsRequired: sponsor.totalMentionsRequired?.toString() || "",
        scoreboardAdsPerGame: sponsor.scoreboardAdsPerGame?.toString() || "",
        totalScoreboardAdsRequired: sponsor.totalScoreboardAdsRequired?.toString() || "",
        halftimeReadsPerGame: sponsor.halftimeReadsPerGame?.toString() || "",
        totalHalftimeReadsRequired: sponsor.totalHalftimeReadsRequired?.toString() || "",
        otherDeliverables: sponsor.otherDeliverables || "",
        status: sponsor.status,
      })
      setCustomDeliverables(sponsor.customDeliverables || [])
    } else {
      // Reset form for new sponsor
      setFormData({
        name: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        brandGuidelines: "",
        contractNotes: "",
        startDate: "",
        endDate: "",
        mentionsPerGame: "",
        totalMentionsRequired: "",
        scoreboardAdsPerGame: "",
        totalScoreboardAdsRequired: "",
        halftimeReadsPerGame: "",
        totalHalftimeReadsRequired: "",
        otherDeliverables: "",
        status: "active",
      })
      setCustomDeliverables([])
    }
  }, [sponsor, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addCustomDeliverable = () => {
    const newDeliverable: CustomDeliverable = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      name: "",
      description: "",
      perGame: undefined,
      totalRequired: undefined,
      completed: 0,
      type: "other",
    }
    setCustomDeliverables([...customDeliverables, newDeliverable])
  }

  const updateCustomDeliverable = (id: string, updates: Partial<CustomDeliverable>) => {
    setCustomDeliverables(
      customDeliverables.map((deliverable) => (deliverable.id === id ? { ...deliverable, ...updates } : deliverable)),
    )
  }

  const removeCustomDeliverable = (id: string) => {
    setCustomDeliverables(customDeliverables.filter((deliverable) => deliverable.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sponsor name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Convert string values to numbers where appropriate
      const sponsorData = {
        ...formData,
        mentionsPerGame: formData.mentionsPerGame ? Number.parseInt(formData.mentionsPerGame) : undefined,
        totalMentionsRequired: formData.totalMentionsRequired
          ? Number.parseInt(formData.totalMentionsRequired)
          : undefined,
        scoreboardAdsPerGame: formData.scoreboardAdsPerGame
          ? Number.parseInt(formData.scoreboardAdsPerGame)
          : undefined,
        totalScoreboardAdsRequired: formData.totalScoreboardAdsRequired
          ? Number.parseInt(formData.totalScoreboardAdsRequired)
          : undefined,
        halftimeReadsPerGame: formData.halftimeReadsPerGame
          ? Number.parseInt(formData.halftimeReadsPerGame)
          : undefined,
        totalHalftimeReadsRequired: formData.totalHalftimeReadsRequired
          ? Number.parseInt(formData.totalHalftimeReadsRequired)
          : undefined,
        customDeliverables: customDeliverables.map((deliverable) => ({
          ...deliverable,
          perGame: deliverable.perGame ? Number(deliverable.perGame) : undefined,
          totalRequired: deliverable.totalRequired ? Number(deliverable.totalRequired) : undefined,
          completed: deliverable.completed ? Number(deliverable.completed) : 0,
        })),
      }

      let updatedSponsor: Sponsor

      if (sponsor) {
        // Update existing sponsor
        updatedSponsor = await updateSponsor(sponsor.id, sponsorData)
        toast({
          title: "Success",
          description: "Sponsor updated successfully",
        })
      } else {
        // Create new sponsor
        updatedSponsor = await createSponsor(sponsorData)
        toast({
          title: "Success",
          description: "Sponsor created successfully",
        })
      }

      onSponsorChange(updatedSponsor)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving sponsor:", error)
      toast({
        title: "Error",
        description: sponsor ? "Failed to update sponsor" : "Failed to create sponsor",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{sponsor ? "Edit Sponsor" : "Add New Sponsor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contract">Contract Details</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="custom">Custom Deliverables</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Sponsor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Coca-Cola, Nike"
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="e.g., John Smith"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="e.g., john.smith@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
                <Textarea
                  id="brandGuidelines"
                  name="brandGuidelines"
                  value={formData.brandGuidelines}
                  onChange={handleChange}
                  placeholder="Enter any brand guidelines or requirements"
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contractNotes">Contract Notes</Label>
                <Textarea
                  id="contractNotes"
                  name="contractNotes"
                  value={formData.contractNotes}
                  onChange={handleChange}
                  placeholder="Enter contract details, scope, or special instructions"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Contract Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate">Contract End Date</Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="otherDeliverables">Other Deliverables</Label>
                <Textarea
                  id="otherDeliverables"
                  name="otherDeliverables"
                  value={formData.otherDeliverables}
                  onChange={handleChange}
                  placeholder="Enter any other deliverables not covered by the standard categories"
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="deliverables" className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="mentionsPerGame">Mentions Per Game</Label>
                  <Input
                    id="mentionsPerGame"
                    name="mentionsPerGame"
                    type="number"
                    min="0"
                    value={formData.mentionsPerGame}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="totalMentionsRequired">Total Mentions Required</Label>
                  <Input
                    id="totalMentionsRequired"
                    name="totalMentionsRequired"
                    type="number"
                    min="0"
                    value={formData.totalMentionsRequired}
                    onChange={handleChange}
                    placeholder="e.g., 45"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="scoreboardAdsPerGame">Scoreboard Ads Per Game</Label>
                  <Input
                    id="scoreboardAdsPerGame"
                    name="scoreboardAdsPerGame"
                    type="number"
                    min="0"
                    value={formData.scoreboardAdsPerGame}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="totalScoreboardAdsRequired">Total Scoreboard Ads Required</Label>
                  <Input
                    id="totalScoreboardAdsRequired"
                    name="totalScoreboardAdsRequired"
                    type="number"
                    min="0"
                    value={formData.totalScoreboardAdsRequired}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="halftimeReadsPerGame">Halftime Reads Per Game</Label>
                  <Input
                    id="halftimeReadsPerGame"
                    name="halftimeReadsPerGame"
                    type="number"
                    min="0"
                    value={formData.halftimeReadsPerGame}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="totalHalftimeReadsRequired">Total Halftime Reads Required</Label>
                  <Input
                    id="totalHalftimeReadsRequired"
                    name="totalHalftimeReadsRequired"
                    type="number"
                    min="0"
                    value={formData.totalHalftimeReadsRequired}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="custom" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Custom Deliverables</h3>
                <Button type="button" variant="outline" size="sm" onClick={addCustomDeliverable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Deliverable
                </Button>
              </div>

              {customDeliverables.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No custom deliverables added. Click the button above to add one.
                </div>
              ) : (
                <div className="space-y-4">
                  {customDeliverables.map((deliverable, index) => (
                    <Card key={deliverable.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Custom Deliverable #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomDeliverable(deliverable.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>

                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`deliverable-name-${deliverable.id}`}>Name</Label>
                          <Input
                            id={`deliverable-name-${deliverable.id}`}
                            value={deliverable.name}
                            onChange={(e) => updateCustomDeliverable(deliverable.id, { name: e.target.value })}
                            placeholder="e.g., Stadium Banner"
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`deliverable-type-${deliverable.id}`}>Type</Label>
                          <Select
                            value={deliverable.type}
                            onValueChange={(value) => updateCustomDeliverable(deliverable.id, { type: value as any })}
                          >
                            <SelectTrigger id={`deliverable-type-${deliverable.id}`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="audio">Audio</SelectItem>
                              <SelectItem value="visual">Visual</SelectItem>
                              <SelectItem value="digital">Digital</SelectItem>
                              <SelectItem value="print">Print</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2 mt-4">
                        <Label htmlFor={`deliverable-description-${deliverable.id}`}>Description</Label>
                        <Textarea
                          id={`deliverable-description-${deliverable.id}`}
                          value={deliverable.description || ""}
                          onChange={(e) => updateCustomDeliverable(deliverable.id, { description: e.target.value })}
                          placeholder="Enter details about this deliverable"
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`deliverable-per-game-${deliverable.id}`}>Per Game</Label>
                          <Input
                            id={`deliverable-per-game-${deliverable.id}`}
                            type="number"
                            min="0"
                            value={deliverable.perGame?.toString() || ""}
                            onChange={(e) =>
                              updateCustomDeliverable(deliverable.id, {
                                perGame: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g., 2"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`deliverable-total-${deliverable.id}`}>Total Required</Label>
                          <Input
                            id={`deliverable-total-${deliverable.id}`}
                            type="number"
                            min="0"
                            value={deliverable.totalRequired?.toString() || ""}
                            onChange={(e) =>
                              updateCustomDeliverable(deliverable.id, {
                                totalRequired: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g., 30"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (sponsor ? "Updating..." : "Creating...") : sponsor ? "Update Sponsor" : "Create Sponsor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

