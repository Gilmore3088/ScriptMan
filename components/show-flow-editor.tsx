"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronDown,
  Edit,
  Paperclip,
  Search,
  Filter,
  SlidersHorizontal,
  FileUp,
  Loader2,
  Plus,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  getShowFlowItems,
  createShowFlowItem,
  updateShowFlowItem,
  uploadAsset,
  linkAssetToShowFlow,
  linkElementToShowFlow,
} from "@/lib/db"
import type { ShowFlowItem, Element } from "@/lib/types"
import { AddShowFlowItemDialog } from "./add-show-flow-item-dialog"
import { ElementPicker } from "./element-picker"

interface ShowFlowEditorProps {
  gameId: string
  onComponentClick: (componentName: string) => void
}

interface Component {
  id: string
  name: string
  type: string
  version: number
  isGlobal: boolean
  description: string
  content: string
  createdAt: string
  updatedAt: string
}

export function ShowFlowEditor({ gameId, onComponentClick }: ShowFlowEditorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<ShowFlowItem | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [fileUploadOpen, setFileUploadOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [items, setItems] = useState<ShowFlowItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [componentLibraryOpen, setComponentLibraryOpen] = useState(false)
  const [components, setComponents] = useState<Component[]>([])

  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showElementPicker, setShowElementPicker] = useState(false)

  const [visibleColumns, setVisibleColumns] = useState({
    itemNumber: true,
    startTime: true,
    duration: true,
    clockRef: true,
    location: true,
    audioNotes: true,
    scriptRead: true,
    boardLook: true,
    category: true,
    // Additional columns that are hidden by default
    presetTime: false,
    privateNotes: false,
    main: false,
    aux: false,
    lowerThird: false,
    ribbon: false,
    controlRoom: false,
  })

  // Fetch show flow items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching show flow items for gameId:", gameId)

        let data
        try {
          data = await getShowFlowItems(gameId)
          console.log("Retrieved show flow items:", data)
        } catch (error) {
          console.error("Error in getShowFlowItems:", error)

          // Try to get items from localStorage as fallback
          const storedItems = JSON.parse(localStorage.getItem("showFlowItems") || "[]")
          data = storedItems.filter((item: ShowFlowItem) => item.gameId === gameId)
          console.log("Retrieved show flow items from localStorage:", data)
        }

        setItems(data)
      } catch (error) {
        console.error("Error fetching show flow items:", error)
        toast({
          title: "Error",
          description: "Failed to load show flow items",
          variant: "destructive",
        })
        // Set empty array to prevent undefined errors
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [gameId])

  // Add this useEffect to fetch components
  useEffect(() => {
    const fetchComponents = async () => {
      // In a real implementation, this would fetch from your database
      // For now, we'll use mock data
      const mockComponents = [
        {
          id: "comp-1",
          name: "Coca-Cola Sponsor Read",
          type: "Sponsor",
          version: 1,
          isGlobal: true,
          description: "Standard Coca-Cola sponsor read for all games",
          content: "Coca-Cola, the official sponsor of refreshment. Enjoy an ice-cold Coca-Cola today!",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "comp-2",
          name: "Halftime Show Intro",
          type: "Script",
          version: 1,
          isGlobal: true,
          description: "Standard introduction for the halftime show",
          content: "Ladies and gentlemen, please welcome our halftime entertainment!",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setComponents(mockComponents)
    }

    fetchComponents()
  }, [])

  // Filter items based on search term
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      item.scriptRead.toLowerCase().includes(searchLower) ||
      (item.location && item.location.toLowerCase().includes(searchLower)) ||
      (item.audioNotes && item.audioNotes.toLowerCase().includes(searchLower)) ||
      (item.boardLook && item.boardLook.toLowerCase().includes(searchLower)) ||
      item.category.toLowerCase().includes(searchLower)
    )
  })

  // Get unique categories for filtering
  const categories = [...new Set(items.map((item) => item.category))]

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev],
    }))
  }

  // Handle cell click for inline editing
  const handleCellClick = (item: ShowFlowItem, field: string) => {
    setEditingCell({ id: item.id, field })
    // Focus the input after a short delay to allow the component to render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 10)
  }

  // Handle cell edit save
  const handleCellSave = async () => {
    if (!editingCell) return

    try {
      setIsSaving(true)
      const itemToUpdate = items.find((item) => item.id === editingCell.id)

      if (itemToUpdate) {
        const updatedItem = await updateShowFlowItem(itemToUpdate.id, itemToUpdate)

        // Update the items array with the updated item
        setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))

        toast({
          title: "Success",
          description: "Item updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setEditingCell(null)
    }
  }

  // Handle input change for inline editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    if (!editingCell) return

    const updatedItems = items.map((item) => {
      if (item.id === editingCell.id) {
        return {
          ...item,
          [field]: e.target.value,
        }
      }
      return item
    })

    setItems(updatedItems)
  }

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedItemId) return

    try {
      setIsSaving(true)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${gameId}/${selectedItemId}/${file.name}`

        // Upload file to Supabase Storage
        const asset = await uploadAsset(file, path)

        // Link asset to show flow item
        await linkAssetToShowFlow(selectedItemId, asset.id)
      }

      toast({
        title: "Success",
        description: `Uploaded ${files.length} file(s)`,
      })

      setFileUploadOpen(false)
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Add this function to handle component selection
  const handleComponentSelect = async (component: Component) => {
    try {
      setIsSaving(true)

      // Find the highest item number to add the new item at the end
      const highestItemNumber = items.length > 0 ? Math.max(...items.map((item) => item.itemNumber)) : 0

      const newItem: Omit<ShowFlowItem, "id" | "createdAt" | "updatedAt"> = {
        gameId,
        itemNumber: highestItemNumber + 1,
        startTime: "",
        scriptRead: component.content || component.name,
        boardLook: component.name,
        category: "SPONSOR",
      }

      const createdItem = await createShowFlowItem(newItem)
      setItems([...items, createdItem])
      setComponentLibraryOpen(false)

      toast({
        title: "Success",
        description: `Added component: ${component.name}`,
      })
    } catch (error) {
      console.error("Error adding component:", error)
      toast({
        title: "Error",
        description: "Failed to add component",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle element selection from the Element Library
  const handleElementSelect = async (element: Element) => {
    try {
      setIsSaving(true)

      // Find the highest item number to add the new item at the end
      const highestItemNumber = items.length > 0 ? Math.max(...items.map((item) => item.itemNumber)) : 0

      const newItem: Omit<ShowFlowItem, "id" | "createdAt" | "updatedAt"> = {
        gameId,
        itemNumber: highestItemNumber + 1,
        startTime: "",
        scriptRead: element.content || element.name,
        boardLook: element.type === "media_asset" ? element.name : undefined,
        category: element.tags[0] || "PREGAME",
        elementId: element.id,
      }

      const createdItem = await createShowFlowItem(newItem)

      // Link the element to the show flow item
      await linkElementToShowFlow(createdItem.id, element.id)

      setItems([...items, createdItem])

      toast({
        title: "Success",
        description: `Added element: ${element.name}`,
      })
    } catch (error) {
      console.error("Error adding element to show flow:", error)
      toast({
        title: "Error",
        description: "Failed to add element to show flow",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Add a new show flow item
  const addNewItem = () => {
    console.log("addNewItem function called")
    // Simply open the dialog
    setShowAddItemDialog(true)
  }

  // Handle new item added from dialog
  const handleItemAdded = (newItem: ShowFlowItem) => {
    console.log("New item added:", newItem)
    setItems((prevItems) => [...prevItems, newItem])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading show flow...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search script..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px] sm:w-[300px]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="p-2 font-medium">Categories</div>
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={true} // In a real app, this would be controlled by state
                  onCheckedChange={() => {}} // In a real app, this would filter by category
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="p-2 font-medium">Show/Hide Columns</div>
              {Object.entries(visibleColumns).map(([column, isVisible]) => (
                <DropdownMenuCheckboxItem key={column} checked={isVisible} onCheckedChange={() => toggleColumn(column)}>
                  {column.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              console.log("Add Item button clicked")
              // Open the dialog directly
              setShowAddItemDialog(true)
            }}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Add Item</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowElementPicker(true)}
            disabled={isSaving}
          >
            <FileText className="h-4 w-4" />
            <span>Add from Library</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setComponentLibraryOpen(true)}
            disabled={isSaving}
          >
            <Paperclip className="h-4 w-4" />
            <span>Add Component</span>
          </Button>
          <span className="text-sm text-muted-foreground">{filteredItems.length} items</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              {visibleColumns.itemNumber && <TableHead className="w-[60px]">#</TableHead>}
              {visibleColumns.startTime && <TableHead className="w-[100px]">Start Time</TableHead>}
              {visibleColumns.presetTime && <TableHead className="w-[100px]">Preset</TableHead>}
              {visibleColumns.duration && <TableHead className="w-[80px]">Duration</TableHead>}
              {visibleColumns.clockRef && <TableHead className="w-[100px]">Clock Ref</TableHead>}
              {visibleColumns.location && <TableHead className="w-[120px]">Location</TableHead>}
              {visibleColumns.audioNotes && <TableHead className="w-[120px]">Audio</TableHead>}
              {visibleColumns.scriptRead && <TableHead>Script Read</TableHead>}
              {visibleColumns.boardLook && (
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-1">
                    Board Look
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" title="Sort by Board Look">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableHead>
              )}
              {visibleColumns.main && <TableHead>Main</TableHead>}
              {visibleColumns.aux && <TableHead>Aux</TableHead>}
              {visibleColumns.lowerThird && <TableHead>Lower Third</TableHead>}
              {visibleColumns.ribbon && <TableHead>Ribbon</TableHead>}
              {visibleColumns.controlRoom && <TableHead>Control Room</TableHead>}
              {visibleColumns.privateNotes && <TableHead>Private Notes</TableHead>}
              {visibleColumns.category && (
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-1">
                    Category
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" title="Sort by Category">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableHead>
              )}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="group">
                {visibleColumns.itemNumber && (
                  <TableCell onClick={() => handleCellClick(item, "itemNumber")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "itemNumber" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.itemNumber}
                          onChange={(e) => handleInputChange(e, "itemNumber")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.itemNumber
                    )}
                  </TableCell>
                )}
                {visibleColumns.startTime && (
                  <TableCell onClick={() => handleCellClick(item, "startTime")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "startTime" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.startTime}
                          onChange={(e) => handleInputChange(e, "startTime")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.startTime
                    )}
                  </TableCell>
                )}
                {visibleColumns.presetTime && (
                  <TableCell onClick={() => handleCellClick(item, "presetTime")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "presetTime" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.presetTime || ""}
                          onChange={(e) => handleInputChange(e, "presetTime")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.presetTime
                    )}
                  </TableCell>
                )}
                {visibleColumns.duration && (
                  <TableCell onClick={() => handleCellClick(item, "duration")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "duration" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.duration || ""}
                          onChange={(e) => handleInputChange(e, "duration")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.duration
                    )}
                  </TableCell>
                )}
                {visibleColumns.clockRef && (
                  <TableCell onClick={() => handleCellClick(item, "clockRef")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "clockRef" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.clockRef || ""}
                          onChange={(e) => handleInputChange(e, "clockRef")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.clockRef
                    )}
                  </TableCell>
                )}
                {visibleColumns.location && (
                  <TableCell onClick={() => handleCellClick(item, "location")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "location" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.location || ""}
                          onChange={(e) => handleInputChange(e, "location")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.location
                    )}
                  </TableCell>
                )}
                {visibleColumns.audioNotes && (
                  <TableCell onClick={() => handleCellClick(item, "audioNotes")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "audioNotes" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.audioNotes || ""}
                          onChange={(e) => handleInputChange(e, "audioNotes")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.audioNotes
                    )}
                  </TableCell>
                )}
                {visibleColumns.scriptRead && (
                  <TableCell onClick={() => handleCellClick(item, "scriptRead")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "scriptRead" ? (
                      <div className="flex">
                        <Textarea
                          ref={inputRef as any}
                          value={item.scriptRead}
                          onChange={(e) => handleInputChange(e, "scriptRead")}
                          className="min-h-[60px]"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleCellSave()}
                        />
                      </div>
                    ) : (
                      <div className="max-w-md truncate" title={item.scriptRead}>
                        {item.scriptRead}
                      </div>
                    )}
                  </TableCell>
                )}
                {visibleColumns.boardLook && (
                  <TableCell>
                    {editingCell?.id === item.id && editingCell?.field === "boardLook" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.boardLook || ""}
                          onChange={(e) => handleInputChange(e, "boardLook")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : item.boardLook ? (
                      <div
                        className="cursor-pointer hover:underline flex items-center gap-1"
                        onClick={() => onComponentClick(item.boardLook!)}
                      >
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        {item.boardLook}
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer text-muted-foreground"
                        onClick={() => handleCellClick(item, "boardLook")}
                      >
                        Click to add
                      </div>
                    )}
                  </TableCell>
                )}
                {visibleColumns.main && (
                  <TableCell onClick={() => handleCellClick(item, "main")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "main" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.main || ""}
                          onChange={(e) => handleInputChange(e, "main")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.main
                    )}
                  </TableCell>
                )}
                {visibleColumns.aux && (
                  <TableCell onClick={() => handleCellClick(item, "aux")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "aux" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.aux || ""}
                          onChange={(e) => handleInputChange(e, "aux")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.aux
                    )}
                  </TableCell>
                )}
                {visibleColumns.lowerThird && (
                  <TableCell onClick={() => handleCellClick(item, "lowerThird")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "lowerThird" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.lowerThird || ""}
                          onChange={(e) => handleInputChange(e, "lowerThird")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.lowerThird
                    )}
                  </TableCell>
                )}
                {visibleColumns.ribbon && (
                  <TableCell onClick={() => handleCellClick(item, "ribbon")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "ribbon" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.ribbon || ""}
                          onChange={(e) => handleInputChange(e, "ribbon")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.ribbon
                    )}
                  </TableCell>
                )}
                {visibleColumns.controlRoom && (
                  <TableCell onClick={() => handleCellClick(item, "controlRoom")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "controlRoom" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.controlRoom || ""}
                          onChange={(e) => handleInputChange(e, "controlRoom")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      item.controlRoom
                    )}
                  </TableCell>
                )}
                {visibleColumns.privateNotes && (
                  <TableCell onClick={() => handleCellClick(item, "privateNotes")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "privateNotes" ? (
                      <div className="flex">
                        <Textarea
                          ref={inputRef as any}
                          value={item.privateNotes || ""}
                          onChange={(e) => handleInputChange(e, "privateNotes")}
                          className="min-h-[60px]"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleCellSave()}
                        />
                      </div>
                    ) : (
                      <div className="max-w-md truncate" title={item.privateNotes}>
                        {item.privateNotes}
                      </div>
                    )}
                  </TableCell>
                )}
                {visibleColumns.category && (
                  <TableCell onClick={() => handleCellClick(item, "category")} className="cursor-pointer">
                    {editingCell?.id === item.id && editingCell?.field === "category" ? (
                      <div className="flex">
                        <Input
                          ref={inputRef}
                          value={item.category}
                          onChange={(e) => handleInputChange(e, "category")}
                          className="h-7 py-1"
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                        />
                      </div>
                    ) : (
                      <Badge variant="outline" className="font-normal">
                        {item.category}
                      </Badge>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setFileUploadOpen(true)
                      }}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* File Upload Dialog */}
      <Dialog open={fileUploadOpen} onOpenChange={setFileUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
              onClick={handleFileUpload}
            >
              <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">
                Support for images, videos, PDFs, and other files up to 2GB
              </p>
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelected} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFileUploadOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Component Library Dialog */}
      <Dialog open={componentLibraryOpen} onOpenChange={setComponentLibraryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Component Library</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {components.map((component) => (
                <div
                  key={component.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleComponentSelect(component)}
                >
                  <h3 className="font-medium">{component.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{component.type}</span>
                    {component.isGlobal && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Global</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{component.description}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComponentLibraryOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Show Flow Item Dialog */}
      <AddShowFlowItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        gameId={gameId}
        onItemAdded={handleItemAdded}
      />

      {/* Element Picker Dialog */}
      <ElementPicker
        open={showElementPicker}
        onOpenChange={setShowElementPicker}
        onElementSelect={handleElementSelect}
      />
    </div>
  )
}

