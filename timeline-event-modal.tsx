"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

export function TimelineEventModal({ isOpen, onClose, onSave, event, startTime }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeOffset, setTimeOffset] = useState(0)
  const [elementId, setElementId] = useState("")
  const [elementType, setElementType] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")
      setTimeOffset(event.time_offset || 0)
      setElementId(event.element_id || "")
      setElementType(event.element_type || "")
    } else {
      setTitle("")
      setDescription("")
      setTimeOffset(0)
      setElementId("")
      setElementType("")
    }
  }, [event])

  const handleSave = () => {
    const eventData = {
      title,
      description,
      timeOffset,
      elementId: elementId || null,
      elementType: elementType || null,
    }

    onSave(eventData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-time" className="text-right">
              Time
            </Label>
            <div className="col-span-3">
              {startTime ? (
                <Input id="event-time" value={format(startTime, "h:mm:ss a")} disabled />
              ) : (
                <Input
                  id="time-offset"
                  type="number"
                  value={timeOffset}
                  onChange={(e) => setTimeOffset(Number.parseInt(e.target.value))}
                  placeholder="Time offset in seconds"
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="element_type" className="text-right">
              Type
            </Label>
            <Input
              id="element_type"
              value={elementType}
              onChange={(e) => setElementType(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

