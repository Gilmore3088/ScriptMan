"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { getSupabaseClient } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  LANES,
  LANE_ORDER,
  LANE_PADDING,
  LANE_HEADER_WIDTH,
  calculateStartTime,
  calculateTimeOffset,
  getEventLane,
  drawTimeRuler,
  drawLaneHeaders,
  drawEventBlock,
  roundTimeToInterval,
  getTimeMarkerDensity,
} from "@/utils/timeline-helpers"
import { BulkTimeShiftDialog } from "./bulk-time-shift-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Add these debugging functions at the top of your file, outside the component

function logEventPosition(event, x, y, position, eventWidth, eventY, eventHeight) {
  console.log(
    `Event hit test: ${event.title}`,
    `\nx: ${x} >= ${position} && ${x} <= ${position + eventWidth}`,
    `\ny: ${y} >= ${eventY} && ${y} <= ${eventY + eventHeight}`,
    `\nResult: ${x >= position && x <= position + eventWidth && y >= eventY && y <= eventY + eventHeight}`,
  )
}

// Add roundRect polyfill if not available
if (typeof window !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2
    if (height < 2 * radius) radius = height / 2
    this.beginPath()
    this.moveTo(x + radius, y)
    this.arcTo(x + width, y, x + width, y + height, radius)
    this.arcTo(x + width, y + height, x, y + height, radius)
    this.arcTo(x, y + height, x, y, radius)
    this.arcTo(x, y, x + width, y, radius)
    this.closePath()
    return this
  }
}

interface TimelineProps {
  gameId: string
  gameData?: any
}

