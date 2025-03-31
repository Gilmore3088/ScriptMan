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
import { CalendarIcon, Clock, Edit, Trash2, GripVertical, Plus, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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
  period?: GamePeriod
  category?: GamePeriod // For backward compatibility
  start_time: string
  duration: number
  element_name: string
  element_description: string
  element_type: string
  element_category: string
  sponsor_id?: string
  sponsor_name?: string
}

type GamePeriod = "PREGAME" | "IN_GAME" | "HALFTIME" | "POSTGAME"

const periodColors = {
  PREGAME: "bg-blue-100 border-blue-300 text-blue-800",
  IN_GAME: "bg-green-100 border-green-300 text-green-800",
  HALFTIME: "bg-amber-100 border-amber-300 text-amber-800",
  POSTGAME: "bg-purple-100 border-purple-300 text-purple-800",
}

const periodLabels = {
  PREGAME: "Pre-Game",
  IN_GAME: "In Game",
  HALFTIME: "Halftime",
  POSTGAME: "Post-Game",
}

const elementTypeColors = {
  ANNOUNCEMENT: "bg-indigo-100 text-indigo-800 border-indigo-300",
  PROMOTION: "bg-pink-100 text-pink-800 border-pink-300",
  ACTIVITY: "bg-cyan-100 text-cyan-800 border-cyan-300",
  ENTERTAINMENT: "bg-orange-100 text-orange-800 border-orange-300",
  SPONSOR: "bg-emerald-100 text-emerald-800 border-emerald-300",
  OTHER: "bg-gray-100 text-gray-800 border-gray-300",
}

