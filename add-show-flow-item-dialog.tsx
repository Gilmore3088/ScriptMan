"use client"

import type React from "react"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface ProductionCues {
  boardLook: boolean
  main: boolean
  aux: boolean
  lowerThird: boolean
  ribbon: boolean
  controlRoom: boolean
}

interface ShowFlowItem {
  id: string
  itemNumber: number
  start: string
  preset: string
  duration: string
  privateNotes: string
  clock: string
  location: string
  audioNotes: string
  read: string
  productionCues: ProductionCues
}

interface AddShowFlowItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (item: ShowFlowItem) => void
  gameId: string
  itemNumber: number
}

export function AddShowFlowItemDialog({ open, onOpenChange, onAdd, gameId, itemNumber }: AddShowFlowItemDialogProps) {
  const [formData, setFormData] = useState<Omit<ShowFlowItem, "id">>({
    itemNumber,
    start: "",
    preset: "",
    duration: "",
    privateNotes: "",
    clock: "",
    location: "",
    audioNotes: "",
    read: "",
    productionCues: {
      boardLook: false,
      main: false,
      aux: false,
      lowerThird: false,
      ribbon: false,
      controlRoom: false,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: keyof ProductionCues, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      productionCues: {
        ...prev.productionCues,
        [name]: checked,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      id: uuidv4(),
      ...formData,
    })

    // Reset form
    setFormData({
      itemNumber: itemNumber + 1,
      start: "",
      preset: "",
      duration: "",
      privateNotes: "",
      clock: "",
      location: "",
      audioNotes: "",
      read: "",
      productionCues: {
        boardLook: false,
        main: false,
        aux: false,
        lowerThird: false,
        ribbon: false,
        controlRoom: false,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Show Flow Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="core">
            <TabsList className="mb-4">
              <TabsTrigger value="core">Core Fields</TabsTrigger>
              <TabsTrigger value="production">Production Cues</TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemNumber"># Item</Label>
                  <Input
                    id="itemNumber"
                    name="itemNumber"
                    value={formData.itemNumber}
                    onChange={handleInputChange}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">Start</Label>
                  <Input
                    id="start"
                    name="start"
                    value={formData.start}
                    onChange={handleInputChange}
                    placeholder="HH:MM:SS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset">Preset</Label>
                  <Input id="preset" name="preset" value={formData.preset} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="MM:SS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clock">CLOCK</Label>
                  <Input id="clock" name="clock" value={formData.clock} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">LOCATION</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioNotes">AUDIO NOTES</Label>
                <Input id="audioNotes" name="audioNotes" value={formData.audioNotes} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="read">READ</Label>
                <Textarea id="read" name="read" value={formData.read} onChange={handleInputChange} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateNotes">Private Notes</Label>
                <Textarea
                  id="privateNotes"
                  name="privateNotes"
                  value={formData.privateNotes}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="boardLook"
                      checked={formData.productionCues.boardLook}
                      onCheckedChange={(checked) => handleCheckboxChange("boardLook", checked as boolean)}
                    />
                    <Label htmlFor="boardLook">BOARD LOOK</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="main"
                      checked={formData.productionCues.main}
                      onCheckedChange={(checked) => handleCheckboxChange("main", checked as boolean)}
                    />
                    <Label htmlFor="main">MAIN</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aux"
                      checked={formData.productionCues.aux}
                      onCheckedChange={(checked) => handleCheckboxChange("aux", checked as boolean)}
                    />
                    <Label htmlFor="aux">AUX</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowerThird"
                      checked={formData.productionCues.lowerThird}
                      onCheckedChange={(checked) => handleCheckboxChange("lowerThird", checked as boolean)}
                    />
                    <Label htmlFor="lowerThird">LOWER THIRD</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ribbon"
                      checked={formData.productionCues.ribbon}
                      onCheckedChange={(checked) => handleCheckboxChange("ribbon", checked as boolean)}
                    />
                    <Label htmlFor="ribbon">RIBBON</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="controlRoom"
                      checked={formData.productionCues.controlRoom}
                      onCheckedChange={(checked) => handleCheckboxChange("controlRoom", checked as boolean)}
                    />
                    <Label htmlFor="controlRoom">CONTROL ROOM</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