// Export the Timeline component as the default export
export default function Timeline({ gameId, gameData }: TimelineProps) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBulkShiftDialog, setShowBulkShiftDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("timeline")
  const [zoomLevel, setZoomLevel] = useState(7.6)
  const { toast } = useToast()

  // Single fetch function that's reused throughout the component
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .eq("game_id", gameId)
        .order("time_offset")

      if (error) throw error

      // Replace entire array, don't append
      setEvents(data || [])
      console.log("Fetched events:", data?.length || 0)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load timeline events",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [gameId, toast])

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleBulkTimeShift = async (minutes) => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      // Update all events for this game
      const { error } = await supabase.rpc("shift_timeline_events", {
        p_game_id: gameId,
        p_minutes: minutes,
      })

      if (error) throw error

      await fetchEvents()

      toast({
        title: "Success",
        description: `Shifted all events by ${minutes} minutes`,
      })
    } catch (error) {
      console.error("Error shifting events:", error)
      toast({
        title: "Error",
        description: `Failed to shift events: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowBulkShiftDialog(false)
    }
  }

  // Define handleElementDragStart here or import it
  const handleElementDragStart = (element: any) => {
    console.log("handleElementDragStart called with:", element)
    // Implement your logic here
  }

  // Add this after the fetchEvents function but before the return statement
  const homeTeam = gameData?.home_team || "Home Team"
  const awayTeam = gameData?.away_team || "Away Team"
  const location = gameData?.location || ""

  const refreshEvents = () => {
    fetchEvents()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Game Timeline</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkShiftDialog(true)} disabled={isLoading}>
            Bulk Time Shift
          </Button>
          <Button variant="outline" onClick={refreshEvents} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Game information display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-medium text-lg">
          {homeTeam} vs {awayTeam}
        </h3>
        {location && <p className="text-gray-600">{location}</p>}
      </div>

      {/* Rest of the timeline component */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(zoomLevel - 10)} disabled={zoomLevel <= 10}>
            Zoom Out
          </Button>
          <span className="px-2 py-1 bg-gray-100 rounded">{zoomLevel}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(zoomLevel + 10)}>
            Zoom In
          </Button>
        </div>
        {/*
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleViewMode}
          >
            Switch to {viewMode === 'horizontal' ? 'Vertical' : 'Horizontal'}
          </Button>
          <Select value={timeInterval.toString()} onValueChange={(value) => setTimeInterval(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        */}
      </div>

      <Tabs defaultValue="timeline" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="flex-1 flex flex-col">
          <div className="flex-1">
            <CanvasTimeline
              gameId={gameId}
              events={events}
              onEventsChange={fetchEvents}
              isLoading={isLoading}
              handleElementDragStart={handleElementDragStart}
            />
          </div>
        </TabsContent>

        <TabsContent value="list" className="flex-1">
          <div className="bg-white rounded-lg shadow p-4 h-full overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Lane</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t">
                    <td className="p-2">{event.time_offset} min</td>
                    <td className="p-2">{event.title}</td>
                    <td className="p-2">{event.duration || 0} sec</td>
                    <td className="p-2">{event.lane || "Default"}</td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Handle edit
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {showBulkShiftDialog && (
        <BulkTimeShiftDialog
          open={showBulkShiftDialog}
          onOpenChange={setShowBulkShiftDialog}
          onConfirm={handleBulkTimeShift}
        />
      )}
    </div>
  )
}

interface TimelineEvent {
  id: string
  game_id: string
  time_offset: number
  title: string
  description?: string
  type?: string
  start_time?: string
  duration?: number
  item_number?: string
  private_notes?: string
  clock?: string
  location?: string
  audio_notes?: string
  read?: string
  element_id?: string
  element?: any
  metadata?: any
  custom_assets?: any
  is_permanent?: boolean
  sponsor_id?: string
  preset?: string
  notes?: string
  lane?: string
}

interface CanvasTimelineProps {
  gameId: string
  events: TimelineEvent[]
  onEventsChange: () => void
  isLoading: boolean
  showLegend?: boolean
  handleElementDragStart?: (element: any) => void
}

export function CanvasTimeline({
  gameId,
  events,
  onEventsChange,
  isLoading,
  showLegend = true,
  handleElementDragStart,
}: CanvasTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInlineEditMode, setIsInlineEditMode] = useState(false)
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [startTime, setStartTime] = useState(() => {
    const now = new Date()
    now.setHours(18, 0, 0, 0) // Default to 6:00 PM
    return now
  })
  const [endTime, setEndTime] = useState(() => {
    const end = new Date()
    end.setHours(22, 0, 0, 0) // Default 4 hour window
    return end
  })
  const [error, setError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(7.6) // Match the screenshot zoom level
  const [orientation, setOrientation] = useState("horizontal") // "horizontal" or "vertical"
  const [selectedInterval, setSelectedInterval] = useState("15") // Default to 15 min intervals
  const [showCoreFields, setShowCoreFields] = useState(true) // Show/hide core fields
  const [showCustomAssets, setShowCustomAssets] = useState(true) // Show/hide custom assets
  const [isDragging, setIsDragging] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<TimelineEvent | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [contextMenuEvent, setContextMenuEvent] = useState<TimelineEvent | null>(null)
  const [inlineEditPosition, setInlineEditPosition] = useState<{ x: number; y: number } | null>(null)
  const [dragTooltip, setDragTooltip] = useState<{ time: string; position: { x: number; y: number } } | null>(null)
  const [filterType, setFilterType] = useState("all")

  // Add new state for drag and drop
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const [draggedElement, setDraggedElement] = useState<any | null>(null)
  const [showPlaceholderPrompt, setShowPlaceholderPrompt] = useState(false)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
  const [placeholders, setPlaceholders] = useState<string[]>([])

  const timelineRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Get the singleton Supabase client
  const supabase = getSupabaseClient()

  const getIntervalMultiplier = () => {
    switch (selectedInterval) {
      case "15s":
        return 4 // More detail for smaller intervals
      case "30s":
        return 2
      case "1":
        return 1
      case "5":
        return 0.8
      case "15":
        return 0.6
      case "30":
        return 0.4
      case "60":
        return 0.3
      default:
        return 0.6 // Default for 15 min intervals
    }
  }

  const basePixelsPerMinute = 3
  const pixelsPerMinute = basePixelsPerMinute * zoomLevel * getIntervalMultiplier()
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / 60000
  const minZoom = 0.5
  const maxZoom = 20
  const zoomStep = 1.5

  // Calculate dimensions based on orientation and zoom level
  const timelineWidth = orientation === "horizontal" ? Math.max(totalMinutes * pixelsPerMinute, 1800) : 1200
  const timelineHeight =
    orientation === "horizontal"
      ? 800 // Increased from 600 to 800 for more vertical space
      : Math.max(totalMinutes * pixelsPerMinute, 1500)

  // Fetch events when gameId changes
  useEffect(() => {
    let isMounted = true

    if (gameId) {
      //fetchEvents()
    }

    // Cleanup function to cancel any pending animation frames
    return () => {
      isMounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [gameId])

  // Draw timeline when relevant state changes
  useEffect(() => {
    if (canvasRef.current) {
      // Cancel any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Schedule a new draw
      animationFrameRef.current = requestAnimationFrame(() => {
        drawTimeline()
      })
    }

    // Cleanup function to cancel any pending animation frames
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    events,
    startTime,
    endTime,
    zoomLevel,
    orientation,
    selectedInterval,
    showCoreFields,
    showCustomAssets,
    isDragging,
    draggedEvent,
    dragOffset,
  ])

  // Scroll to center on current time when first rendered or when orientation changes
  useEffect(() => {
    let isMounted = true

    if (canvasRef.current && containerRef.current && isMounted) {
      const container = containerRef.current

      // Calculate the position of the current time
      const now = new Date()
      const minutesSinceStart = (now.getTime() - startTime.getTime()) / 60000
      const position = minutesSinceStart * pixelsPerMinute

      if (orientation === "horizontal") {
        // Center horizontally on current time
        container.scrollLeft = Math.max(0, position - container.clientWidth / 2)
      } else {
        // Center vertically on current time
        container.scrollTop = Math.max(0, position - container.clientHeight / 2)
      }
    }

    return () => {
      isMounted = false
    }
  }, [orientation, startTime, pixelsPerMinute])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPosition(null)
      setContextMenuEvent(null)
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  // Add handlers for drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDragPosition({ x, y })
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
    setDragPosition(null)
  }

  // Update the handleDrop function to properly handle lane assignment
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    try {
      const elementData = JSON.parse(e.dataTransfer.getData("application/json"))
      console.log("Dropped element data:", elementData)

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Determine the appropriate lane based on element type
      const elementType = (
        elementData.element_type ||
        elementData.type ||
        elementData.category ||
        "production_cue"
      ).toLowerCase()
      let targetLane

      // Map element types to appropriate lanes
      if (elementType.includes("sponsor") || elementType === "sponsor_read") {
        targetLane = LANES.SPONSOR_READS.id
      } else if (elementType.includes("permanent") || elementType === "permanent_marker") {
        targetLane = LANES.PERMANENT_MARKERS.id
        console.log("Assigning to permanent markers lane:", targetLane)
      } else if (elementType.includes("talent")) {
        targetLane = LANES.TALENT.id
      } else if (elementType.includes("graphic")) {
        targetLane = LANES.GRAPHICS.id
      } else if (elementType.includes("audio")) {
        targetLane = LANES.AUDIO.id
      } else if (elementType.includes("production") || elementType === "production_cue") {
        targetLane = LANES.PRODUCTION_CUES.id
      } else {
        // Default to production cues if type is unknown
        targetLane = LANES.PRODUCTION_CUES.id
      }

      console.log("Determined target lane:", targetLane, "for element type:", elementType)

      // Calculate the time at the drop position
      let dropTime: Date

      if (orientation === "horizontal") {
        const minutesFromStart = (x - LANE_HEADER_WIDTH) / pixelsPerMinute
        dropTime = new Date(startTime.getTime() + minutesFromStart * 60000)
      } else {
        const minutesFromStart = (y - 40) / pixelsPerMinute
        dropTime = new Date(startTime.getTime() + minutesFromStart * 60000)
      }

      // Round to nearest interval for better alignment
      const roundedTime = roundTimeToInterval(dropTime, selectedInterval)
      console.log("Rounded drop time:", roundedTime)

      // Check if the element has placeholders in its content
      const contentToCheck = elementData.read || elementData.description || ""
      if (contentToCheck) {
        const placeholderRegex = /\{([^}]+)\}/g
        const matches = [...contentToCheck.matchAll(placeholderRegex)]
        const foundPlaceholders = matches.map((match) => match[1])

        if (foundPlaceholders.length > 0) {
          setPlaceholders(foundPlaceholders)
          setPlaceholderValues({})
          // Store the target lane in the element type instead of a separate lane property
          setDraggedElement({
            ...elementData,
            element_type: elementType.includes("permanent")
              ? "permanent_marker"
              : elementType.includes("sponsor")
                ? "sponsor_read"
                : elementType.includes("talent")
                  ? "talent_cue"
                  : elementType.includes("graphic")
                    ? "graphic_cue"
                    : elementType.includes("audio")
                      ? "audio_cue"
                      : "production_cue",
          })
          setSelectedTime(roundedTime)
          setShowPlaceholderPrompt(true)
          return
        }
      }

      // If no placeholders, create the event directly with the target lane encoded in the element type
      createEventFromElement(
        {
          ...elementData,
          element_type: elementType.includes("permanent")
            ? "permanent_marker"
            : elementType.includes("sponsor")
              ? "sponsor_read"
              : elementType.includes("talent")
                ? "talent_cue"
                : elementType.includes("graphic")
                  ? "graphic_cue"
                  : elementType.includes("audio")
                    ? "audio_cue"
                    : "production_cue",
        },
        roundedTime,
      )
    } catch (error) {
      console.error("Error handling drop:", error)
      toast({
        title: "Error",
        description: "Failed to add element to timeline.",
        variant: "destructive",
      })
    }
  }

  // Update the createEventFromElement function to properly handle lane information
  const createEventFromElement = async (element: any, time: Date) => {
    try {
      // Calculate time_offset as an integer (seconds from start time)
      const timeOffsetSeconds = calculateTimeOffset(time, startTime)

      // Determine the element type/category
      const elementType = element.element_type || element.type || element.category || "production_cue"

      // Scale duration based on element type
      let duration = element.duration && element.duration > 0 ? element.duration : 60

      // Apply scaling rules based on element type
      if (elementType.includes("sponsor") || elementType === "sponsor_read") {
        // Sponsor reads are typically longer
        duration = Math.max(duration, 90)
      } else if (elementType.includes("permanent") || elementType === "permanent_marker") {
        // Permanent markers are typically shorter
        duration = Math.min(duration, 30)
      } else if (elementType.includes("game")) {
        // Game events vary but should be at least 45 seconds
        duration = Math.max(duration, 45)
      }

      console.log("Creating event with scaled duration:", duration)

      // Create a new event based on the element
      const newEvent = {
        game_id: gameId,
        title: element.name || "New Event",
        description: element.description || "",
        element_id: element.id,
        sponsor_id: element.sponsor_id,
        time_offset: timeOffsetSeconds,
        start_time: time.toISOString(),
        duration: duration,
        element_type: elementType,
        category: elementType,
        // Do not include metadata as it doesn't exist in the schema
      }

      console.log("Creating timeline event with data:", newEvent)

      // Replace placeholders if any
      if (Object.keys(placeholderValues).length > 0 && newEvent.description) {
        Object.entries(placeholderValues).forEach(([key, value]) => {
          newEvent.description = newEvent.description.replace(new RegExp(`\\{${key}\\}`, "g"), value)
        })
      }

      // Save to database
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("timeline_events").insert([newEvent]).select().single()

      if (error) {
        console.error("Error creating timeline event:", error)
        toast({
          title: "Error",
          description: `Failed to create timeline event: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log("Created timeline event:", data)

      // IMPORTANT: Instead of updating local state AND fetching, just fetch all events
      // This prevents duplicates by having a single source of truth
      await onEventsChange()

      toast({
        title: "Event created",
        description: `Event "${element.name || "New Event"}" has been added to the timeline.`,
      })

      // Select the newly created event for editing
      setSelectedEvent(data)
      setSelectedTime(time)
    } catch (err) {
      console.error("Exception creating timeline event:", err)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setShowPlaceholderPrompt(false)
      setDraggedElement(null)
      setPlaceholderValues({})
    }
  }

  const handlePlaceholderSubmit = () => {
    if (!draggedElement || !selectedTime) return

    // Check if all placeholders have values
    const allPlaceholdersFilled = placeholders.every((p) => placeholderValues[p])

    if (!allPlaceholdersFilled) {
      toast({
        title: "Missing values",
        description: "Please fill in all placeholder values.",
        variant: "destructive",
      })
      return
    }

    createEventFromElement(draggedElement, selectedTime)
  }

  const handleElementDragStartLocal = (element: any) => {
    setDraggedElement(element)
    if (handleElementDragStart) {
      handleElementDragStart(element)
    }
  }

  // Add this to your drawTimeline function
  // Convert drawTimeline to a useCallback to avoid stale closures
  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas ref is null")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get 2D context from canvas")
      return
    }

    // Log canvas dimensions
    console.log("Canvas dimensions:", {
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      timelineWidth,
      timelineHeight,
    })

    // Log time range
    console.log("Timeline time range:", {
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      totalMinutes,
      pixelsPerMinute,
    })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Debug zoom and interval
    //debugZoomAndInterval(zoomLevel, selectedInterval, pixelsPerMinute);

    if (orientation === "horizontal") {
      drawHorizontalTimeline(ctx, canvas.width, canvas.height)
    } else {
      drawVerticalTimeline(ctx, canvas.width, canvas.height)
    }
  }, [
    events,
    startTime,
    endTime,
    zoomLevel,
    orientation,
    selectedInterval,
    showCoreFields,
    showCustomAssets,
    isDragging,
    draggedEvent,
    dragOffset,
  ])

  const drawHorizontalTimeline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    console.log("Drawing horizontal timeline")

    // Clear and set background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, width, height)

    // Calculate heights
    const headerHeight = 40
    const itemsStartY = headerHeight

    // Draw header row
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, width, headerHeight)

    // Draw time ruler with debugging
    console.log("Drawing time ruler")
    drawTimeRuler(
      ctx,
      width,
      headerHeight,
      startTime,
      endTime,
      pixelsPerMinute,
      selectedInterval,
      getTimeMarkerDensity(zoomLevel, selectedInterval),
      "horizontal",
    )

    // Draw lane headers and get lane positions with debugging
    console.log("Drawing lane headers")
    const lanePositions = drawLaneHeaders(ctx, width, height, headerHeight, "horizontal")
    console.log("Lane positions:", lanePositions)

    // Draw events as blocks on the timeline
    console.log(`Drawing ${events.length} events`)
    events.forEach((event) => {
      // Skip if this is the event being dragged (we'll draw it separately)
      if (isDragging && draggedEvent && draggedEvent.id === event.id) return

      // Log event details before drawing
      console.log(`Drawing event: ${event.title}, type: ${event.element_type || event.type || "unknown"}`)

      // Apply visual scaling based on event type
      const eventType = event.element_type || event.type || event.category || "production_cue"
      const visualScale =
        eventType.includes("sponsor") || eventType === "sponsor_read"
          ? 1.2
          : eventType.includes("permanent") || eventType === "permanent_marker"
            ? 0.8
            : eventType.includes("game")
              ? 1.1
              : 1.0

      drawEventBlock(
        ctx,
        event,
        lanePositions,
        width,
        headerHeight,
        startTime,
        pixelsPerMinute,
        showCustomAssets,
        "horizontal",
        false,
        visualScale,
      )
    })

    // Draw the dragged event if applicable
    if (isDragging && draggedEvent) {
      console.log("Drawing dragged event:", draggedEvent.title, "with offset:", dragOffset)

      // Calculate the original time offset in seconds
      const originalTimeOffset = draggedEvent.time_offset || 0

      // Calculate the new time offset with the drag offset in seconds
      const offsetMinutes = dragOffset / pixelsPerMinute
      const newTimeOffset = Math.max(0, originalTimeOffset + offsetMinutes * 60)

      // Create a temporary copy with the new time offset
      const tempEvent = {
        ...draggedEvent,
        time_offset: newTimeOffset,
      }

      // Get the event type for visual scaling
      const draggedEventType =
        draggedEvent.element_type || draggedEvent.type || draggedEvent.category || "production_cue"

      const draggedVisualScale =
        draggedEventType.includes("sponsor") || draggedEventType === "sponsor_read"
          ? 1.2
          : draggedEventType.includes("permanent") || draggedEventType === "permanent_marker"
            ? 0.8
            : draggedEventType.includes("game")
              ? 1.1
              : 1.0

      // Calculate original and new positions for debugging
      const originalPosition =
        ((calculateStartTime(originalTimeOffset, startTime).getTime() - startTime.getTime()) / 60000) *
          pixelsPerMinute +
        LANE_HEADER_WIDTH
      const newPosition =
        ((calculateStartTime(newTimeOffset, startTime).getTime() - startTime.getTime()) / 60000) * pixelsPerMinute +
        LANE_HEADER_WIDTH

      console.log("Dragged event positions:", {
        originalPosition,
        newPosition,
        difference: newPosition - originalPosition,
        dragOffset,
        pixelsPerMinute,
      })

      // Draw the event at its new position
      drawEventBlock(
        ctx,
        tempEvent,
        lanePositions,
        width,
        headerHeight,
        startTime,
        pixelsPerMinute,
        showCustomAssets,
        "horizontal",
        true, // isDragged = true for visual emphasis
        draggedVisualScale,
      )

      // Draw a guide line to show where the event will be placed
      const minutesSinceStart = newTimeOffset / 60
      const guideX = minutesSinceStart * pixelsPerMinute + LANE_HEADER_WIDTH

      ctx.strokeStyle = "rgba(33, 150, 243, 0.7)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      ctx.moveTo(guideX, 0)
      ctx.lineTo(guideX, height)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Add this to the drawHorizontalTimeline function, right after drawing events
    // Add hover effect for better dragging UX
    if (isDragOver) {
      ctx.fillStyle = "rgba(0, 120, 255, 0.1)"
      ctx.fillRect(0, 0, width, height)

      // Draw a vertical line at the current drag position if available
      if (dragPosition) {
        ctx.strokeStyle = "rgba(0, 120, 255, 0.8)"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 3])
        ctx.beginPath()
        ctx.moveTo(dragPosition.x, 0)
        ctx.lineTo(dragPosition.x, height)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw time indicator
        const minutesFromStart = (dragPosition.x - LANE_HEADER_WIDTH) / pixelsPerMinute
        const dragTime = new Date(startTime.getTime() + minutesFromStart * 60000)
        const roundedTime = roundTimeToInterval(dragTime, selectedInterval)

        ctx.fillStyle = "rgba(0, 120, 255, 1)"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(roundedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), dragPosition.x, 20)
      }
    }

    // Draw navigation controls at the bottom
    const controlsY = height - 30

    // Draw zoom info
    ctx.fillStyle = "#6c757d"
    ctx.font = "12px Arial"
    ctx.textAlign = "right"
    ctx.fillText(`Zoom: ${zoomLevel.toFixed(1)}x | Interval: ${selectedInterval}`, width - 50, controlsY + 5)
  }

  const drawVerticalTimeline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear and set background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, width, height)

    // Calculate dimensions
    const headerWidth = 180
    const headerHeight = 40

    // Draw header row
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, width, headerHeight)

    // Draw time ruler
    drawTimeRuler(
      ctx,
      width,
      headerHeight,
      startTime,
      endTime,
      pixelsPerMinute,
      selectedInterval,
      getTimeMarkerDensity(zoomLevel, selectedInterval),
      "vertical",
    )

    // Draw lane headers and get lane positions
    const lanePositions = drawLaneHeaders(ctx, width, height, headerHeight, "vertical")

    // Draw events as blocks on the timeline
    events.forEach((event) => {
      // Skip if this is the event being dragged (we'll draw it separately)
      if (isDragging && draggedEvent && draggedEvent.id === event.id) return

      const vEventType = event.element_type || event.type || event.category || "production_cue"
      const vVisualScale =
        vEventType.includes("sponsor") || vEventType === "sponsor_read"
          ? 1.2
          : vEventType.includes("permanent") || vEventType === "permanent_marker"
            ? 0.8
            : vEventType.includes("game")
              ? 1.1
              : 1.0

      drawEventBlock(
        ctx,
        event,
        lanePositions,
        width,
        headerHeight,
        startTime,
        pixelsPerMinute,
        showCustomAssets,
        "vertical",
        false,
        vVisualScale,
      )
    })

    // Draw the dragged event if applicable
    if (isDragging && draggedEvent) {
      // Apply the drag offset to the event's position
      const draggedEventCopy = { ...draggedEvent }
      const originalStartDate = new Date(
        draggedEventCopy.start_time || calculateStartTime(draggedEventCopy.time_offset, startTime),
      )
      const offsetMinutes = dragOffset / pixelsPerMinute
      const newStartDate = new Date(originalStartDate.getTime() + offsetMinutes * 60000)
      draggedEventCopy.start_time = newStartDate.toISOString()

      const vDraggedEventType =
        draggedEventCopy.element_type || draggedEventCopy.type || draggedEventCopy.category || "production_cue"
      const vDraggedVisualScale =
        vDraggedEventType.includes("sponsor") || vDraggedEventType === "sponsor_read"
          ? 1.2
          : vDraggedEventType.includes("permanent") || vDraggedEventType === "permanent_marker"
            ? 0.8
            : vDraggedEventType.includes("game")
              ? 1.1
              : 1.0

      drawEventBlock(
        ctx,
        draggedEventCopy,
        lanePositions,
        width,
        headerHeight,
        startTime,
        pixelsPerMinute,
        showCustomAssets,
        "vertical",
        true,
        vDraggedVisualScale,
      )
    }
  }

  // Improved hit detection for horizontal timeline
  const handleHorizontalCanvasClick = (x: number, y: number, isRightClick = false) => {
    console.log("Horizontal canvas click at:", x, y)

    // Calculate lane positions
    let currentY = 40 // Start after header

    for (const lane of LANE_ORDER) {
      for (const event of events) {
        const eventLane = getEventLane(event)

        // Skip events in other lanes
        if (eventLane.id !== lane.id) continue

        // For events with time_offset, use that directly
        let startDate
        if (event.time_offset !== undefined) {
          // Calculate the start time based on time_offset (in seconds)
          startDate = calculateStartTime(event.time_offset, startTime)
        } else if (event.start_time) {
          // For events with start_time, parse it as a date
          startDate = new Date(event.start_time)
        } else {
          // Skip this event if no time information
          continue
        }

        // Ensure we have a valid duration
        const duration = event.duration && event.duration > 0 ? event.duration : 60

        const position = ((startDate.getTime() - startTime.getTime()) / 60000) * pixelsPerMinute + LANE_HEADER_WIDTH
        const eventWidth = Math.max((duration / 60) * pixelsPerMinute, 100) // Minimum width of 100px

        // Calculate event position in the lane
        const laneY = currentY
        const eventY = laneY + LANE_PADDING
        const eventHeight = lane.height - LANE_PADDING * 2

        console.log(
          "Event hit test:",
          event.title,
          "x:",
          x,
          ">=",
          position,
          "&&",
          x,
          "<=",
          position + eventWidth,
          "y:",
          y,
          ">=",
          eventY,
          "&&",
          y,
          "<=",
          eventY + eventHeight,
        )

        if (x >= position && x <= position + eventWidth && y >= eventY && y <= eventY + eventHeight) {
          console.log("Hit event:", event.title)

          if (isRightClick) {
            // Show context menu
            setContextMenuPosition({ x, y })
            setContextMenuEvent(event)
            return
          } else if (isInlineEditMode) {
            // Show inline editor
            setInlineEditPosition({ x: position, y: eventY })
            setSelectedEvent(event)
            return
          } else {
            // Open modal editor
            handleEditEvent(event)
            return
          }
        }
      }

      currentY += lane.height
    }

    // If right-click, don't create a new event
    if (isRightClick) {
      return
    }

    // If not on an event, create a new event at this time
    const minutesFromStart = (x - LANE_HEADER_WIDTH) / pixelsPerMinute
    const clickTime = new Date(startTime.getTime() + minutesFromStart * 60000)

    // Round to nearest interval
    const roundedTime = roundTimeToInterval(clickTime, selectedInterval)

    setSelectedTime(roundedTime)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  // Improved hit detection for vertical timeline
  const handleVerticalCanvasClick = (x: number, y: number, isRightClick = false) => {
    console.log("Vertical canvas click at:", x, y)

    const headerWidth = 180
    const headerHeight = 40

    // Check if click is in the header area
    if (y <= headerHeight) return // Clicked on header row

    // Check if click is in the time column
    if (x <= headerWidth) return // Clicked on time column

    // Calculate which lane was clicked
    const laneWidth = (canvasRef.current!.width - headerWidth) / LANE_ORDER.length
    const laneIndex = Math.floor((x - headerWidth) / laneWidth)
    const lane = LANE_ORDER[laneIndex]

    if (!lane) return // Click was outside of lanes

    // Find if we clicked on an event
    for (const event of events) {
      const eventLane = getEventLane(event)

      // Skip events in other lanes
      if (eventLane.id !== lane.id) continue

      // For events with time_offset, use that directly
      let startDate
      if (event.time_offset !== undefined) {
        // Calculate the start time based on time_offset (in seconds)
        startDate = calculateStartTime(event.time_offset, startTime)
      } else if (event.start_time) {
        // For events with start_time, parse it as a date
        startDate = new Date(event.start_time)
      } else {
        // Skip this event if no time information
        continue
      }

      // Ensure we have a valid duration
      const duration = event.duration && event.duration > 0 ? event.duration : 60

      const position = ((startDate.getTime() - startTime.getTime()) / 60000) * pixelsPerMinute + headerHeight
      const eventHeight = Math.max((duration / 60) * pixelsPerMinute, 60) // Minimum height of 60px

      const laneX = headerWidth + laneIndex * laneWidth
      const eventX = laneX + LANE_PADDING
      const eventWidth = laneWidth - LANE_PADDING * 2

      console.log(
        "Event hit test (vertical):",
        event.title,
        "x:",
        x,
        ">=",
        eventX,
        "&&",
        x,
        "<=",
        eventX + eventWidth,
        "y:",
        y,
        ">=",
        position,
        "&&",
        y,
        "<=",
        position + eventHeight,
      )

      if (y >= position && y <= position + eventHeight && x >= eventX && x <= eventX + eventWidth) {
        console.log("Hit event (vertical):", event.title)

        if (isRightClick) {
          // Show context menu
          setContextMenuPosition({ x, y })
          setContextMenuEvent(event)
          return
        } else if (isInlineEditMode) {
          // Show inline editor
          setInlineEditPosition({ x: eventX, y: position })
          setSelectedEvent(event)
          return
        } else {
          // Open modal editor
          handleEditEvent(event)
          return
        }
      }
    }

    // If right-click, don't create a new event
    if (isRightClick) {
      return
    }

    // If not on an event, create a new event at this time
    const minutesFromStart = (y - headerHeight) / pixelsPerMinute
    const clickTime = new Date(startTime.getTime() + minutesFromStart * 60000)

    // Round to nearest interval
    const roundedTime = roundTimeToInterval(clickTime, selectedInterval)

    // Set the event category based on the lane that was clicked
    const eventCategory =
      lane.id === LANES.PERMANENT_MARKERS.id
        ? "permanent_marker"
        : lane.id === LANES.SPONSOR_READS.id
          ? "sponsor_read"
          : "production_cue"

    setSelectedTime(roundedTime)
    setSelectedEvent({
      id: "",
      game_id: gameId,
      time_offset: 0,
      title: "",
      element_type: eventCategory,
      category: eventCategory,
    })
    setIsModalOpen(true)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const isRightClick = e.button === 2

    if (orientation === "horizontal") {
      handleHorizontalCanvasClick(x, y, isRightClick)
    } else {
      handleVerticalCanvasClick(x, y, isRightClick)
    }
  }

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleCanvasClick(e)
  }

  const handleEditEvent = (event: TimelineEvent) => {
    console.log("Editing event:", event)
    setSelectedEvent(event)
    setSelectedTime(new Date(event.start_time || calculateStartTime(event.time_offset, startTime)))
    setIsModalOpen(true)
  }

  const handleDuplicateEvent = (event: TimelineEvent) => {
    const duplicatedEvent = { ...event }
    delete duplicatedEvent.id

    // Set the time offset to be a bit after the original event
    if (duplicatedEvent.time_offset !== undefined) {
      duplicatedEvent.time_offset += 60 // Add 60 seconds
    } else if (duplicatedEvent.start_time) {
      const startDate = new Date(duplicatedEvent.start_time)
      startDate.setMinutes(startDate.getMinutes() + 1)
      duplicatedEvent.start_time = startDate.toISOString()
    }

    setSelectedEvent(duplicatedEvent)
    setSelectedTime(new Date(duplicatedEvent.start_time || calculateStartTime(event.time_offset, startTime)))
    setIsModalOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("timeline_events").delete().eq("id", eventId)

      if (error) {
        console.error("Error deleting event:", error)
        toast({
          title: "Error",
          description: "Failed to delete event.",
          variant: "destructive",
        })
      } else {
        // Fetch all events to refresh the state
        await onEventsChange()

        toast({
          title: "Event Deleted",
          description: "Event has been successfully deleted.",
        })
      }
    } catch (err) {
      console.error("Exception deleting event:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }

    // Close context menu
    setContextMenuPosition(null)
    setContextMenuEvent(null)
  }

  // Enhanced handleMouseDown function with better debugging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle left mouse button
    if (e.button !== 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    console.log("Mouse down triggered at:", x, y)

    // Find the event under the cursor
    const clickedEvent = null
    const bestZIndex = -1 // Track the highest z-index for overlapping events

    // Calculate lane positions
    let currentY = 40 // Start after header

    for (const lane of LANE_ORDER) {
      const laneHeight = lane.height
      const laneY = currentY

      // Check events in reverse order to prioritize events drawn later (on top)
      for (let i = events.length - 1; i >= 0; i--) {
        const event = events[i]
        if (!event) continue

        const eventLane = getEventLane(event)
        if (eventLane.id !== lane.id) continue // Skip events in other lanes

        // For events with time_offset, use that directly
        let startDate
        if (event.time_offset !== undefined) {
          // Calculate the start time based on time_offset (in seconds)
          startDate = calculateStartTime(event.time_offset, startTime)
        } else if (event.start_time) {
          // For events with start_time, parse it as a date
          startDate = new Date(event.start_time)
        } else {
          // Skip this event if no time information
          continue
        }

        // Ensure we have a valid duration
        const duration = event.duration && event.duration > 0 ? event.duration : 60

        const position = ((startDate.getTime() - startTime.getTime()) / 60000) * pixelsPerMinute + LANE_HEADER_WIDTH
        const eventWidth = Math.max((duration / 60) * pixelsPerMinute, 100) // Minimum width of 100px

        // Calculate event position in the lane
        const eventY = laneY + LANE_PADDING
        const eventHeight = lane.height - LANE_PADDING * 2

        // Check if the mouse click is within the bounds of the event
        if (x >= position && x <= position + eventWidth && y >= eventY && y <= eventY + eventHeight) {
          console.log("Mouse down on event:", event.title)
          // This event is under the cursor
          // Check if this event has a higher z-index than the current best
          //if (event.zIndex > bestZIndex) {
          //clickedEvent = event;
          //bestZIndex = event.zIndex;
          //}
        }
      }

      currentY += laneHeight
    }

    // If an event was clicked, start dragging it
    //if (clickedEvent) {
    //console.log("Starting drag for event:", clickedEvent.title);
    setIsDragging(true)
    //setDraggedEvent(clickedEvent);
    //setDragStartX(x);
    //setDragStartY(y);
    //} else {
    //console.log("No event clicked, clearing drag state");
    setIsDragging(false)
    setDraggedEvent(null)
    //}
  }

  // Add the handleZoom function if it's missing
  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in") {
      setZoomLevel((prevZoom) => Math.min(prevZoom * zoomStep, maxZoom))
    } else {
      setZoomLevel((prevZoom) => Math.max(prevZoom / zoomStep, minZoom))
    }
  }

  // Find the CanvasTimeline component's return statement and make sure it includes the canvas element

  // Add or replace the return statement in the CanvasTimeline component with this:
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col" ref={timelineRef}>
      {/* Controls and legend */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom("out")} disabled={zoomLevel <= minZoom}>
            Zoom Out
          </Button>
          <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => handleZoom("in")} disabled={zoomLevel >= maxZoom}>
            Zoom In
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOrientation(orientation === "horizontal" ? "vertical" : "horizontal")}
          >
            {orientation === "horizontal" ? "Switch to Vertical" : "Switch to Horizontal"}
          </Button>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedInterval}
            onChange={(e) => setSelectedInterval(e.target.value)}
          >
            <option value="15s">15 sec</option>
            <option value="30s">30 sec</option>
            <option value="1">1 min</option>
            <option value="5">5 min</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
          </select>
        </div>
      </div>

      {/* Canvas container - important for proper sizing */}
      <div
        className="relative flex-1 overflow-auto border border-gray-200 rounded-md"
        style={{
          minHeight: "500px",
          width: "100%",
          overflowX: orientation === "horizontal" ? "auto" : "hidden",
          overflowY: orientation === "vertical" ? "auto" : "hidden",
        }}
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Canvas wrapper - sets the dimensions */}
        <div
          style={{
            width: orientation === "horizontal" ? `${timelineWidth}px` : "100%",
            height: orientation === "vertical" ? `${timelineHeight}px` : "auto",
            position: "relative",
          }}
        >
          <canvas
            ref={canvasRef}
            width={timelineWidth}
            height={timelineHeight}
            onClick={handleCanvasClick}
            onContextMenu={handleCanvasContextMenu}
            onMouseDown={handleMouseDown}
            className="cursor-pointer"
          />

          {/* Overlay elements like tooltips, context menus, etc. */}
          {dragTooltip && (
            <div
              className="absolute bg-blue-600 text-white px-3 py-1 rounded-md shadow-lg z-50"
              style={{
                left: dragTooltip.position.x,
                top: dragTooltip.position.y,
                transform: "translate(-50%, -100%)",
                pointerEvents: "none",
              }}
            >
              {dragTooltip.time}
            </div>
          )}

          {/* Context menu */}
          {contextMenuPosition && contextMenuEvent && (
            <div
              className="absolute bg-white rounded-md shadow-lg z-50 border"
              style={{
                left: contextMenuPosition.x,
                top: contextMenuPosition.y,
                minWidth: "150px",
              }}
            >
              <div className="p-2 border-b text-sm font-medium">{contextMenuEvent.title}</div>
              <div className="p-1">
                <button
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  onClick={() => {
                    handleEditEvent(contextMenuEvent)
                    setContextMenuPosition(null)
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  onClick={() => {
                    handleDuplicateEvent(contextMenuEvent)
                    setContextMenuPosition(null)
                  }}
                >
                  Duplicate
                </button>
                <button
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-red-600"
                  onClick={() => handleDeleteEvent(contextMenuEvent.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  )
}

