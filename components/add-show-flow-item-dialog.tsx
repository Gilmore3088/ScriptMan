"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createShowFlowItem } from "@/lib/db"
import type { ShowFlowItem } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Plus, X } from "lucide-react"

interface AddShowFlowItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameId: string
  onItemAdded: (item: ShowFlowItem) => void
}

interface CustomField {
  id: string
  label: string
  value: string
}

export function AddShowFlowItemDialog({ open, onOpenChange, gameId, onItemAdded }: AddShowFlowItemDialogProps) {
  const [activeTab, setActiveTab] = useState("core")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  // Form state
  const [formData, setFormData] = useState({
    // Core Fields
    itemNumber: "",
    startTime: "",
    presetTime: "",
    duration: "",
    privateNotes: "",
    clockRef: "",
    location: "",
    audioNotes: "",
    scriptRead: "",

    // Category
    category: "PREGAME",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { id: `custom-${Date.now()}`, label: "", value: "" }])
  }

  const updateCustomField = (id: string, field: "label" | "value", newValue: string) => {
    setCustomFields(customFields.map((f) => (f.id === id ? { ...f, [field]: newValue } : f)))
  }

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id))
  }

  const resetForm = () => {
    setFormData({
      itemNumber: "",
      startTime: "",
      presetTime: "",
      duration: "",
      privateNotes: "",
      clockRef: "",
      location: "",
      audioNotes: "",
      scriptRead: "",
      category: "PREGAME",
    })
    setCustomFields([])
    setActiveTab("core")
  }

  const handleSubmit = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault()
    console.log("Form submitted with data:", formData)

    // Validate required fields
    if (!formData.scriptRead) {
      console.log("Validation failed: Script Read is required")
      toast({
        title: "Error",
        description: "Script Read is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Creating new show flow item with data:", formData)

      // Convert itemNumber to a number if provided
      const itemNumber = formData.itemNumber ? Number.parseInt(formData.itemNumber, 10) : 0

      // Create a custom fields object from the array
      const customFieldsObject: Record<string, string> = {}
      customFields.forEach((field) => {
        if (field.label.trim()) {
          customFieldsObject[field.label.trim()] = field.value
        }
      })

      const newItem = {
        gameId,
        itemNumber,
        startTime: formData.startTime,
        presetTime: formData.presetTime,
        duration: formData.duration,
        privateNotes: formData.privateNotes,
        clockRef: formData.clockRef,
        location: formData.location,
        audioNotes: formData.audioNotes,
        scriptRead: formData.scriptRead,
        category: formData.category,
        customFields: JSON.stringify(customFieldsObject),
      }

      console.log("Calling createShowFlowItem with:", newItem)
      const createdItem = await createShowFlowItem(newItem)
      console.log("Item created successfully:", createdItem)

      onItemAdded(createdItem)

      toast({
        title: "Success",
        description: "Show flow item added successfully",
      })

      if (!keepOpen) {
        onOpenChange(false)
      }

      resetForm()
    } catch (error) {
      console.error("Error adding show flow item:", error)
      toast({
        title: "Error",
        description: "Failed to add show flow item: " + (error instanceof Error ? error.message : "Unknown error"),
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
          <DialogTitle>Add New Show Flow Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="core">Core Fields</TabsTrigger>
              <TabsTrigger value="script">Script & Audio</TabsTrigger>
              <TabsTrigger value="assets">Custom Assets</TabsTrigger>
            </TabsList>

            {/* Core Fields */}
            <TabsContent value="core" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="itemNumber">
                    # Item <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="itemNumber"
                    name="itemNumber"
                    value={formData.itemNumber}
                    onChange={handleChange}
                    placeholder="e.g., 1, A1, Break-2"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREGAME">Pregame</SelectItem>
                      <SelectItem value="IN GAME">In Game</SelectItem>
                      <SelectItem value="HALFTIME">Halftime</SelectItem>
                      <SelectItem value="POSTGAME">Postgame</SelectItem>
                      <SelectItem value="SPONSOR">Sponsor</SelectItem>
                      <SelectItem value="PROMO">Promo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    placeholder="e.g., 7:40 PM, -10:00"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="presetTime">Preset Time</Label>
                  <Input
                    id="presetTime"
                    name="presetTime"
                    value={formData.presetTime}
                    onChange={handleChange}
                    placeholder="e.g., -2:00 before start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 30s, 2m"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clockRef">Clock Reference</Label>
                  <Input
                    id="clockRef"
                    name="clockRef"
                    value={formData.clockRef}
                    onChange={handleChange}
                    placeholder="e.g., 15:00 left in Q2"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Stadium, Field, Broadcast Booth"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="privateNotes">Private Notes</Label>
                <Textarea
                  id="privateNotes"
                  name="privateNotes"
                  value={formData.privateNotes}
                  onChange={handleChange}
                  placeholder="Internal notes for staff only"
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            {/* Script & Audio */}
            <TabsContent value="script" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="audioNotes">Audio Notes</Label>
                <Input
                  id="audioNotes"
                  name="audioNotes"
                  value={formData.audioNotes}
                  onChange={handleChange}
                  placeholder="e.g., Play track X, Band, House music"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scriptRead">
                  Script Read <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="scriptRead"
                  name="scriptRead"
                  value={formData.scriptRead}
                  onChange={handleChange}
                  placeholder="The actual script copy to be read or displayed"
                  className="min-h-[200px]"
                  required
                />
              </div>
            </TabsContent>

            {/* Custom Assets */}
            <TabsContent value="assets" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Custom Asset Fields</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomField}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4">
                {customFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No custom fields added yet. Click "Add Field" to create custom asset fields.
                  </div>
                ) : (
                  customFields.map((field) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr,2fr,auto] gap-2 items-start border p-3 rounded-md"
                    >
                      <div>
                        <Label htmlFor={`${field.id}-label`} className="sr-only">
                          Field Name
                        </Label>
                        <Input
                          id={`${field.id}-label`}
                          value={field.label}
                          onChange={(e) => updateCustomField(field.id, "label", e.target.value)}
                          placeholder="Field Name"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field.id}-value`} className="sr-only">
                          Field Value
                        </Label>
                        <Textarea
                          id={`${field.id}-value`}
                          value={field.value}
                          onChange={(e) => updateCustomField(field.id, "value", e.target.value)}
                          placeholder="Field Value"
                          className="w-full min-h-[80px]"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomField(field.id)}
                        className="mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Common Asset Field Examples:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    <strong>Board Look</strong> - Full screen sponsor slide
                  </li>
                  <li>
                    <strong>Main</strong> - Main board content
                  </li>
                  <li>
                    <strong>AUX</strong> - Auxiliary board content
                  </li>
                  <li>
                    <strong>Lower Third</strong> - Sponsor name + brief tagline
                  </li>
                  <li>
                    <strong>Ribbon</strong> - Scrolling sponsor text
                  </li>
                  <li>
                    <strong>Control Room</strong> - Technical instructions
                  </li>
                  <li>
                    <strong>Pyro</strong> - Pyrotechnic cues
                  </li>
                  <li>
                    <strong>LED</strong> - LED board instructions
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={(e) => handleSubmit(e, true)}>
                {isSubmitting ? "Saving..." : "Save & Add Another"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Item"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

