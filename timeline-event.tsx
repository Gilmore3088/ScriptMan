"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Paperclip, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Add delete functionality to the timeline event component

// Import the necessary components for the delete functionality
import { MoreVerticalIcon, TrashIcon } from "lucide-react"

// Add onDelete prop to the TimelineEventProps interface
interface TimelineEventProps {
  event: {
    id: string
    startTime: number
    endTime: number
    title: string
    components: string[]
    notes: string
    category: string
  }
  zoomLevel: number
  orientation: "vertical" | "horizontal"
  onComponentClick: (componentName: string) => void
  onEventDelete?: (eventId: string) => void
}

export function TimelineEvent({ event, zoomLevel, orientation, onComponentClick, onEventDelete }: TimelineEventProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate position and width/height based on start/end times
  // 1 second = 2px * zoomLevel
  const pixelsPerSecond = 2 * zoomLevel

  // The startTime in the timeline is -7200 (2 hours before game start)
  const timelineStartTime = -7200 // 2 hours before game start

  // Format time for display
  const formatTime = (seconds: number) => {
    // Convert seconds to hours:minutes format, adding back the 7pm offset
    const totalMinutes = Math.floor(seconds / 60) + 19 * 60
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const startTimeFormatted = formatTime(event.startTime)
  const endTimeFormatted = formatTime(event.endTime)
  const duration = Math.floor((event.endTime - event.startTime) / 60) + "m"

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PREGAME":
        return {
          border: "border-blue-500",
          bg: "bg-blue-50",
          text: "text-blue-800",
          badge: "bg-blue-100 border-blue-200 text-blue-800",
        }
      case "IN GAME":
        return {
          border: "border-green-500",
          bg: "bg-green-50",
          text: "text-green-800",
          badge: "bg-green-100 border-green-200 text-green-800",
        }
      case "HALFTIME":
        return {
          border: "border-orange-500",
          bg: "bg-orange-50",
          text: "text-orange-800",
          badge: "bg-orange-100 border-orange-200 text-orange-800",
        }
      case "POSTGAME":
        return {
          border: "border-purple-500",
          bg: "bg-purple-50",
          text: "text-purple-800",
          badge: "bg-purple-100 border-purple-200 text-purple-800",
        }
      default:
        return {
          border: "border-gray-500",
          bg: "bg-gray-50",
          text: "text-gray-800",
          badge: "bg-gray-100 border-gray-200 text-gray-800",
        }
    }
  }

  const colors = getCategoryColor(event.category)

  // Calculate the exact position based on the event's start time
  const startPosition = Math.round((event.startTime - timelineStartTime) * pixelsPerSecond)
  const eventWidth = Math.max(Math.round((event.endTime - event.startTime) * pixelsPerSecond), 120)

  // Update the position styles for vertical orientation to ensure proper alignment with the floating sidebar
  const positionStyles =
    orientation === "horizontal"
      ? {
          left: `${startPosition}px`,
          width: `${eventWidth}px`,
          top: "8px",
          minWidth: "120px", // Ensure cards have a minimum width
        }
      : {
          top: `${startPosition}px`,
          height: `${Math.max(Math.round((event.endTime - event.startTime) * pixelsPerSecond), 80)}px`, // Ensure minimum height
          left: "8px",
          right: "8px",
          width: "calc(100% - 16px)",
          minHeight: "80px", // Ensure minimum height for very short events
        }

  // Border styles based on orientation
  const borderClass = orientation === "horizontal" ? `border-l-4 ${colors.border}` : `border-t-4 ${colors.border}`

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return // Only process if primary button is pressed

    const dx = Math.abs(e.clientX - dragStart.x)
    const dy = Math.abs(e.clientY - dragStart.y)

    // Only set dragging if mouse has moved a certain threshold
    if (dx > 5 || dy > 5) {
      setIsDragging(true)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const wasDragging = isDragging
    setIsDragging(false)

    // If we weren't dragging, treat this as a click
    if (!wasDragging) {
      // This is a click, not the end of a drag
      e.stopPropagation()
    }
  }

  const handleComponentClick = (e: React.MouseEvent, componentName: string) => {
    e.stopPropagation()
    if (!isDragging) {
      onComponentClick(componentName)
    }
  }

  const handleDelete = () => {
    if (onEventDelete) {
      onEventDelete(event.id)
    }
    setShowDeleteDialog(false)
  }

  // Helper function to format time display
  function formatTimeDisplay(seconds: number): string {
    const isNegative = seconds < 0
    const absoluteSeconds = Math.abs(seconds)
    const minutes = Math.floor(absoluteSeconds / 60)
    const remainingSeconds = Math.floor(absoluteSeconds % 60)

    return `${isNegative ? "-" : ""}${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <>
      <div
        className={`absolute ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={positionStyles}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
        ref={cardRef}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`h-full ${borderClass} ${colors.bg} hover:shadow-md transition-shadow group`}>
                <CardHeader className="p-2">
                  <CardTitle className="text-sm font-medium flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className={`truncate ${colors.text}`}>{event.title}</span>
                      {onEventDelete && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 flex items-center gap-2"
                              onClick={() => setShowDeleteDialog(true)}
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant="outline" className={`text-xs font-normal ${colors.badge}`}>
                        {event.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {startTimeFormatted}
                        {orientation === "horizontal" && ` - ${endTimeFormatted}`}
                        {orientation === "horizontal" && ` (${duration})`}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-xs space-y-1">
                    {event.components.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        <span>
                          {event.components.length} attachment{event.components.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {event.components.map((component, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 p-1 hover:bg-white/50 rounded cursor-pointer"
                        onClick={(e) => handleComponentClick(e, component)}
                      >
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{component}</span>
                      </div>
                    ))}
                    {event.notes && (
                      <div className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{event.notes}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-2">
                <h4 className="font-medium">{event.title}</h4>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>
                    {startTimeFormatted} - {endTimeFormatted} ({duration})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3" />
                  {/* <span>{event.location}</span> */}
                </div>
                {event.components.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Paperclip className="h-3 w-3" />
                    <span>
                      {event.components.length} attachment{event.components.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {event.notes && (
                  <div className="text-xs">
                    <p>{event.notes}</p>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timeline Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

