"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Loader2, ZoomIn, ZoomOut } from "lucide-react"

// Constants for timeline rendering
const LANE_HEADER_WIDTH = 120
const LANE_PADDING = 5
const TIME_HEADER_HEIGHT = 40
const DEFAULT_PIXELS_PER_MINUTE = 10
const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const ZOOM_STEP = 1.2

// Lane configuration
const LANE_ORDER = [
  { id: "production", name: "Production", color: "#4338ca", height: 60 },
  { id: "talent", name: "Talent", color: "#0891b2", height: 60 },
  { id: "graphics", name: "Graphics", color: "#ca8a04", height: 60 },
  { id: "audio", name: "Audio", color: "#15803d", height: 60 },
  { id: "video", name: "Video", color: "#b91c1c", height: 60 },
  { id: "social", name: "Social", color: "#7e22ce", height: 60 },
  { id: "misc", name: "Misc", color: "#737373", height: 60 },
]

// Time intervals for the timeline
const TIME_INTERVALS = [
  { value: "15s", label: "15 Seconds" },
  { value: "30s", label: "30 Seconds" },
  { value: "1", label: "1 Minute" },
  { value: "5", label: "5 Minutes" },
  { value: "15", label: "15 Minutes" },
  { value: "30", label: "30 Minutes" },
  { value: "60", label: "1 Hour" },
]

