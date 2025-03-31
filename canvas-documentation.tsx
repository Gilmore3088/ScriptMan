"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  ZoomIn,
  ZoomOut,
  Move,
  Calendar,
  FileText,
  FileIcon as FilePdf,
  Layers,
  PanelLeft,
  MousePointer,
  ArrowLeftRight,
  ArrowUpDown,
} from "lucide-react"

export default function CanvasDocumentation() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Canvas View Documentation</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
          <TabsTrigger value="library">Elements Library</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Canvas View: The Heart of Script Building</CardTitle>
              <CardDescription>
                A dynamic, visual workspace where users lay out every aspect of their game script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">What is the Canvas View?</h3>
                  <p className="text-muted-foreground mb-4">
                    The Canvas View is an interactive timeline-based interface that replaces traditional spreadsheets
                    with a visual representation of your game script. It mirrors how events actually unfold during a
                    game, making script planning intuitive and efficient.
                  </p>

                  <h3 className="text-lg font-medium mb-3">User Journey</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>User logs in and selects a Season</li>
                    <li>Within a Season, they select or create a Game</li>
                    <li>Clicking on a Game opens the Script Builder</li>
                    <li>From here, the user selects "Canvas View" to visually structure the script</li>
                  </ol>
                </div>

                <div className="bg-muted rounded-lg p-6 flex flex-col justify-center items-center">
                  <div className="w-full h-48 bg-background rounded-md border border-border flex flex-col">
                    <div className="h-10 border-b border-border flex items-center px-4 bg-muted/50">
                      <span className="font-medium">Canvas View</span>
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Interactive timeline interface</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    The Canvas View provides a visual representation of your game script timeline
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowLeftRight className="h-5 w-5 mr-2" />
                  <ArrowUpDown className="h-5 w-5 mr-2" />
                  Display Modes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ArrowLeftRight className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Horizontal View</h4>
                      <p className="text-sm text-muted-foreground">
                        Gantt chart style with time flowing left to right. Ideal for production managers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ArrowUpDown className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Vertical View</h4>
                      <p className="text-sm text-muted-foreground">
                        Traditional running order with time flowing top to bottom. Familiar for script writers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Time Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Flexible Intervals</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose from 15s, 30s, 1min, 5min, 15min, 30min, or 60min increments to match your needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ZoomIn className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Dynamic Zoom</h4>
                      <p className="text-sm text-muted-foreground">
                        Zoom in for detailed work or out for overview planning with intuitive controls.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  Element Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MousePointer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Direct Interaction</h4>
                      <p className="text-sm text-muted-foreground">
                        Click directly on the timeline to add events or click existing elements to edit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <PanelLeft className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Element Library</h4>
                      <p className="text-sm text-muted-foreground">
                        Drag pre-configured elements from the sidebar library for quick script building.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Move className="h-5 w-5 mr-2" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Move className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pan & Zoom</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate through the timeline with intuitive controls and clear visual feedback.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Time Markers</h4>
                      <p className="text-sm text-muted-foreground">
                        Clear indicators show time progression with adjustable granularity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interaction" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Interaction</CardTitle>
              <CardDescription>How to interact with the Canvas View to build and manage your script</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Adding Elements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MousePointer className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium">Direct Timeline Click</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click anywhere on the canvas to add an event at that specific time
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <PlusCircle className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium">Add Event Button</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Use the button in the control panel to add a new event
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <PanelLeft className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium">Drag from Library</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Drag pre-configured elements from the Elements Library sidebar
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Editing Elements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MousePointer className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium">Click to Edit</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Select any element to open its edit dialog with all properties
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Move className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium">Drag to Reposition</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Move elements to different times by dragging them on the canvas
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Canvas Controls</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Horizontal
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Vertical
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      15 min intervals
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Zoom In
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ZoomOut className="h-4 w-4 mr-2" />
                      Zoom Out
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Print Layout
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <FilePdf className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Elements Library</CardTitle>
              <CardDescription>Quick access to pre-configured elements for efficient script building</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Sponsor Reads</h3>
                    <div className="space-y-2">
                      <div className="bg-background p-2 rounded border border-border text-sm">
                        Coca-Cola Sponsor Read
                      </div>
                      <div className="bg-background p-2 rounded border border-border text-sm">
                        Toyota Halftime Sponsor
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Permanent Markers</h3>
                    <div className="space-y-2">
                      <div className="bg-background p-2 rounded border border-border text-sm">Halftime</div>
                      <div className="bg-background p-2 rounded border border-border text-sm">Pre-Game Countdown</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Promotions</h3>
                    <div className="space-y-2">
                      <div className="bg-background p-2 rounded border border-border text-sm">Nike Promotion</div>
                      <div className="bg-background p-2 rounded border border-border text-sm">Season Ticket Promo</div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Generic Events</h3>
                    <div className="space-y-2">
                      <div className="bg-background p-2 rounded border border-border text-sm">Weather Update</div>
                      <div className="bg-background p-2 rounded border border-border text-sm">Timeout Announcement</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Sponsor Management</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    The Sponsor Management section allows you to track sponsor fulfillment across games, manage sponsor
                    assets and requirements, and monitor sponsor read frequency and placement.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background p-3 rounded border border-border">
                      <h4 className="font-medium text-sm mb-1">Track Fulfillment</h4>
                      <p className="text-xs text-muted-foreground">Monitor sponsor obligations across multiple games</p>
                    </div>

                    <div className="bg-background p-3 rounded border border-border">
                      <h4 className="font-medium text-sm mb-1">Manage Assets</h4>
                      <p className="text-xs text-muted-foreground">Organize sponsor assets and requirements</p>
                    </div>

                    <div className="bg-background p-3 rounded border border-border">
                      <h4 className="font-medium text-sm mb-1">Placement Analysis</h4>
                      <p className="text-xs text-muted-foreground">Analyze optimal sponsor read timing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Share and distribute your game scripts in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <FileText className="h-8 w-8 mr-3 text-primary" />
                    <h3 className="text-xl font-medium">Print Layout</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Generate a printer-friendly version of the script optimized for physical distribution.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Clean, readable formatting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Optimized for paper size
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Includes all event details
                    </li>
                  </ul>
                  <Button className="mt-4" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Print Layout
                  </Button>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <FilePdf className="h-8 w-8 mr-3 text-primary" />
                    <h3 className="text-xl font-medium">Export PDF</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Create a shareable PDF document of the entire timeline for digital distribution.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Digital-friendly format
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Preserves all styling
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Easy to share via email
                    </li>
                  </ul>
                  <Button className="mt-4" variant="outline">
                    <FilePdf className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="mt-6 bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Coming Soon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-3 rounded border border-border">
                    <h4 className="font-medium text-sm mb-1">Excel Export</h4>
                    <p className="text-xs text-muted-foreground">For teams that still need spreadsheet handoffs</p>
                  </div>

                  <div className="bg-background p-3 rounded border border-border">
                    <h4 className="font-medium text-sm mb-1">Role-Based Views</h4>
                    <p className="text-xs text-muted-foreground">Customized exports for different team members</p>
                  </div>

                  <div className="bg-background p-3 rounded border border-border">
                    <h4 className="font-medium text-sm mb-1">Mobile Formats</h4>
                    <p className="text-xs text-muted-foreground">Optimized for viewing on mobile devices</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mt-0.5 mr-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Use appropriate zoom levels</h4>
                  <p className="text-sm text-muted-foreground">
                    Match your zoom level to the density of your script. Zoom in for detailed sections.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mt-0.5 mr-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Leverage the Elements Library</h4>
                  <p className="text-sm text-muted-foreground">
                    Use pre-built elements for consistency across games and faster script building.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mt-0.5 mr-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Maintain logical flow</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep events in a logical sequence with appropriate spacing between items.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mt-0.5 mr-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Regularly export or save</h4>
                  <p className="text-sm text-muted-foreground">
                    Create PDF exports at key milestones to preserve your work and share with stakeholders.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mt-0.5 mr-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Use color-coding consistently</h4>
                  <p className="text-sm text-muted-foreground">
                    Maintain consistent color schemes for event types to aid in visual scanning.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Need more help with the Canvas View? Check out our video tutorials or contact support.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline">Video Tutorials</Button>
          <Button variant="default">Contact Support</Button>
        </div>
      </div>
    </div>
  )
}

import { CheckCircle, PlusCircle } from "lucide-react"

