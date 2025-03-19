"use client"

import React from "react"

import { type ReactNode, useRef, useEffect, useState } from "react"
import { Loader2, ZoomIn, ZoomOut, LayoutTemplate, LayoutGrid, Filter, Search } from "lucide-react"
import { getTimelineEvents, deleteTimelineEvent } from "@/lib/db"
import type { TimelineEvent } from "@/lib/types"
import { AddTimelineEventDialog } from "./add-timeline-event-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TimelineEditorProps {
  gameId: string
  children?: ReactNode
  zoomLevel: number
  orientation: "vertical" | "horizontal"
  onEventAdded?: (event: TimelineEvent) => void
}

// Update the TimelineEditor component to include zoom controls and filtering
export function TimelineEditor({ gameId, children, zoomLevel, orientation, onEventAdded }: TimelineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [clickedTime, setClickedTime] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    PREGAME: true,
    "IN GAME": true,
    HALFTIME: true,
    POSTGAME: true,
  })
  const [localZoomLevel, setLocalZoomLevel] = useState(zoomLevel)

  // Fetch timeline events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const data = await getTimelineEvents(gameId)
        setEvents(data)
      } catch (error) {
        console.error("Error fetching timeline events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [gameId])

  // Handle event deletion
  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteTimelineEvent(eventId)
      // Update the local state to remove the deleted event
      setEvents(events.filter((event) => event.id !== eventId))
      toast({
        title: "Event Deleted",
        description: "The timeline event has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting timeline event:", error)
      toast({
        title: "Error",
        description: "Failed to delete the timeline event.",
        variant: "destructive",
      })
    }
  }

  // Calculate timeline scale based on zoom level
  // 1 second = 2px * zoomLevel
  const pixelsPerSecond = 2 * localZoomLevel

  // Update the timeline range to start 2 hours before and extend 5 hours after game start
  // Start 2 hours before game start and extend 5 hours after
  // Convert to seconds:
  // -2 hours = -7200 seconds
  // +5 hours = +18000 seconds
  const startTime = -7200 // 2 hours before game start
  const endTime = 18000 // 5 hours after game start
  const timeRange = endTime - startTime

  // Handle timeline click to add a new event
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (containerRef.current) {
      // Calculate the time based on click position
      let clickTime: number

      if (orientation === "horizontal") {
        // Get the click position relative to the container
        const containerRect = containerRef.current.getBoundingClientRect()
        const clickX = e.clientX - containerRect.left + containerRef.current.scrollLeft

        // Convert pixel position to time
        clickTime = Math.round(clickX / pixelsPerSecond) + startTime
      } else {
        // Get the click position relative to the container
        const containerRect = containerRef.current.getBoundingClientRect()
        const clickY = e.clientY - containerRect.top + containerRef.current.scrollTop

        // Convert pixel position to time
        clickTime = Math.round(clickY / pixelsPerSecond) + startTime
      }

      // Set the clicked time and show the dialog
      setClickedTime(clickTime)
      setShowAddDialog(true)
    }
  }

  // Handle new event added
  const handleEventAdded = (newEvent: TimelineEvent) => {
    setEvents([...events, newEvent])
    if (onEventAdded) {
      onEventAdded(newEvent)
    }
  }

  // Handle zoom in
  const handleZoomIn = () => {
    setLocalZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setLocalZoomLevel((prev) => Math.max(prev - 0.1, 0.1))
  }

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Determine the appropriate time interval based on zoom level
  const getTimeInterval = (zoomLevel: number): number => {
    if (zoomLevel >= 0.7) return 60 // 1 minute at 70% zoom and above
    if (zoomLevel >= 0.5) return 60 // 1 minute at 50% zoom
    return 300 // 5 minutes at lower zoom
  }

  // Generate time markers based on zoom level
  const timeMarkers = []
  const timeLabels = []

  // Get the appropriate time interval based on zoom level
  const timeInterval = getTimeInterval(localZoomLevel)

  // Create time markers with the calculated interval
  for (
    let i = Math.floor(startTime / timeInterval) * timeInterval;
    i <= Math.ceil(endTime / timeInterval) * timeInterval;
    i += timeInterval
  ) {
    // Convert seconds to hours:minutes:seconds format
    const totalSeconds = i + 19 * 3600 // Add back the 7pm offset in seconds
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    // Format time based on the interval
    let formattedTime = ""
    if (timeInterval < 60) {
      // Show seconds for intervals less than 1 minute
      formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } else {
      formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`
    }

    // Calculate exact pixel position
    const exactPosition = (i - startTime) * pixelsPerSecond

    // Ensure integer pixel positions for crisp rendering
    const position = Math.round(exactPosition)

    // Determine if this is a major interval (every hour or 30 minutes)
    const isMajorInterval = minutes % 30 === 0 && seconds === 0
    // Determine if this is a medium interval (every 5 minutes)
    const isMediumInterval = minutes % 5 === 0 && seconds === 0
    // Determine if this is a minor interval (every 1 minute)
    const isMinorInterval = minutes % 1 === 0 && seconds === 0 && !isMediumInterval && !isMajorInterval

    if (orientation === "horizontal") {
      // For the floating header - center the label on the position
      // Show labels based on zoom level and interval type
      if (
        isMajorInterval ||
        (isMediumInterval && localZoomLevel >= 0.5) ||
        (isMinorInterval && localZoomLevel >= 0.7)
      ) {
        timeLabels.push(
          <div
            key={`label-${i}`}
            className={`absolute ${
              isMajorInterval ? "font-medium" : isMediumInterval ? "text-gray-700" : "text-muted-foreground"
            } flex items-center justify-center`}
            style={{
              left: `${position}px`,
              transform: "translateX(-50%)",
              width: "auto",
              height: "100%",
            }}
          >
            <div className="text-xs">{formattedTime}</div>
          </div>,
        )
      }

      // For the main timeline - align the marker exactly with the label
      timeMarkers.push(
        <div
          key={`marker-${i}`}
          className={`absolute border-l ${
            isMajorInterval ? "border-gray-300" : isMediumInterval ? "border-gray-200" : "border-gray-100"
          } h-full ${isMajorInterval ? "bg-gray-50/50" : ""}`}
          style={{
            left: `${position}px`,
            width: "1px",
          }}
        />,
      )
    } else {
      // For vertical orientation
      // Only show labels based on zoom level and interval type
      if (
        isMajorInterval ||
        (isMediumInterval && localZoomLevel >= 0.5) ||
        (isMinorInterval && localZoomLevel >= 0.7)
      ) {
        timeLabels.push(
          <div
            key={`label-${i}`}
            className={`absolute w-full flex items-center h-8`}
            style={{ top: `${position}px`, transform: "translateY(-50%)" }}
          >
            <div
              className={`text-xs ${
                isMajorInterval ? "font-medium" : isMediumInterval ? "text-gray-700" : "text-muted-foreground"
              } pl-2`}
            >
              {formattedTime}
            </div>
          </div>,
        )
      }

      // For vertical orientation - time markers
      timeMarkers.push(
        <div
          key={`marker-${i}`}
          className={`absolute border-t ${
            isMajorInterval ? "border-gray-300" : isMediumInterval ? "border-gray-200" : "border-gray-100"
          } w-full ${isMajorInterval ? "bg-gray-50/50" : ""}`}
          style={{
            top: `${position}px`,
            height: "1px",
          }}
        />,
      )
    }
  }

  // Add game start marker
  const gameStartPosition = Math.round((0 - startTime) * pixelsPerSecond)

  const gameStartMarker =
    orientation === "horizontal" ? (
      <div
        key="game-start-marker"
        className="absolute border-l-2 border-green-500 h-full z-10"
        style={{ left: `${gameStartPosition}px` }}
      />
    ) : (
      <div
        key="game-start-marker"
        className="absolute border-t-2 border-green-500 w-full z-10"
        style={{ top: `${gameStartPosition}px` }}
      />
    )

  const gameStartLabel =
    orientation === "horizontal" ? (
      <div
        key="game-start-label"
        className="absolute z-20 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium"
        style={{
          left: `${gameStartPosition}px`,
          transform: "translateX(-50%)",
          top: "0",
        }}
      >
        GAME START
      </div>
    ) : (
      <div
        key="game-start-label"
        className="absolute z-20 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium"
        style={{
          top: `${gameStartPosition}px`,
          transform: "translateY(-50%)",
          left: "4px",
        }}
      >
        GAME START
      </div>
    )

  timeMarkers.push(gameStartMarker)
  timeLabels.push(gameStartLabel)

  // Handle scroll to update the floating header/sidebar position
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop,
      })
    }
  }

  // Scroll to center (game start) on initial render
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current

      // Calculate the position of game start (7:00pm)
      const gameStartPosition = (0 - startTime) * pixelsPerSecond

      if (orientation === "horizontal") {
        // Center horizontally on game start
        container.scrollLeft = gameStartPosition - container.clientWidth / 2
      } else {
        // Center vertically on game start
        container.scrollTop = gameStartPosition - container.clientHeight / 2
      }

      // Update scroll position after centering
      handleScroll()
    }
  }, [orientation, pixelsPerSecond, startTime, localZoomLevel])

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => {
        container.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Get unique categories for filtering
  const uniqueCategories = Array.from(new Set(events.map((event) => event.category)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading timeline...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden h-full">
      {/* Timeline controls */}
      <div className="sticky top-0 z-40 bg-white border-b p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search timeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Categories</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {uniqueCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={categoryFilters[category] || false}
                  onCheckedChange={() => toggleCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => handleZoomOut()}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-sm font-medium">{Math.round(localZoomLevel * 100)}%</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => handleZoomIn()}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    (window.location.href = window.location.href.replace(
                      "view=timeline",
                      "view=timeline&orientation=" + (orientation === "horizontal" ? "vertical" : "horizontal"),
                    ))
                  }
                >
                  {orientation === "horizontal" ? (
                    <LayoutTemplate className="h-4 w-4" />
                  ) : (
                    <LayoutGrid className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch to {orientation === "horizontal" ? "Vertical" : "Horizontal"} Layout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Timeline legend */}
      <div className="sticky top-12 z-30 bg-white border-b p-2 flex items-center gap-2 text-xs">
        <span className="font-medium">Categories:</span>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          PREGAME
        </Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          IN GAME
        </Badge>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
          HALFTIME
        </Badge>
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          POSTGAME
        </Badge>
      </div>

      {orientation === "horizontal" ? (
        <>
          {/* Horizontal floating header */}
          <div
            className="sticky top-20 z-30 h-12 bg-white border-b flex items-end overflow-hidden"
            style={{ width: "100%" }}
          >
            <div
              className="relative h-full w-full"
              style={{
                transform: `translateX(${-scrollPosition.x}px)`,
                width: `${timeRange * pixelsPerSecond}px`,
              }}
            >
              {timeLabels}
            </div>
          </div>

          {/* Horizontal scrollable content */}
          <div
            ref={containerRef}
            className="overflow-auto bg-gray-50 h-[calc(100%-7.5rem)]"
            onScroll={handleScroll}
            onClick={handleTimelineClick}
          >
            <div
              className="relative min-h-[calc(100vh-12rem)]"
              style={{
                width: `${timeRange * pixelsPerSecond}px`,
                paddingTop: "1rem",
              }}
            >
              {timeMarkers}
              <div className="relative">
                {/* Replace children with a mapped version that includes the onEventDelete prop */}
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                      onEventDelete: handleEventDelete,
                    } as any)
                  }
                  return child
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full">
          {/* Vertical floating sidebar */}
          <div className="sticky left-0 z-30 w-20 bg-white border-r h-full overflow-hidden">
            <div
              className="relative w-full"
              style={{
                height: `${timeRange * pixelsPerSecond}px`,
                transform: `translateY(${-scrollPosition.y}px)`,
              }}
            >
              {timeLabels}
            </div>
          </div>

          {/* Vertical scrollable content */}
          <div
            ref={containerRef}
            className="overflow-auto bg-gray-50 h-full flex-1"
            style={{ maxHeight: "calc(100vh - 8rem)" }}
            onScroll={handleScroll}
            onClick={handleTimelineClick}
          >
            <div
              className="relative w-full"
              style={{
                height: `${timeRange * pixelsPerSecond}px`,
              }}
            >
              {timeMarkers}
              <div className="relative">
                {/* Replace children with a mapped version that includes the onEventDelete prop */}
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                      onEventDelete: handleEventDelete,
                    } as any)
                  }
                  return child
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Timeline Event Dialog */}
      <AddTimelineEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        gameId={gameId}
        startTime={clickedTime}
        onEventAdded={handleEventAdded}
      />
    </div>
  )
}

