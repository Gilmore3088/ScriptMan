"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Clock, Edit, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// Define types
type Element = {
  id: string
  name: string
  description: string
  type: string
  category: string
  sponsor_id?: string
  sponsor_name?: string
}

type ScriptElement = {
  id: string
  script_id: string
  element_id: string
  position: number
  category: "PREGAME" | "IN_GAME" | "HALFTIME" | "POSTGAME"
  start_time: string
  duration: number
  element_name: string
  element_description: string
  element_type: string
  element_category: string
  sponsor_id?: string
  sponsor_name?: string
}

type TimelineCategory = "PREGAME" | "IN_GAME" | "HALFTIME" | "POSTGAME"

const categoryColors = {
  PREGAME: "bg-blue-100 border-blue-300 text-blue-800",
  IN_GAME: "bg-green-100 border-green-300 text-green-800",
  HALFTIME: "bg-amber-100 border-amber-300 text-amber-800",
  POSTGAME: "bg-purple-100 border-purple-300 text-purple-800",
}

const categoryLabels = {
  PREGAME: "Pre-Game",
  IN_GAME: "In Game",
  HALFTIME: "Halftime",
  POSTGAME: "Post-Game",
}

// Timeline item component
function TimelineItem({ item }: { item: ScriptElement }) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    const { error } = await supabase.from("script_elements").delete().eq("id", item.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete element from script",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Element removed from script",
      })
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "No time set"
    try {
      return format(new Date(timeString), "h:mm a")
    } catch (e) {
      return "Invalid time"
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return ""
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className={`mb-2 rounded-md border p-3 ${categoryColors[item.category]} relative`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="font-medium">{item.element_name}</div>
          <div className="text-sm opacity-80">{item.element_description}</div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{formatTime(item.start_time)}</span>
            {item.duration && <span>({formatDuration(item.duration)})</span>}
          </div>
          {item.sponsor_name && <div className="mt-1 text-xs font-semibold">Sponsored by: {item.sponsor_name}</div>}
        </div>
        <div className="flex gap-1">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <EditElementForm element={item} onClose={() => setIsEditing(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit element form
function EditElementForm({ element, onClose }: { element: ScriptElement; onClose: () => void }) {
  const [date, setDate] = useState<Date | undefined>(element.start_time ? new Date(element.start_time) : undefined)
  const [time, setTime] = useState(element.start_time ? format(new Date(element.start_time), "HH:mm") : "")
  const [duration, setDuration] = useState(element.duration?.toString() || "")
  const [category, setCategory] = useState<TimelineCategory>(element.category)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let startTime = null
    if (date) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateObj = new Date(date)
      dateObj.setHours(hours, minutes)
      startTime = dateObj.toISOString()
    }

    const { error } = await supabase
      .from("script_elements")
      .update({
        category,
        start_time: startTime,
        duration: duration ? Number.parseInt(duration) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", element.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update element",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Element updated successfully",
      })
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Element: {element.element_name}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as TimelineCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PREGAME">Pre-Game</SelectItem>
              <SelectItem value="IN_GAME">In Game</SelectItem>
              <SelectItem value="HALFTIME">Halftime</SelectItem>
              <SelectItem value="POSTGAME">Post-Game</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration in seconds"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}

// Add element button and dialog
function AddElementButton({ category, scriptId }: { category: TimelineCategory; scriptId: string }) {
  const [open, setOpen] = useState(false)
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchElements = async () => {
      const { data, error } = await supabase.from("elements").select("*")

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load elements",
          variant: "destructive",
        })
      } else if (data) {
        setElements(data)
      }
    }

    fetchElements()
  }, [supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedElement) return

    let startTime = null
    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateObj = new Date(date)
      dateObj.setHours(hours, minutes)
      startTime = dateObj.toISOString()
    }

    // Get the highest position for this category
    const { data: positionData } = await supabase
      .from("script_elements")
      .select("position")
      .eq("script_id", scriptId)
      .eq("category", category)
      .order("position", { ascending: false })
      .limit(1)

    const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0

    const { error } = await supabase.from("script_elements").insert({
      script_id: scriptId,
      element_id: selectedElement,
      position,
      category,
      start_time: startTime,
      duration: duration ? Number.parseInt(duration) : null,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add element to script",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Element added to script",
      })
      setOpen(false)
      setSelectedElement(null)
      setDate(undefined)
      setTime("")
      setDuration("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Element
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Element to {categoryLabels[category]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="element">Element</Label>
              <Select value={selectedElement || ""} onValueChange={setSelectedElement}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an element" />
                </SelectTrigger>
                <SelectContent>
                  {elements.map((element) => (
                    <SelectItem key={element.id} value={element.id}>
                      {element.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration in seconds"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedElement}>
              Add to Timeline
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Timeline category lane component
function TimelineLane({
  category,
  items,
  scriptId,
}: {
  category: TimelineCategory
  items: ScriptElement[]
  scriptId: string
}) {
  return (
    <Card className="mb-6">
      <CardHeader className={`py-3 ${categoryColors[category]} border-b`}>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{categoryLabels[category]}</span>
          <AddElementButton category={category} scriptId={scriptId} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {items.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center ${categoryColors[category]} bg-opacity-50`}
          >
            <p className="text-gray-500">Drag elements here or click the + button to add</p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Element library component
function ElementLibrary({ scriptId }: { scriptId: string }) {
  const [elements, setElements] = useState<Element[]>([])
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchElements = async () => {
      const { data, error } = await supabase.from("elements").select(`
          id,
          name,
          description,
          type,
          category,
          sponsor_id,
          sponsors(name)
        `)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load elements",
          variant: "destructive",
        })
      } else if (data) {
        const formattedElements = data.map((el) => ({
          ...el,
          sponsor_name: el.sponsors?.name,
        }))
        setElements(formattedElements)
      }
    }

    fetchElements()
  }, [supabase, toast])

  const handleAddToTimeline = async (element: Element, category: TimelineCategory) => {
    // Get the highest position for this category
    const { data: positionData } = await supabase
      .from("script_elements")
      .select("position")
      .eq("script_id", scriptId)
      .eq("category", category)
      .order("position", { ascending: false })
      .limit(1)

    const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0

    const { error } = await supabase.from("script_elements").insert({
      script_id: scriptId,
      element_id: element.id,
      position,
      category,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add element to script",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Element added to ${categoryLabels[category]}`,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Element Library</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {elements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No elements found</p>
          ) : (
            elements.map((element) => (
              <ElementCard key={element.id} element={element} onAddToTimeline={handleAddToTimeline} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Element card component
function ElementCard({
  element,
  onAddToTimeline,
}: {
  element: Element
  onAddToTimeline: (element: Element, category: TimelineCategory) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{element.name}</h3>
          <p className="text-sm text-muted-foreground">{element.description}</p>
          {element.sponsor_name && (
            <div className="mt-1 text-xs font-semibold">Sponsored by: {element.sponsor_name}</div>
          )}
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Add to Timeline
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid gap-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  onAddToTimeline(element, "PREGAME")
                  setIsOpen(false)
                }}
              >
                Add to Pre-Game
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  onAddToTimeline(element, "IN_GAME")
                  setIsOpen(false)
                }}
              >
                Add to In Game
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  onAddToTimeline(element, "HALFTIME")
                  setIsOpen(false)
                }}
              >
                Add to Halftime
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  onAddToTimeline(element, "POSTGAME")
                  setIsOpen(false)
                }}
              >
                Add to Post-Game
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  )
}

// Main interactive timeline component
export default function SimpleTimeline({ scriptId }: { scriptId: string }) {
  const [scriptElements, setScriptElements] = useState<ScriptElement[]>([])
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchScriptElements = async () => {
      const { data, error } = await supabase.rpc("get_script_elements", { p_script_id: scriptId })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load script elements",
          variant: "destructive",
        })
      } else if (data) {
        setScriptElements(data)
      }
    }

    fetchScriptElements()

    // Set up real-time subscription
    const channel = supabase
      .channel("script_elements_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "script_elements",
          filter: `script_id=eq.${scriptId}`,
        },
        () => {
          fetchScriptElements()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, scriptId, toast])

  const pregameItems = scriptElements.filter((item) => item.category === "PREGAME")
  const inGameItems = scriptElements.filter((item) => item.category === "IN_GAME")
  const halftimeItems = scriptElements.filter((item) => item.category === "HALFTIME")
  const postgameItems = scriptElements.filter((item) => item.category === "POSTGAME")

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Timeline</h2>
        <TimelineLane category="PREGAME" items={pregameItems} scriptId={scriptId} />
        <TimelineLane category="IN_GAME" items={inGameItems} scriptId={scriptId} />
        <TimelineLane category="HALFTIME" items={halftimeItems} scriptId={scriptId} />
        <TimelineLane category="POSTGAME" items={postgameItems} scriptId={scriptId} />
      </div>
      <div>
        <ElementLibrary scriptId={scriptId} />
      </div>
    </div>
  )
}

