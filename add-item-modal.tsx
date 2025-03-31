"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

// Default element types if database fetch fails
const DEFAULT_ELEMENT_TYPES = [
  "Sponsor Read",
  "Promotion",
  "Generic Event",
  "Permanent Marker",
  "Video",
  "Audio",
  "Graphic",
]

export function AddItemModal({ isOpen, onClose, onAddItem, gameId }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [elementType, setElementType] = useState("")
  const [elementId, setElementId] = useState("")
  const [elements, setElements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [scriptTemplate, setScriptTemplate] = useState("")
  const [timeOffset, setTimeOffset] = useState("")
  const [uniqueElementTypes, setUniqueElementTypes] = useState([])

  // Create a new Supabase client directly (avoid singleton issues)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true

    const fetchElements = async () => {
      if (!isOpen) return

      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching elements...")
        const { data, error } = await supabase.from("elements").select("id, name, type, script_template")

        if (error) throw error

        console.log("Elements fetched:", data)

        if (isMounted) {
          setElements(data || [])

          // Extract unique element types
          const types = [...new Set(data?.map((item) => item.type) || [])]
          console.log("Unique element types:", types)

          // Use types from database or fall back to defaults if empty
          setUniqueElementTypes(types.length > 0 ? types : DEFAULT_ELEMENT_TYPES)
        }
      } catch (err) {
        console.error("Error fetching elements:", err)
        if (isMounted) {
          setError(err.message)
          // Fall back to default element types
          setUniqueElementTypes(DEFAULT_ELEMENT_TYPES)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchElements()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  const handleElementChange = (value) => {
    setElementId(value)
    const selectedElement = elements.find((el) => el.id === value)
    if (selectedElement) {
      setScriptTemplate(selectedElement.script_template || "")
    } else {
      setScriptTemplate("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      // Prepare the data object with only the fields that exist in the timeline_events table
      const eventData = {
        title,
        description,
        element_id: elementId || null,
        element_type: elementType,
        game_id: gameId,
        time_offset: timeOffset || null,
        // Removed clock_ref as it doesn't exist in the table
      }

      console.log("Creating timeline event with data:", eventData)

      const { data, error } = await supabase.from("timeline_events").insert(eventData).select().single()

      if (error) throw error

      console.log("Timeline event created:", data)
      toast({
        title: "Success",
        description: "Timeline event added successfully",
      })

      onAddItem(data)
      resetForm()
      onClose()
    } catch (err) {
      console.error("Error creating timeline event:", err)
      toast({
        title: "Error",
        description: `Failed to create timeline event: ${err.message}`,
        variant: "destructive",
      })
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setElementType("")
    setElementId("")
    setScriptTemplate("")
    setTimeOffset("")
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Timeline Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="elementType">Element Type</Label>
            <Select value={elementType} onValueChange={setElementType}>
              <SelectTrigger id="elementType">
                <SelectValue placeholder="Select element type" />
              </SelectTrigger>
              <SelectContent>
                {uniqueElementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="element">Script Element</Label>
            <Select value={elementId} onValueChange={handleElementChange}>
              <SelectTrigger id="element">
                <SelectValue placeholder="Select script element" />
              </SelectTrigger>
              <SelectContent>
                {elements
                  .filter((el) => !elementType || el.type === elementType)
                  .map((element) => (
                    <SelectItem key={element.id} value={element.id}>
                      {element.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {scriptTemplate && (
              <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                <p className="font-medium mb-1">Script Template:</p>
                <p className="whitespace-pre-wrap">{scriptTemplate}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Placeholders like {"{teamName}"} will be replaced with actual values.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeOffset">Time Offset</Label>
            <Input
              id="timeOffset"
              value={timeOffset}
              onChange={(e) => setTimeOffset(e.target.value)}
              placeholder="e.g. -10m, +5m, 0m"
            />
            <p className="text-xs text-muted-foreground">
              Relative to game start time. Use -10m for 10 minutes before, +5m for 5 minutes after.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

