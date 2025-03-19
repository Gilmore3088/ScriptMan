"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  Printer,
  Download,
  ListIcon,
  LayoutTemplateIcon as LayoutVerticalIcon,
  Loader2,
} from "lucide-react"
import { TimelineEditor } from "@/components/timeline-editor"
import { TimelineEvent } from "@/components/timeline-event"
import { ShowFlowEditor } from "@/components/show-flow-editor"
import { ComponentDetail } from "@/components/component-detail"
import { getGame, getComponent, getTimelineEvents } from "@/lib/db"
import type { Game, Component, TimelineEvent as TimelineEventType } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { AddTimelineEventDialog } from "@/components/add-timeline-event-dialog"
import { AddShowFlowItemDialog } from "@/components/add-show-flow-item-dialog"

interface GamePageProps {
  params: {
    seasonId: string
    gameId: string
  }
}

export default function GamePage({ params }: GamePageProps) {
  const { seasonId, gameId } = params
  const searchParams = useSearchParams()
  const initialView = searchParams.get("view") === "timeline" ? "timeline" : "show-flow"
  const initialOrientation = searchParams.get("orientation") === "vertical" ? "vertical" : "horizontal"

  const [zoomLevel, setZoomLevel] = useState(0.5) // Start with a medium zoom level
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(initialOrientation) // Use the orientation from URL
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [activeView, setActiveView] = useState<"show-flow" | "timeline">(initialView)
  const [game, setGame] = useState<Game | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddTimelineDialog, setShowAddTimelineDialog] = useState(false)
  const [showAddShowFlowDialog, setShowAddShowFlowDialog] = useState(false)

  // Add this function to handle new timeline events
  const handleTimelineEventAdded = (newEvent: TimelineEventType) => {
    setTimelineEvents([...timelineEvents, newEvent])
    toast({
      title: "Event Added",
      description: `"${newEvent.title}" has been added to the timeline.`,
    })
  }

  // Fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true)
        console.log(`Fetching game with ID: ${gameId}`)
        const gameData = await getGame(gameId)

        if (gameData) {
          console.log("Game data retrieved:", gameData)
          setGame(gameData)

          // Also fetch timeline events
          if (activeView === "timeline") {
            const events = await getTimelineEvents(gameId)
            console.log("Timeline events retrieved:", events)
            setTimelineEvents(events)
          }
        } else {
          console.error("Game not found")
          toast({
            title: "Error",
            description: "Game not found",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching game data:", error)
        toast({
          title: "Error",
          description: "Failed to load game data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameData()
  }, [gameId, activeView])

  // Set the view based on URL parameter on initial load
  useEffect(() => {
    if (searchParams.get("view") === "timeline") {
      setActiveView("timeline")
    }

    // Set orientation from URL
    if (searchParams.get("orientation") === "vertical") {
      setOrientation("vertical")
    } else if (searchParams.get("orientation") === "horizontal") {
      setOrientation("horizontal")
    }
  }, [searchParams])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.1))
  }

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "vertical" ? "horizontal" : "vertical"))
  }

  const handlePrint = () => {
    // In a real implementation, this would generate a print view
    console.log("Print script")
    window.print()
  }

  const handleExport = () => {
    // In a real implementation, this would generate a PDF
    console.log("Export script to PDF")
  }

  const handleComponentClick = async (componentName: string) => {
    try {
      // In a real implementation, you would fetch the component by name
      // For now, we'll just use a mock implementation
      const component = await getComponent(componentName)
      if (component) {
        setSelectedComponent(component)
      } else {
        toast({
          title: "Component Not Found",
          description: `Component "${componentName}" could not be found.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching component:", error)
      toast({
        title: "Error",
        description: "Failed to load component details",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading game data...</span>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-xl">Game not found</p>
        <p className="text-muted-foreground">The game you're looking for could not be found.</p>
        <Link href={`/seasons/${seasonId}`}>
          <Button>Return to Season</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/seasons/${seasonId}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Season
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{game.title}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(game.date).toLocaleDateString()} • {game.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              value={activeView}
              onValueChange={(value) => setActiveView(value as "show-flow" | "timeline")}
              className="mr-4"
            >
              <TabsList>
                <TabsTrigger value="show-flow" className="flex items-center gap-1">
                  <ListIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Show Flow</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-1">
                  <LayoutVerticalIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                if (activeView === "timeline") {
                  setShowAddTimelineDialog(true)
                } else {
                  setShowAddShowFlowDialog(true)
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeView === "show-flow" ? (
          <ShowFlowEditor gameId={gameId} onComponentClick={handleComponentClick} />
        ) : (
          <TimelineEditor
            gameId={gameId}
            zoomLevel={zoomLevel}
            orientation={orientation}
            onEventAdded={handleTimelineEventAdded}
          >
            {timelineEvents.map((event) => (
              <TimelineEvent
                key={event.id}
                event={event}
                zoomLevel={zoomLevel}
                orientation={orientation}
                onComponentClick={handleComponentClick}
              />
            ))}
          </TimelineEditor>
        )}
      </div>

      <ComponentDetail
        component={selectedComponent}
        isOpen={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
      />

      {/* Add Timeline Event Dialog */}
      <AddTimelineEventDialog
        open={showAddTimelineDialog}
        onOpenChange={setShowAddTimelineDialog}
        gameId={gameId}
        startTime={0} // Default to game start time
        onEventAdded={handleTimelineEventAdded}
      />

      {/* Add Show Flow Item Dialog */}
      {activeView === "show-flow" && (
        <AddShowFlowItemDialog open={showAddShowFlowDialog} onOpenChange={setShowAddShowFlowDialog} gameId={gameId} />
      )}
    </div>
  )
}

