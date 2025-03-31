"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddShowFlowItemDialog } from "./add-show-flow-item-dialog"

// Define the type for a show flow item
interface ShowFlowItem {
  id: string
  itemNumber: number
  start: string
  preset: string
  duration: string
  privateNotes: string
  clock: string
  location: string
  audioNotes: string
  read: string
  productionCues: {
    boardLook: boolean
    main: boolean
    aux: boolean
    lowerThird: boolean
    ribbon: boolean
    controlRoom: boolean
  }
}

interface ShowFlowEditorProps {
  gameId: string
  initialItems?: ShowFlowItem[]
}

export function ShowFlowEditor({ gameId, initialItems = [] }: ShowFlowEditorProps) {
  const [items, setItems] = useState<ShowFlowItem[]>(initialItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const handleAddItem = (newItem: ShowFlowItem) => {
    setItems([...items, newItem])
    setIsAddDialogOpen(false)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleEditItem = (updatedItem: ShowFlowItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  const filteredItems =
    activeTab === "all"
      ? items
      : items.filter((item) => {
          if (activeTab === "reads") return item.read.trim() !== ""
          if (activeTab === "production") return Object.values(item.productionCues).some((value) => value)
          return true
        })

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Show Flow</CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="reads">Reads</TabsTrigger>
            <TabsTrigger value="production">Production Cues</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"># Item</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Preset</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Private Notes</TableHead>
                    <TableHead>CLOCK</TableHead>
                    <TableHead>LOCATION</TableHead>
                    <TableHead>AUDIO NOTES</TableHead>
                    <TableHead>READ</TableHead>
                    <TableHead className="text-center">Production Cues</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No show flow items. Click "Add Item" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.start}</TableCell>
                        <TableCell>{item.preset}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell>{item.privateNotes}</TableCell>
                        <TableCell>{item.clock}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.audioNotes}</TableCell>
                        <TableCell>{item.read}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {item.productionCues.boardLook && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Board
                              </span>
                            )}
                            {item.productionCues.main && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Main
                              </span>
                            )}
                            {item.productionCues.aux && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                AUX
                              </span>
                            )}
                            {item.productionCues.lowerThird && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                L3
                              </span>
                            )}
                            {item.productionCues.ribbon && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Ribbon
                              </span>
                            )}
                            {item.productionCues.controlRoom && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                CR
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="reads" className="mt-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"># Item</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>LOCATION</TableHead>
                    <TableHead>READ</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No read items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.start}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.read}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="production" className="mt-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"># Item</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>CLOCK</TableHead>
                    <TableHead>LOCATION</TableHead>
                    <TableHead>AUDIO NOTES</TableHead>
                    <TableHead>BOARD LOOK</TableHead>
                    <TableHead>MAIN</TableHead>
                    <TableHead>AUX</TableHead>
                    <TableHead>LOWER THIRD</TableHead>
                    <TableHead>RIBBON</TableHead>
                    <TableHead>CONTROL ROOM</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                        No production cue items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.start}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell>{item.clock}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.audioNotes}</TableCell>
                        <TableCell className="text-center">{item.productionCues.boardLook ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{item.productionCues.main ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{item.productionCues.aux ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{item.productionCues.lowerThird ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{item.productionCues.ribbon ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{item.productionCues.controlRoom ? "✓" : ""}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <AddShowFlowItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddItem}
        gameId={gameId}
        itemNumber={items.length > 0 ? Math.max(...items.map((i) => i.itemNumber)) + 1 : 1}
      />
    </Card>
  )
}