export function CanvasTimeline({ gameId, events = [], onEventsChange, isLoading = false }) {
  // Refs
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const timelineRef = useRef(null)
  const ghostRef = useRef(null)

  // State
  const [orientation, setOrientation] = useState("horizontal")
  const [selectedInterval, setSelectedInterval] = useState("5")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [timelineWidth, setTimelineWidth] = useState(1000)
  const [timelineHeight, setTimelineHeight] = useState(500)
  const [totalMinutes, setTotalMinutes] = useState(180)
  const [pixelsPerMinute, setPixelsPerMinute] = useState(DEFAULT_PIXELS_PER_MINUTE)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragTooltip, setDragTooltip] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Calculate timeline dimensions and time range
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Set start time to 00:00:00
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    setStartTime(start)

    // Set end time to 3 hours later
    const end = new Date(start)
    end.setHours(3, 0, 0, 0)
    setEndTime(end)

    // Calculate total minutes
    const minutes = (end.getTime() - start.getTime()) / 60000
    setTotalMinutes(minutes)

    // Calculate timeline dimensions
    const ppm = DEFAULT_PIXELS_PER_MINUTE * zoomLevel
    setPixelsPerMinute(ppm)

    const width = Math.max(LANE_HEADER_WIDTH + minutes * ppm, containerWidth)
    const height = TIME_HEADER_HEIGHT + LANE_ORDER.reduce((acc, lane) => acc + lane.height, 0)

    setTimelineWidth(width)
    setTimelineHeight(Math.max(height, containerHeight))

    console.log("Timeline dimensions:", { width, height, minutes, ppm })
  }, [zoomLevel, containerRef])

  // Draw the timeline when dimensions or events change
  useEffect(() => {
    drawTimeline()
  }, [timelineWidth, timelineHeight, events, zoomLevel, selectedInterval])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight

        // Recalculate timeline dimensions
        const ppm = pixelsPerMinute
        const width = Math.max(LANE_HEADER_WIDTH + totalMinutes * ppm, containerWidth)
        const height = TIME_HEADER_HEIGHT + LANE_ORDER.reduce((acc, lane) => acc + lane.height, 0)

        setTimelineWidth(width)
        setTimelineHeight(Math.max(height, containerHeight))
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pixelsPerMinute, totalMinutes])

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      // Remove ghost element if it exists
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current)
        ghostRef.current = null
      }
    }
  }, [])

  // Helper function to get interval multiplier
  const getIntervalMultiplier = (interval) => {
    // Parse the interval value
    let value, unit

    if (interval.endsWith("s")) {
      value = Number.parseFloat(interval.slice(0, -1))
      unit = "seconds"
    } else {
      value = Number.parseFloat(interval)
      unit = "minutes"
    }

    // Convert seconds to minutes for consistent calculation
    if (unit === "seconds") {
      value = value / 60
    }

    console.log(`Interval: ${value} ${unit}`)

    // Calculate multiplier based on minutes
    if (value <= 0.25) return 4 // 15 seconds
    if (value <= 0.5) return 2 // 30 seconds
    if (value <= 1) return 1 // 1 minute
    if (value <= 5) return 0.8 // 5 minutes
    if (value <= 15) return 0.6 // 15 minutes
    if (value <= 30) return 0.4 // 30 minutes
    return 0.3 // 60 minutes or more
  }

  // Helper function to calculate start time from offset
  const calculateStartTime = (offset, baseTime) => {
    const date = new Date(baseTime)
    date.setMinutes(date.getMinutes() + offset)
    return date
  }

  // Helper function to get event lane
  const getEventLane = (event) => {
    const lane = LANE_ORDER.find((l) => l.id === event.lane)
    return lane || LANE_ORDER[LANE_ORDER.length - 1] // Default to last lane if not found
  }

  // Draw the timeline
  const drawTimeline = () => {
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw timeline based on orientation
    if (orientation === "horizontal") {
      drawHorizontalTimeline(ctx, canvas.width, canvas.height)
    } else {
      drawVerticalTimeline(ctx, canvas.width, canvas.height)
    }
  }

  // Draw horizontal timeline
  const drawHorizontalTimeline = (ctx, width, height) => {
    // Draw time header
    ctx.fillStyle = "#e9ecef"
    ctx.fillRect(0, 0, width, TIME_HEADER_HEIGHT)

    // Draw time markers
    ctx.fillStyle = "#212529"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Calculate interval based on selected interval and zoom level
    const intervalMultiplier = getIntervalMultiplier(selectedInterval)
    const interval = selectedInterval.endsWith("s")
      ? Number.parseInt(selectedInterval.slice(0, -1)) / 60
      : Number.parseInt(selectedInterval)

    // Draw time markers
    for (let i = 0; i <= totalMinutes; i += interval) {
      const x = i * pixelsPerMinute + LANE_HEADER_WIDTH

      // Draw time marker line
      ctx.strokeStyle = "#ced4da"
      ctx.lineWidth = i % (interval * 5) === 0 ? 1 : 0.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()

      // Draw time label
      if (i % (interval * intervalMultiplier) === 0) {
        const time = new Date(startTime)
        time.setMinutes(time.getMinutes() + i)
        const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        ctx.fillText(timeLabel, x, TIME_HEADER_HEIGHT / 2)
      }
    }

    // Draw lane headers and backgrounds
    let currentY = TIME_HEADER_HEIGHT

    for (const lane of LANE_ORDER) {
      // Draw lane header
      ctx.fillStyle = "#e9ecef"
      ctx.fillRect(0, currentY, LANE_HEADER_WIDTH, lane.height)

      // Draw lane header text
      ctx.fillStyle = "#212529"
      ctx.font = "12px Arial"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(lane.name, 10, currentY + lane.height / 2)

      // Draw lane background
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(LANE_HEADER_WIDTH, currentY, width - LANE_HEADER_WIDTH, lane.height)

      // Draw lane separator
      ctx.strokeStyle = "#dee2e6"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, currentY)
      ctx.lineTo(width, currentY)
      ctx.stroke()

      currentY += lane.height
    }

    // Draw events
    for (const event of events) {
      if (!event) {
        console.warn("Encountered null event in events array")
        continue
      }

      try {
        // Get event lane
        const lane = getEventLane(event)

        // Calculate event position
        const laneIndex = LANE_ORDER.findIndex((l) => l.id === lane.id)
        if (laneIndex === -1) {
          console.warn(`Lane not found for event: ${event.title}`)
          continue
        }

        // Calculate lane Y position
        let laneY = TIME_HEADER_HEIGHT
        for (let i = 0; i < laneIndex; i++) {
          laneY += LANE_ORDER[i].height
        }

        // Calculate event position and dimensions
        const startDate =
          event.time_offset !== undefined
            ? calculateStartTime(event.time_offset, startTime)
            : new Date(event.start_time)

        const duration = event.duration && event.duration > 0 ? event.duration : 60
        const position = ((startDate.getTime() - startTime.getTime()) / 60000) * pixelsPerMinute + LANE_HEADER_WIDTH
        const eventWidth = Math.max((duration / 60) * pixelsPerMinute, 100)
        const eventY = laneY + LANE_PADDING
        const eventHeight = lane.height - LANE_PADDING * 2

        // Draw event background
        ctx.fillStyle = lane.color
        ctx.globalAlpha = 0.8
        ctx.fillRect(position, eventY, eventWidth, eventHeight)
        ctx.globalAlpha = 1.0

        // Draw event border
        ctx.strokeStyle = lane.color
        ctx.lineWidth = 2
        ctx.strokeRect(position, eventY, eventWidth, eventHeight)

        // Draw event title
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"

        // Truncate title if needed
        const title = event.title || "Untitled Event"
        const maxTitleWidth = eventWidth - 10
        let displayTitle = title

        // Measure text width
        const titleWidth = ctx.measureText(title).width
        if (titleWidth > maxTitleWidth) {
          // Truncate title
          let truncated = title
          while (ctx.measureText(truncated + "...").width > maxTitleWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1)
          }
          displayTitle = truncated + "..."
        }

        ctx.fillText(displayTitle, position + 5, eventY + eventHeight / 2)

        // Draw time offset
        const timeOffset = event.time_offset !== undefined ? `${event.time_offset}m` : ""
        if (timeOffset) {
          ctx.font = "10px Arial"
          ctx.fillText(timeOffset, position + 5, eventY + eventHeight - 8)
        }

        // Draw duration
        const durationText = `${duration}s`
        ctx.font = "10px Arial"
        ctx.textAlign = "right"
        ctx.fillText(durationText, position + eventWidth - 5, eventY + eventHeight - 8)
      } catch (error) {
        console.error("Error drawing event:", error, event)
      }
    }
  }

  // Draw vertical timeline (placeholder for future implementation)
  const drawVerticalTimeline = (ctx, width, height) => {
    // Not implemented yet
    ctx.fillStyle = "#212529"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Vertical timeline not implemented yet", width / 2, height / 2)
  }

  // Handle zoom
  const handleZoom = (direction) => {
    setZoomLevel((prevZoom) => {
      const newZoom =
        direction === "in" ? Math.min(prevZoom * ZOOM_STEP, MAX_ZOOM) : Math.max(prevZoom / ZOOM_STEP, MIN_ZOOM)

      console.log(`Zoom changed: ${prevZoom.toFixed(2)} -> ${newZoom.toFixed(2)}`)
      return newZoom
    })
  }

  // Handle interval change
  const handleIntervalChange = (value) => {
    console.log(`Interval changed: ${selectedInterval} -> ${value}`)
    setSelectedInterval(value)
  }

  // Handle canvas click
  const handleCanvasClick = (e) => {
    // Close context menu if open
    if (contextMenu) {
      setContextMenu(null)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked event
    const clickedEvent = findEventAtPosition(x, y)

    if (clickedEvent) {
      setSelectedEvent(clickedEvent)
      // Handle event click (e.g., open edit modal)
      console.log("Clicked event:", clickedEvent)
    } else {
      setSelectedEvent(null)
    }
  }

  // Handle canvas context menu
  const handleCanvasContextMenu = (e) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked event
    const clickedEvent = findEventAtPosition(x, y)

    if (clickedEvent) {
      // Show context menu for event
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        event: clickedEvent,
      })
    } else {
      // Show context menu for canvas
      const time = calculateTimeFromPosition(x)

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        time,
      })
    }
  }

  // Handle mouse down for drag
  const handleMouseDown = (e) => {
    if (e.button !== 0) return // Only handle left mouse button

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    console.log("Mouse down at:", x, y)

    // Find the event under the cursor
    const clickedEvent = findEventAtPosition(x, y)

    if (clickedEvent) {
      console.log("Found draggable event:", clickedEvent.title)
      setIsDragging(true)
      setDraggedEvent(clickedEvent)
      setDragStartX(x)
      setDragStartY(y)

      // Create ghost element
      createGhostElement(e.clientX, e.clientY, clickedEvent)

      // Add global event listeners
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      e.preventDefault() // Prevent text selection during drag
    }
  }

  // Handle mouse move for drag
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !draggedEvent) return

      // Move ghost element
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX}px`
        ghostRef.current.style.top = `${e.clientY}px`
      }

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left

      // Calculate time at current position
      const time = calculateTimeFromPosition(x)

      // Show tooltip
      setDragTooltip({
        x: e.clientX,
        y: e.clientY - 30,
        time: `${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${Math.round((time.getTime() - startTime.getTime()) / 60000)}m)`,
      })
    },
    [isDragging, draggedEvent, startTime],
  )

  // Handle mouse up for drag
  const handleMouseUp = useCallback(
    async (e) => {
      if (!isDragging || !draggedEvent) return

      // Remove ghost element
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current)
        ghostRef.current = null
      }

      // Remove event listeners
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate new time offset
      const time = calculateTimeFromPosition(x)
      const newOffset = Math.round((time.getTime() - startTime.getTime()) / 60000)

      // Calculate new lane
      const newLane = calculateLaneFromPosition(y)

      // Update event
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase
          .from("timeline_events")
          .update({
            time_offset: newOffset,
            lane: newLane?.id || draggedEvent.lane,
          })
          .eq("id", draggedEvent.id)

        if (error) throw error

        // Refresh events
        if (onEventsChange) {
          await onEventsChange()
        }

        toast({
          title: "Event updated",
          description: `Moved "${draggedEvent.title}" to ${newOffset}m in ${newLane?.name || "same"} lane`,
        })
      } catch (error) {
        console.error("Error updating event:", error)
        toast({
          title: "Error",
          description: `Failed to update event: ${error.message}`,
          variant: "destructive",
        })
      }

      // Reset drag state
      setIsDragging(false)
      setDraggedEvent(null)
      setDragTooltip(null)
    },
    [isDragging, draggedEvent, handleMouseMove, onEventsChange, startTime],
  )

  // Handle drag over for dropping elements
  const handleDragOver = (e) => {
    e.preventDefault()

    // Calculate time at current position
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate time at current position
    const time = calculateTimeFromPosition(x)

    // Show tooltip
    setDragTooltip({
      x: e.clientX,
      y: e.clientY - 30,
      time: `${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit' })} (${Math.round((time.getTime() - startTime.getTime())  { hour: '2-digit", minute: "2-digit" })} (${Math.round((time.getTime() - startTime.getTime()) / 60000)}m)`,
    })
  }

  // Handle drag leave
  const handleDragLeave = (e) => {
    setDragTooltip(null)
  }

  // Handle drop for creating new events
  const handleDrop = async (e) => {
    e.preventDefault()

    // Hide tooltip
    setDragTooltip(null)

    // Get dropped element data
    const elementData = e.dataTransfer.getData("application/json")
    if (!elementData) {
      console.error("No element data found in drop event")
      return
    }

    try {
      const element = JSON.parse(elementData)

      // Calculate drop position
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate time at drop position
      const time = calculateTimeFromPosition(x)
      const timeOffset = Math.round((time.getTime() - startTime.getTime()) / 60000)

      // Calculate lane at drop position
      const lane = calculateLaneFromPosition(y)

      // Create new event
      await createEventFromElement(element, timeOffset, lane?.id)
    } catch (error) {
      console.error("Error handling drop:", error)
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Create event from element
  const createEventFromElement = async (element, timeOffset, laneId) => {
    try {
      // Create new event
      const newEvent = {
        game_id: gameId,
        title: element.name || "New Event",
        description: element.description || "",
        time_offset: timeOffset,
        duration: element.duration || 60,
        lane: laneId || element.default_lane || "misc",
        element_id: element.id,
        element_type: element.type || "custom",
      }

      console.log("Creating new event:", newEvent)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("timeline_events").insert([newEvent]).select().single()

      if (error) throw error

      // Refresh events
      if (onEventsChange) {
        await onEventsChange()
      }

      toast({
        title: "Event created",
        description: `Added "${element.name || "New Event"}" to timeline at ${timeOffset}m`,
      })

      return data
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  }

  // Helper function to find event at position
  const findEventAtPosition = (x, y) => {
    // Skip if outside timeline area
    if (y < TIME_HEADER_HEIGHT) return null

    // Calculate lane positions
    let currentY = TIME_HEADER_HEIGHT

    for (const lane of LANE_ORDER) {
      const laneHeight = lane.height
      const laneY = currentY

      // Skip if click is outside this lane
      if (y < laneY || y > laneY + laneHeight) {
        currentY += laneHeight
        continue
      }

      // Check each event in this lane
      for (const event of events) {
        if (!event) continue
        if (getEventLane(event).id !== lane.id) continue

        // Calculate event position and dimensions
        const startDate =
          event.time_offset !== undefined
            ? calculateStartTime(event.time_offset, startTime)
            : new Date(event.start_time)

        const duration = event.duration && event.duration > 0 ? event.duration : 60
        const position = ((startDate.getTime() - startTime.getTime()) / 60000) * pixelsPerMinute + LANE_HEADER_WIDTH
        const eventWidth = Math.max((duration / 60) * pixelsPerMinute, 100)
        const eventY = laneY + LANE_PADDING
        const eventHeight = laneHeight - LANE_PADDING * 2

        // Check if click is inside this event
        if (x >= position && x <= position + eventWidth && y >= eventY && y <= eventY + eventHeight) {
          return event
        }
      }

      currentY += laneHeight
    }

    return null
  }

  // Helper function to calculate time from position
  const calculateTimeFromPosition = (x) => {
    // Calculate minutes from start time
    const minutes = (x - LANE_HEADER_WIDTH) / pixelsPerMinute

    // Create new date
    const time = new Date(startTime)
    time.setMinutes(time.getMinutes() + Math.max(0, minutes))

    return time
  }

  // Helper function to calculate lane from position
  const calculateLaneFromPosition = (y) => {
    // Skip if outside timeline area
    if (y < TIME_HEADER_HEIGHT) return null

    // Calculate lane positions
    let currentY = TIME_HEADER_HEIGHT

    for (const lane of LANE_ORDER) {
      const laneHeight = lane.height
      const laneY = currentY

      // Check if position is in this lane
      if (y >= laneY && y <= laneY + laneHeight) {
        return lane
      }

      currentY += laneHeight
    }

    return null
  }

  // Helper function to create ghost element
  const createGhostElement = (x, y, event) => {
    // Remove existing ghost element
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current)
      ghostRef.current = null
    }

    // Create ghost element
    const ghost = document.createElement("div")
    ghost.style.position = "fixed"
    ghost.style.left = `${x}px`
    ghost.style.top = `${y}px`
    ghost.style.padding = "5px 10px"
    ghost.style.background = getEventLane(event).color
    ghost.style.color = "white"
    ghost.style.borderRadius = "4px"
    ghost.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)"
    ghost.style.pointerEvents = "none"
    ghost.style.zIndex = "9999"
    ghost.style.opacity = "0.8"
    ghost.style.transform = "translate(-50%, -50%)"
    ghost.textContent = event.title || "Untitled Event"

    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col" ref={timelineRef}>
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select value={selectedInterval} onValueChange={handleIntervalChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {TIME_INTERVALS.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleZoom("out")} disabled={zoomLevel <= MIN_ZOOM}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => handleZoom("in")} disabled={zoomLevel >= MAX_ZOOM}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas container */}
      <div
        className={cn("relative flex-1 overflow-auto border border-gray-200 rounded-md", isLoading && "opacity-50")}
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
        {/* Canvas wrapper */}
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

          {/* Drag tooltip */}
          {dragTooltip && (
            <div
              className="absolute bg-blue-600 text-white px-3 py-1 rounded-md shadow-lg z-50"
              style={{
                left: `${dragTooltip.x}px`,
                top: `${dragTooltip.y}px`,
                transform: "translate(-50%, -100%)",
                pointerEvents: "none",
              }}
            >
              {dragTooltip.time}
            </div>
          )}

          {/* Context menu */}
          {contextMenu && (
            <div
              className="absolute bg-white rounded-md shadow-lg z-50 p-1"
              style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
                minWidth: "150px",
              }}
            >
              {contextMenu.event ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium border-b">{contextMenu.event.title}</div>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-sm"
                    onClick={() => {
                      // Handle edit
                      setContextMenu(null)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-sm text-red-600"
                    onClick={async () => {
                      try {
                        const supabase = getSupabaseClient()
                        const { error } = await supabase.from("timeline_events").delete().eq("id", contextMenu.event.id)

                        if (error) throw error

                        // Refresh events
                        if (onEventsChange) {
                          await onEventsChange()
                        }

                        toast({
                          title: "Event deleted",
                          description: `Removed "${contextMenu.event.title}" from timeline`,
                        })
                      } catch (error) {
                        console.error("Error deleting event:", error)
                        toast({
                          title: "Error",
                          description: `Failed to delete event: ${error.message}`,
                          variant: "destructive",
                        })
                      }

                      setContextMenu(null)
                    }}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-sm font-medium border-b">Add Event</div>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-sm"
                    onClick={() => {
                      // Handle add event
                      setContextMenu(null)
                    }}
                  >
                    Add Custom Event
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  )
}

