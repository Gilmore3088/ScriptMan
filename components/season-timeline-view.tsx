"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, LayoutTemplate, LayoutGrid } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/utils"
import type { Game } from "@/lib/types"
import Link from "next/link"

interface SeasonTimelineViewProps {
  games: Game[]
  seasonId: string
  onGameClick: (gameId: string) => void
}

export function SeasonTimelineView({ games, seasonId, onGameClick }: SeasonTimelineViewProps) {
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("horizontal")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [sortedGames, setSortedGames] = useState<Game[]>([])

  useEffect(() => {
    // Sort games by date
    const sorted = [...games].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
    setSortedGames(sorted)
  }, [games])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "horizontal" ? "vertical" : "horizontal"))
  }

  // Calculate timeline scale based on zoom level
  const pixelsPerDay = 120 * zoomLevel

  // Find the earliest and latest dates
  const earliestDate = sortedGames.length > 0 ? new Date(sortedGames[0].date) : new Date()
  const latestDate = sortedGames.length > 0 ? new Date(sortedGames[sortedGames.length - 1].date) : new Date()

  // Add padding to the timeline (2 weeks before and after)
  const startDate = new Date(earliestDate)
  startDate.setDate(startDate.getDate() - 14)

  const endDate = new Date(latestDate)
  endDate.setDate(endDate.getDate() + 14)

  // Calculate the total days in the timeline
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate the timeline width/height
  const timelineDimension = totalDays * pixelsPerDay

  // Generate month markers
  const monthMarkers = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const isFirstDayOfMonth = currentDate.getDate() === 1
    const isStartOfTimeline = currentDate.getTime() === startDate.getTime()

    if (isFirstDayOfMonth || isStartOfTimeline) {
      const position = ((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay
      const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

      if (orientation === "horizontal") {
        monthMarkers.push(
          <div
            key={`month-${currentDate.getTime()}`}
            className="absolute top-0 h-full border-l border-gray-300 bg-gray-50/50"
            style={{ left: `${position}px` }}
          >
            <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium">{monthName}</div>
          </div>,
        )
      } else {
        monthMarkers.push(
          <div
            key={`month-${currentDate.getTime()}`}
            className="absolute left-0 w-full border-t border-gray-300 bg-gray-50/50"
            style={{ top: `${position}px` }}
          >
            <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium inline-block">
              {monthName}
            </div>
          </div>,
        )
      }
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Generate game markers
  const gameMarkers = sortedGames.map((game) => {
    const gameDate = new Date(game.date)
    const position = ((gameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay
    const gameTime = gameDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })

    if (orientation === "horizontal") {
      return (
        <div
          key={game.id}
          className="absolute cursor-pointer"
          style={{
            left: `${position}px`,
            top: "50px",
            transform: "translateX(-50%)",
          }}
          onClick={() => onGameClick(game.id)}
        >
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-primary mb-1"></div>
            <Link
              href={`/seasons/${seasonId}/games/${game.id}`}
              className="bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-sm font-medium">{game.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(game.date)} • {gameTime}
              </div>
              {game.theme && (
                <div className="mt-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block">
                  {game.theme}
                </div>
              )}
            </Link>
          </div>
        </div>
      )
    } else {
      return (
        <div
          key={game.id}
          className="absolute cursor-pointer"
          style={{
            top: `${position}px`,
            left: "50px",
            transform: "translateY(-50%)",
          }}
          onClick={() => onGameClick(game.id)}
        >
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
            <Link
              href={`/seasons/${seasonId}/games/${game.id}`}
              className="bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-sm font-medium">{game.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(game.date)} • {gameTime}
              </div>
              {game.theme && (
                <div className="mt-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block">
                  {game.theme}
                </div>
              )}
            </Link>
          </div>
        </div>
      )
    }
  })

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Season Timeline</h3>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleOrientation}>
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

      <div className="relative overflow-auto" style={{ height: "500px" }}>
        {orientation === "horizontal" ? (
          <div className="relative h-full" style={{ width: `${timelineDimension}px`, minWidth: "100%" }}>
            {monthMarkers}
            {gameMarkers}
          </div>
        ) : (
          <div className="relative w-full" style={{ height: `${timelineDimension}px`, minHeight: "100%" }}>
            {monthMarkers}
            {gameMarkers}
          </div>
        )}
      </div>
    </div>
  )
}