// Helper function to get the period from the script element
// This handles both the new 'period' field and the old 'category' field
function getElementPeriod(element: ScriptElement): GamePeriod {
  return element.period || element.category || "PREGAME"
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

  // Get the element type color, defaulting to OTHER if not found
  const typeColor = elementTypeColors[item.element_type as keyof typeof elementTypeColors] || elementTypeColors.OTHER
  const period = getElementPeriod(item)

  return (
    <div className={`mb-2 rounded-md border p-3 ${periodColors[period]} relative`}>
      <div className="flex items-center gap-2">
        <div className="cursor-grab">
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.element_name}</span>
            <Badge className={`text-xs ${typeColor}`}>{item.element_type}</Badge>
          </div>
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
  const [period, setPeriod] = useState<GamePeriod>(getElementPeriod(element))
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

    // Check if we should update period or category
    const updateData: any = {
      start_time: startTime,
      duration: duration ? Number.parseInt(duration) : null,
      updated_at: new Date().toISOString(),
    }

    // Try to update both fields for compatibility
    updateData.period = period
    updateData.category = period

    const { error } = await supabase.from("script_elements").update(updateData).eq("id", element.id)

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
          <Label htmlFor="period">Game Period</Label>
          <Select value={period} onValueChange={(value) => setPeriod(value as GamePeriod)}>
            <SelectTrigger>
              <SelectValue placeholder="Select game period" />
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

// Timeline period lane component
function TimelineLane({
  period,
  items,
  scriptId,
}: {
  period: GamePeriod
  items: ScriptElement[]
  scriptId: string
}) {
  return (
    <Card className="mb-6">
      <CardHeader className={`py-3 ${periodColors[period]} border-b`}>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{periodLabels[period]}</span>
          <AddElementButton period={period} scriptId={scriptId} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {items.length === 0 ? (
          <div className={`border-2 border-dashed rounded-md p-6 text-center ${periodColors[period]} bg-opacity-50`}>
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

// Add element button and dialog
function AddElementButton({ period, scriptId }: { period: GamePeriod; scriptId: string }) {
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

    // Get the highest position for this period
    const { data: positionData } = await supabase
      .from("script_elements")
      .select("position")
      .eq("script_id", scriptId)
      .eq("period", period)
      .order("position", { ascending: false })
      .limit(1)

    const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0

    // Insert with both period and category for compatibility
    const { error } = await supabase.from("script_elements").insert({
      script_id: scriptId,
      element_id: selectedElement,
      position,
      period,
      category: period, // For backward compatibility
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
          <DialogTitle>Add Element to {periodLabels[period]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="element">Element</Label>
              <Select value={selectedElement || "none"} onValueChange={setSelectedElement}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an element" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Select an element
                  </SelectItem>
                  {elements.map((element) => (
                    <SelectItem key={element.id} value={element.id}>
                      {element.name} - {element.type} {element.sponsor_name ? `(${element.sponsor_name})` : ""}
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

// Element library component
function ElementLibrary({ scriptId }: { scriptId: string }) {
  const [elements, setElements] = useState<Element[]>([])
  const [elementTypeFilter, setElementTypeFilter] = useState<string | null>(null)
  const [sponsoredFilter, setSponsoredFilter] = useState<string | null>(null)
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

  const handleAddToTimeline = async (element: Element, period: GamePeriod) => {
    // Get the highest position for this period
    const { data: positionData } = await supabase
      .from("script_elements")
      .select("position")
      .eq("script_id", scriptId)
      .eq("period", period)
      .order("position", { ascending: false })
      .limit(1)

    const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0

    // Insert with both period and category for compatibility
    const { error } = await supabase.from("script_elements").insert({
      script_id: scriptId,
      element_id: element.id,
      position,
      period,
      category: period, // For backward compatibility
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
        description: `Element added to ${periodLabels[period]}`,
      })
    }
  }

  // Get unique element types for filtering
  const elementTypes = Array.from(new Set(elements.map((el) => el.type)))

  // Filter elements based on selected filters
  const filteredElements = elements.filter((element) => {
    // Filter by element type if a type is selected
    if (elementTypeFilter && element.type !== elementTypeFilter) {
      return false
    }

    // Filter by sponsored status
    if (sponsoredFilter === "sponsored" && !element.sponsor_id) {
      return false
    }
    if (sponsoredFilter === "non-sponsored" && element.sponsor_id) {
      return false
    }

    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Element Library</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="elementType">Element Type</Label>
                  <Select
                    value={elementTypeFilter || "all"}
                    onValueChange={(value) => setElementTypeFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {elementTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sponsored">Sponsorship</Label>
                  <Select
                    value={sponsoredFilter || "all"}
                    onValueChange={(value) => setSponsoredFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All elements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All elements</SelectItem>
                      <SelectItem value="sponsored">Sponsored only</SelectItem>
                      <SelectItem value="non-sponsored">Non-sponsored only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setElementTypeFilter(null)
                    setSponsoredFilter(null)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {filteredElements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No elements found</p>
          ) : (
            filteredElements.map((element) => (
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
  onAddToTimeline: (element: Element, period: GamePeriod) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Get the element type color, defaulting to OTHER if not found
  const typeColor = elementTypeColors[element.type as keyof typeof elementTypeColors] || elementTypeColors.OTHER

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{element.name}</h3>
            <Badge className={`text-xs ${typeColor}`}>{element.type}</Badge>
          </div>
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
export default function InteractiveTimeline({ scriptId }: { scriptId: string }) {
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
        // Map both period and category for backward compatibility
        const updatedData = data.map((item) => ({
          ...item,
          period: item.period || item.category,
          category: item.category || item.period,
        }))
        setScriptElements(updatedData)
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

  const pregameItems = scriptElements.filter((item) => getElementPeriod(item) === "PREGAME")
  const inGameItems = scriptElements.filter((item) => getElementPeriod(item) === "IN_GAME")
  const halftimeItems = scriptElements.filter((item) => getElementPeriod(item) === "HALFTIME")
  const postgameItems = scriptElements.filter((item) => getElementPeriod(item) === "POSTGAME")

  // const [events, setEvents] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedTime, setSelectedTime] = useState(null);
  // const [selectedEvent, setSelectedEvent] = useState(null);
  // const [startTime, setStartTime] = useState(() => {
  //   const now = new Date();
  //   now.setHours(18, 0, 0, 0); // Default to 6:00 PM
  //   return now;
  // });
  // const [endTime, setEndTime] = useState(() => {
  //   const end = new Date(startTime);
  //   end.setHours(end.getHours() + 4); // Default 4 hour window
  //   return end;
  // });
  // const timelineRef = useRef(null);
  // const { toast } = useToast();

  // const pixelsPerMinute = 3;
  // const totalMinutes = (endTime - startTime) / 60000;
  // const timelineWidth = totalMinutes * pixelsPerMinute;

  // useEffect(() => {
  //   if (scriptId) {
  //     fetchEvents();
  //   }
  // }, [scriptId]);

  // const fetchEvents = async () => {
  //   const supabase = createClient();
  //   const { data, error } = await supabase
  //     .from('script_timeline_events')
  //     .select(`
  //       id,
  //       title,
  //       start_time,
  //       duration,
  //       period,
  //       location,
  //       audio_notes,
  //       clock_reference,
  //       notes,
  //       element_id,
  //       script_elements(id, title, element_type, period)
  //     `)
  //     .eq('script_id', scriptId)
  //     .order('start_time');

  //   if (error) {
  //     console.error('Error fetching events:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to load timeline events",
  //       variant: "destructive",
  //     });
  //   } else {
  //     setEvents(data || []);
  //   }
  // };

  // const handleAddEvent = (time) => {
  //   setSelectedTime(time);
  //   setSelectedEvent(null);
  //   setIsModalOpen(true);
  // };

  // const handleEditEvent = (event) => {
  //   setSelectedEvent(event);
  //   setSelectedTime(new Date(event.start_time));
  //   setIsModalOpen(true);
  // };

  // const handleDeleteEvent = async (eventId) => {
  //   if (confirm('Are you sure you want to delete this event?')) {
  //     const supabase = createClient();
  //     const { error } = await supabase
  //       .from('script_timeline_events')
  //       .delete()
  //       .eq('id', eventId);

  //   if (error) {
  //     console.error('Error deleting event:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete event",
  //       variant: "destructive",
  //     });
  //   } else {
  //     toast({
  //       title: "Success",
  //       description: "Event deleted successfully",
  //     });
  //     fetchEvents();
  //   }
  // }
  // };

  // const handleSaveEvent = async (eventData) => {
  //   const supabase = createClient();

  //   const formattedData = {
  //     ...eventData,
  //     script_id: scriptId,
  //     start_time: selectedTime.toISOString(),
  //   };

  //   if (selectedEvent) {
  //     // Update existing event
  //     const { error } = await supabase
  //       .from('script_timeline_events')
  //       .update(formattedData)
  //       .eq('id', selectedEvent.id);

  //     if (error) {
  //       console.error('Error updating event:', error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to update event",
  //         variant: "destructive",
  //       });
  //     } else {
  //       toast({
  //         title: "Success",
  //         description: "Event updated successfully",
  //       });
  //       setIsModalOpen(false);
  //       fetchEvents();
  //     }
  //   } else {
  //     // Create new event
  //     const { error } = await supabase
  //       .from('script_timeline_events')
  //       .insert(formattedData);

  //     if (error) {
  //       console.error('Error creating event:', error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to create event",
  //         variant: "destructive",
  //       });
  //     } else {
  //       toast({
  //         title: "Success",
  //         description: "Event created successfully",
  //       });
  //       setIsModalOpen(false);
  //       fetchEvents();
  //     }
  //   }
  // };

  // const adjustTimeWindow = (direction) => {
  //   const amount = direction === 'earlier' ? -60 : 60; // 1 hour in minutes
  //   const newStartTime = new Date(startTime.getTime() + amount * 60000);
  //   const newEndTime = new Date(endTime.getTime() + amount * 60000);
  //   setStartTime(newStartTime);
  //   setEndTime(newEndTime);
  // };

  // const renderTimeMarkers = () => {
  //   const markers = [];
  //   const currentTime = new Date(startTime);

  //   while (currentTime <= endTime) {
  //     const position = ((currentTime - startTime) / 60000) * pixelsPerMinute;
  //     const isHour = currentTime.getMinutes() === 0;
  //     const isHalfHour = currentTime.getMinutes() === 30;

  //     markers.push(
  //       <div
  //         key={currentTime.toISOString()}
  //         className={`absolute ${isHour ? 'h-4 border-l-2' : isHalfHour ? 'h-3 border-l' : 'h-2 border-l'} border-gray-300`}
  //         style={{ left: `${position}px` }}
  //       >
  //         {isHour && (
  //           <span className="absolute -top-6 -translate-x-1/2 text-xs font-medium">
  //             {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
  //           </span>
  //         )}
  //       </div>
  //     );

  //     // Add 15 minutes
  //     currentTime.setMinutes(currentTime.getMinutes() + 15);
  //   }

  //   return markers;
  // };

  // const renderEvents = () => {
  //   return events.map(event => {
  //     const startDate = new Date(event.start_time);
  //     const position = ((startDate - startTime) / 60000) * pixelsPerMinute;
  //     const width = event.duration * pixelsPerMinute;

  //     // Skip events outside the visible range
  //     if (position + width < 0 || position > timelineWidth) {
  //       return null;
  //     }

  //     // Determine color based on period
  //     // let bgColor = 'bg-blue-100 border-blue-300';
  //     // switch (event.period) {
  //     //   case 'Pregame':
  //     //     bgColor = 'bg-purple-100 border-purple-300';
  //     //     break;
  //     //   case 'Q1':
  //     //     bgColor = 'bg-blue-100 border-blue-300';
  //     //     break;
  //     //   case 'Q2':
  //     //     bgColor = 'bg-green-100 border-green-300';
  //     //     break;
  //     //   case 'Halftime':
  //     //     bgColor = 'bg-yellow-100 border-yellow-300';
  //     //     break;
  //     //   case 'Q3':
  //     //     bgColor = 'bg-orange-100 border-orange-300';
  //     //     break;
  //     //   case 'Q4':
  //     //     bgColor = 'bg-red-100 border-red-300';
  //     //     break;
  //     //   case 'Postgame':
  //     //     bgColor = 'bg-gray-100 border-gray-300';
  //     //     break;
  //     // }

  //     // // Add a highlight if the event has an associated element
  //     // const hasElement = event.element_id && event.script_elements;
  //     // const elementHighlight = hasElement ? 'ring-2 ring-blue-500 ring-offset-1' : '';

  //     return null;
  //     //   <div
  //     //     key={event.id}
  //     //     className={`absolute rounded-md p-2 border ${bgColor} ${elementHighlight} cursor-pointer hover:shadow-md transition-shadow`}
  //     //     style={{
  //     //       left: `${position}px`,
  //     //       width: `${width}px`,
  //     //       minWidth: '100px',
  //     //       top: '30px',
  //     //       height: '80px',
  //     //       overflow: 'hidden'
  //     //     }}
  //     //     onClick={() => handleEditEvent(event)}
  //     //   >
  //     //     <div className="font-medium text-sm truncate">{event.title}</div>
  //     //     <div className="text-xs truncate">
  //     //       {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(new Date(event.start_time).getTime() + event.duration * 60000), 'h:mm a')}
  //     //     </div>
  //     //     {event.location && (
  //     //       <div className="text-xs truncate text-gray-600">{event.location}</div>
  //     //     )}
  //     //     {hasElement && (
  //     //       <div className="text-xs mt-1 bg-blue-200 text-blue-800 px-1 rounded truncate">
  //     //         Element: {event.script_elements.title}
  //     //       </div>
  //     //     )}
  //     //   </div>
  //     // );
  //   });
  // };

  // const handleTimelineClick = (e) => {
  //   if (e.target === timelineRef.current) {
  //     const rect = timelineRef.current.getBoundingClientRect();
  //     const clickX = e.clientX - rect.left;
  //     const minutesFromStart = clickX / pixelsPerMinute;
  //     const clickTime = new Date(startTime.getTime() + minutesFromStart * 60000);

  //     // Round to nearest 5 minutes
  //     const minutes = clickTime.getMinutes();
  //     const roundedMinutes = Math.round(minutes / 5) * 5;
  //     clickTime.setMinutes(roundedMinutes, 0, 0);

  //     handleAddEvent(clickTime);
  //   }
  // };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Timeline</h2>
        <TimelineLane period="PREGAME" items={pregameItems} scriptId={scriptId} />
        <TimelineLane period="IN_GAME" items={inGameItems} scriptId={scriptId} />
        <TimelineLane period="HALFTIME" items={halftimeItems} scriptId={scriptId} />
        <TimelineLane period="POSTGAME" items={postgameItems} scriptId={scriptId} />
      </div>
      <div>
        <ElementLibrary scriptId={scriptId} />
      </div>
    </div>
  )
  // return (
  //   <div className="bg-white rounded-lg shadow p-4 mb-6">
  //     <div className="flex justify-between items-center mb-4">
  //       <h2 className="text-xl font-bold">Timeline</h2>
  //       <div className="flex items-center gap-2">
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           onClick={() => adjustTimeWindow('earlier')}
  //         >
  //           <ChevronLeft className="h-4 w-4 mr-1" /> Earlier
  //         </Button>
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           onClick={() => adjustTimeWindow('later')}
  //         >
  //           Later <ChevronRight className="h-4 w-4 ml-1" />
  //         </Button>
  //       </div>
  //     </div>

  //     <div className="relative overflow-x-auto pb-4" style={{ height: '150px' }}>
  //       <div
  //         ref={timelineRef}
  //         className="relative h-full border-t border-b border-gray-200"
  //         style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
  //         onClick={handleTimelineClick}
  //       >
  //         {renderTimeMarkers()}
  //         {renderEvents()}
  //       </div>
  //     </div>

  //     <div className="text-sm text-gray-500 mt-2">
  //       Click on the timeline to add an event, or click on an existing event to edit it.
  //     </div>

  //     <TimelineEventModal
  //       isOpen={isModalOpen}
  //       onClose={() => setIsModalOpen(false)}
  //       onSave={handleSaveEvent}
  //       startTime={selectedTime}
  //       event={selectedEvent}
  //     />
  //   </div>
  // );
}

