"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ElementType, Sport } from "@/types/database"

interface AddEditElementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  element: ElementType | null
  sports: Sport[]
  onSave: (element?: ElementType) => void
}

export function AddEditElementDialog({ open, onOpenChange, element, sports, onSave }: AddEditElementDialogProps) {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [scriptTemplate, setScriptTemplate] = useState("")
  const [isPermanent, setIsPermanent] = useState(false)
  const [defaultOffset, setDefaultOffset] = useState("")
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [previewText, setPreviewText] = useState("")
  const [placeholders, setPlaceholders] = useState<string[]>([])

  // Element types - could be fetched from the database if needed
  const elementTypes = ["Permanent Marker", "Sponsor Read", "Promotion", "Generic Event", "Timeout", "Commercial Break"]

  // Initialize form with element data if editing
  useEffect(() => {
    if (element) {
      setName(element.name || "")
      setType(element.type || "")
      setScriptTemplate(element.script_template || "")
      setIsPermanent(element.is_permanent || false)
      setDefaultOffset(element.default_offset || "")
      setSelectedSports(Array.isArray(element.supported_sports) ? element.supported_sports : [])
    } else {
      // Reset form for new element
      setName("")
      setType("Generic Event")
      setScriptTemplate("")
      setIsPermanent(false)
      setDefaultOffset("")
      setSelectedSports([])
    }

    // Reset active tab
    setActiveTab("basic")
  }, [element, open])

  // Extract placeholders from script template
  useEffect(() => {
    if (!scriptTemplate) {
      setPlaceholders([])
      setPreviewText("")
      return
    }

    const placeholderRegex = /{([^}]+)}/g
    const matches = [...scriptTemplate.matchAll(placeholderRegex)]
    const extractedPlaceholders = matches.map((match) => match[1])

    setPlaceholders([...new Set(extractedPlaceholders)])

    // Update preview text
    let preview = scriptTemplate
    extractedPlaceholders.forEach((placeholder) => {
      const regex = new RegExp(`{${placeholder}}`, "g")
      preview = preview.replace(regex, `<span class="text-[#4A6FA5] font-medium">{${placeholder}}</span>`)
    })

    setPreviewText(preview)
  }, [scriptTemplate])

  const handleSave = async () => {
    setLoading(true)

    try {
      const elementData = {
        name,
        type,
        script_template: scriptTemplate,
        is_permanent: isPermanent,
        default_offset: isPermanent ? defaultOffset : null,
        supported_sports: selectedSports,
      }

      let savedElement

      if (element) {
        // Update existing element
        const { data, error } = await supabase
          .from("elements")
          .update(elementData)
          .eq("id", element.id)
          .select()
          .single()

        if (error) throw error
        savedElement = data
      } else {
        // Insert new element
        const { data, error } = await supabase.from("elements").insert(elementData).select().single()

        if (error) throw error
        savedElement = data
      }

      onSave(savedElement)
    } catch (error) {
      console.error("Error saving element:", error)
      alert("Failed to save element")
    } finally {
      setLoading(false)
    }
  }

  const toggleSport = (sportName: string) => {
    setSelectedSports((prev) => (prev.includes(sportName) ? prev.filter((s) => s !== sportName) : [...prev, sportName]))
  }

  const selectAllSports = () => {
    setSelectedSports(sports.map((sport) => sport.name))
  }

  const clearAllSports = () => {
    setSelectedSports([])
  }

  // Insert a placeholder into the script template
  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("scriptTemplate") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end)

    const newText = `${before}{${placeholder}}${after}`
    setScriptTemplate(newText)

    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + placeholder.length + 2, start + placeholder.length + 2)
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-[#C4C4C4]">
        <DialogHeader>
          <DialogTitle className="text-[#2D2D2D] text-xl font-bold">
            {element ? "Edit Element" : "Add New Element"}
          </DialogTitle>
          <DialogDescription className="text-[#2D2D2D] opacity-70">
            {element ? "Update the details for this element." : "Create a new reusable element for your show flows."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic" className="data-[state=active]:bg-[#4A6FA5] data-[state=active]:text-white">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="script" className="data-[state=active]:bg-[#4A6FA5] data-[state=active]:text-white">
              Script Template
            </TabsTrigger>
            <TabsTrigger value="sports" className="data-[state=active]:bg-[#4A6FA5] data-[state=active]:text-white">
              Sports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-[#2D2D2D]">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 border-[#C4C4C4]"
                placeholder="e.g., Halftime Announcement"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right text-[#2D2D2D]">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="col-span-3 border-[#C4C4C4]">
                  <SelectValue placeholder="Select element type" />
                </SelectTrigger>
                <SelectContent>
                  {elementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label className="text-[#2D2D2D]">Permanent Marker</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="isPermanent"
                  checked={isPermanent}
                  onCheckedChange={(checked) => setIsPermanent(checked as boolean)}
                  className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5] data-[state=checked]:border-[#4A6FA5]"
                />
                <label
                  htmlFor="isPermanent"
                  className="text-sm font-medium leading-none text-[#2D2D2D] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  This is a permanent marker in the show flow (e.g., Game Start, Halftime)
                </label>
              </div>
            </div>

            {isPermanent && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="defaultOffset" className="text-right text-[#2D2D2D]">
                  Default Offset
                </Label>
                <Input
                  id="defaultOffset"
                  value={defaultOffset}
                  onChange={(e) => setDefaultOffset(e.target.value)}
                  className="col-span-3 border-[#C4C4C4]"
                  placeholder="e.g., -30m, +15m, 0m"
                />
                <div className="col-start-2 col-span-3 text-xs text-[#2D2D2D] opacity-70">
                  Time offset from game start, e.g., -30m (30 minutes before), +15m (15 minutes after)
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scriptTemplate" className="text-[#2D2D2D]">
                  Script Template
                </Label>
                <Textarea
                  id="scriptTemplate"
                  value={scriptTemplate}
                  onChange={(e) => setScriptTemplate(e.target.value)}
                  className="border-[#C4C4C4] min-h-[120px]"
                  placeholder="e.g., Welcome to {venue} for today's {sportName} game between {homeTeam} and {awayTeam}!"
                />
                <div className="text-xs text-[#2D2D2D] opacity-70">
                  Use curly braces for placeholders, e.g., {"{teamName}"}, {"{venue}"}, {"{timeUntilStart}"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#2D2D2D]">Common Placeholders</Label>
                <div className="flex flex-wrap gap-2">
                  {["sportName", "teamName", "homeTeam", "awayTeam", "venue", "timeUntilStart", "score", "sponsor"].map(
                    (placeholder) => (
                      <Button
                        key={placeholder}
                        variant="outline"
                        size="sm"
                        onClick={() => insertPlaceholder(placeholder)}
                        className="border-[#4A6FA5] text-[#4A6FA5]"
                      >
                        {placeholder}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              {placeholders.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[#2D2D2D]">Detected Placeholders</Label>
                  <div className="flex flex-wrap gap-2">
                    {placeholders.map((placeholder) => (
                      <div
                        key={placeholder}
                        className="bg-[#4A6FA5] bg-opacity-10 text-[#4A6FA5] px-2 py-1 rounded-md text-sm"
                      >
                        {placeholder}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[#2D2D2D]">Preview</Label>
                <div
                  className="p-4 bg-[#F5F5F5] rounded-md border border-[#C4C4C4]"
                  dangerouslySetInnerHTML={{ __html: previewText }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sports" className="space-y-4">
            <div className="flex justify-between mb-2">
              <Label className="text-[#2D2D2D] font-medium">Supported Sports</Label>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllSports}
                  className="text-[#4A6FA5] border-[#4A6FA5]"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllSports}
                  className="text-[#D9534F] border-[#D9534F]"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 border border-[#C4C4C4] rounded-md">
              {sports.map((sport) => (
                <div key={sport.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport.id}`}
                    checked={selectedSports.includes(sport.name)}
                    onCheckedChange={() => toggleSport(sport.name)}
                    className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5] data-[state=checked]:border-[#4A6FA5]"
                  />
                  <label htmlFor={`sport-${sport.id}`} className="text-sm font-medium leading-none text-[#2D2D2D]">
                    {sport.name}
                  </label>
                </div>
              ))}
            </div>

            <div className="text-xs text-[#2D2D2D] opacity-70">
              Select all sports that this element can be used with. This helps filter elements when creating show flows
              for specific sports.
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-[#D9534F]">{!name && "Name is required"}</div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="border-[#C4C4C4] text-[#2D2D2D]">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={loading || !name}
              className="bg-[#4A6FA5] hover:bg-[#3A5A8A] text-white"
            >
              {loading ? "Saving..." : element ? "Save Changes" : "Create Element"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

