"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { GameElement, Sponsor } from "@/types/supabase"
import { useToast } from "@/hooks/use-toast"
import { HelpCircle, Loader2, ArrowLeft, Eye } from "lucide-react"

interface ElementBuilderProps {
  element?: GameElement | null
  onSave: (element: Partial<GameElement>) => Promise<boolean>
  onCancel: () => void
  elementTypes: string[]
  allSports: string[]
  isNew?: boolean
}

export function ElementBuilder({
  element,
  onSave,
  onCancel,
  elementTypes,
  allSports,
  isNew = false,
}: ElementBuilderProps) {
  const isEditing = !!element && !isNew
  const [name, setName] = useState(element?.name || "")
  const [description, setDescription] = useState(element?.description || "")
  const [type, setType] = useState(element?.type || elementTypes[0])
  const [scriptTemplate, setScriptTemplate] = useState(element?.script_template || "")
  const [isPermanentMarker, setIsPermanentMarker] = useState(
    element?.is_permanent_marker || type === "Permanent Marker",
  )
  const [defaultOffset, setDefaultOffset] = useState(element?.default_offset || "")
  const [lockOffset, setLockOffset] = useState(element?.lock_offset || false)
  const [selectedSports, setSelectedSports] = useState<string[]>(element?.supported_sports || [])
  const [sponsorId, setSponsorId] = useState<string | null>(element?.sponsor_id || null)
  const [sponsorName, setSponsorName] = useState<string>(element?.sponsor_name || "")
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [previewSport, setPreviewSport] = useState("Football")
  const [previewText, setPreviewText] = useState("")
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Valid placeholders that can be used in script templates
  const validPlaceholders = [
    { name: "{sport}", description: "The sport name (e.g., Football, Basketball)" },
    { name: "{teamName}", description: "The team name" },
    { name: "{venue}", description: "The venue or stadium name" },
    { name: "{sponsorName}", description: "The sponsor's name" },
    { name: "{date}", description: "The event date" },
    { name: "{time}", description: "The event time" },
    { name: "{score}", description: "The current score" },
    { name: "{player}", description: "Player name" },
    { name: "{custom}", description: "Any custom placeholder you define" },
  ]

  useEffect(() => {
    fetchSponsors()
    updatePreview()
  }, [])

  // Update preview when relevant fields change
  useEffect(() => {
    updatePreview()
  }, [scriptTemplate, previewSport, sponsorName])

  // Update isPermanentMarker when type changes
  useEffect(() => {
    if (type === "Permanent Marker") {
      setIsPermanentMarker(true)
    } else {
      setIsPermanentMarker(false)
    }
  }, [type])

  const fetchSponsors = async () => {
    try {
      // Check if sponsors table exists
      const { error: checkError } = await supabase.from("sponsors").select("id").limit(1)

      if (checkError && checkError.message.includes("does not exist")) {
        // Table doesn't exist, use sample sponsors
        setSponsors([
          { id: "1", name: "Coca-Cola", created_at: "", updated_at: "" },
          { id: "2", name: "Nike", created_at: "", updated_at: "" },
          { id: "3", name: "Gatorade", created_at: "", updated_at: "" },
          { id: "4", name: "State Farm", created_at: "", updated_at: "" },
          { id: "5", name: "Toyota", created_at: "", updated_at: "" },
        ])
      } else {
        // Table exists, fetch real sponsors
        const { data, error } = await supabase.from("sponsors").select("*").order("name")

        if (error) throw error
        setSponsors(data || [])
      }
    } catch (err) {
      console.error("Error fetching sponsors:", err)
    }
  }

  const updatePreview = () => {
    if (!scriptTemplate) {
      setPreviewText("")
      return
    }

    // Replace placeholders with sample values
    let preview = scriptTemplate
    preview = preview.replace(/\{sport\}/g, previewSport)
    preview = preview.replace(/\{teamName\}/g, `${previewSport} Team`)
    preview = preview.replace(/\{venue\}/g, "Main Stadium")
    preview = preview.replace(/\{sponsorName\}/g, sponsorName || "Sponsor")
    preview = preview.replace(/\{date\}/g, "January 1, 2023")
    preview = preview.replace(/\{time\}/g, "7:00 PM")
    preview = preview.replace(/\{score\}/g, "21-14")
    preview = preview.replace(/\{player\}/g, "John Smith")

    // Handle any remaining placeholders generically
    preview = preview.replace(/\{(\w+)\}/g, (match, placeholder) => `[${placeholder}]`)

    setPreviewText(preview)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Element name is required",
        variant: "destructive",
      })
      return
    }

    // Validate offset format if this is a permanent marker
    if (isPermanentMarker && defaultOffset) {
      const offsetRegex = /^[+-]?\d+[mhd]$/ // +/-number followed by m, h, or d
      if (!offsetRegex.test(defaultOffset)) {
        toast({
          title: "Error",
          description: "Offset must be in format: -90m, +2h, etc.",
          variant: "destructive",
        })
        return
      }
    }

    setSaving(true)
    try {
      // If user entered a sponsor name but didn't select from dropdown
      const finalSponsorId = sponsorId
      let finalSponsorName = sponsorName

      if (!sponsorId && sponsorName.trim()) {
        // Store the sponsor name in a local field for display
        finalSponsorName = sponsorName.trim()
      }

      const elementData: Partial<GameElement> = {
        name,
        description: description || null,
        type,
        script_template: scriptTemplate || null,
        supported_sports: selectedSports.length > 0 ? selectedSports : null,
        sponsor_id: finalSponsorId,
        sponsor_name: finalSponsorName || null,
        is_permanent_marker: isPermanentMarker,
        default_offset: isPermanentMarker ? defaultOffset || null : null,
        lock_offset: isPermanentMarker ? lockOffset : false,
      }

      console.log("Submitting element data:", elementData)
      const success = await onSave(elementData)
      if (success) {
        toast({
          title: "Success",
          description: `Element ${isEditing ? "updated" : "created"} successfully`,
        })
      }
    } catch (err) {
      console.error("Error in handleSave:", err)
      toast({
        title: "Error",
        description: `Failed to save element: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]))
  }

  const handleSponsorSelect = (id: string) => {
    if (id === "none") {
      setSponsorId(null)
      setSponsorName("")
    } else {
      const sponsor = sponsors.find((s) => s.id === id)
      if (sponsor) {
        setSponsorId(sponsor.id)
        setSponsorName(sponsor.name)
      }
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("scriptTemplate") as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newText = before + placeholder + after
      setScriptTemplate(newText)

      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = start + placeholder.length
        textarea.selectionEnd = start + placeholder.length
      }, 0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-[#2D2D2D]">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Library
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">{isEditing ? "Edit Element" : "Create New Element"}</h1>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Element Details</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the core details of your element</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Element Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Coca-Cola Halftime Promo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Element Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Element Types</SelectLabel>
                        {elementTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this element"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsor">Sponsor (Optional)</Label>
                <Select value={sponsorId || "none"} onValueChange={handleSponsorSelect}>
                  <SelectTrigger id="sponsor">
                    <SelectValue placeholder="Select sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sponsor</SelectItem>
                    <SelectGroup>
                      <SelectLabel>Sponsors</SelectLabel>
                      {sponsors.map((sponsor) => (
                        <SelectItem key={sponsor.id} value={sponsor.id}>
                          {sponsor.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {!sponsorId && (
                  <div className="mt-2">
                    <Label htmlFor="sponsorName">Or enter sponsor name</Label>
                    <Input
                      id="sponsorName"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="e.g., Coca-Cola"
                      className="mt-1"
                    />
                  </div>
                )}
                {(sponsorId || sponsorName) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Use {"{sponsorName}"} in your script template to automatically insert the sponsor name.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Script Template</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="w-80">
                      <div className="space-y-2">
                        <p className="font-medium">Available Placeholders:</p>
                        <ul className="space-y-1 text-sm">
                          {validPlaceholders.map((placeholder) => (
                            <li key={placeholder.name} className="flex justify-between">
                              <span className="font-mono">{placeholder.name}</span>
                              <span className="text-muted-foreground">{placeholder.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>
                Enter the script text with placeholders in {"{curly braces}"} that will be replaced with actual values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="scriptTemplate"
                value={scriptTemplate}
                onChange={(e) => setScriptTemplate(e.target.value)}
                placeholder="e.g., Hey {sport} fans! {sponsorName} is proud to present today's game at {venue}."
                rows={5}
              />

              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Insert placeholder:</span>
                {validPlaceholders.slice(0, 5).map((placeholder) => (
                  <Badge
                    key={placeholder.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => insertPlaceholder(placeholder.name)}
                  >
                    {placeholder.name}
                  </Badge>
                ))}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                        More...
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="w-60">
                      <div className="space-y-2">
                        <p className="font-medium">More Placeholders:</p>
                        <div className="flex flex-wrap gap-2">
                          {validPlaceholders.slice(5).map((placeholder) => (
                            <Badge
                              key={placeholder.name}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => insertPlaceholder(placeholder.name)}
                            >
                              {placeholder.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          {isPermanentMarker && (
            <Card>
              <CardHeader>
                <CardTitle>Permanent Marker Settings</CardTitle>
                <CardDescription>Configure how this permanent marker behaves in timelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultOffset">Default Offset</Label>
                    <Input
                      id="defaultOffset"
                      value={defaultOffset}
                      onChange={(e) => setDefaultOffset(e.target.value)}
                      placeholder="e.g., -90m, +15m, -2h"
                    />
                    <p className="text-sm text-muted-foreground">
                      Format: -90m (90 minutes before), +15m (15 minutes after), -2h (2 hours before)
                    </p>
                  </div>

                  <div className="flex items-start space-x-2 pt-8">
                    <Checkbox
                      id="lockOffset"
                      checked={lockOffset}
                      onCheckedChange={(checked) => setLockOffset(checked === true)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="lockOffset">Lock offset</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevent users from changing this offset in timelines
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Supported Sports</CardTitle>
              <CardDescription>Select which sports this element can be used with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allSports.map((sport) => (
                  <div key={sport} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sport-${sport}`}
                      checked={selectedSports.includes(sport)}
                      onCheckedChange={() => toggleSport(sport)}
                    />
                    <Label htmlFor={`sport-${sport}`}>{sport}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Element</CardTitle>
              <CardDescription>See how your element will appear with placeholders filled in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="previewSport">Preview for sport:</Label>
                <Select value={previewSport} onValueChange={setPreviewSport}>
                  <SelectTrigger id="previewSport" className="w-40">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSports.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={updatePreview} className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Refresh Preview
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Element Information:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {name || "Untitled Element"}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {type}
                  </div>
                  {sponsorName && (
                    <div>
                      <span className="font-medium">Sponsor:</span> {sponsorName}
                    </div>
                  )}
                  {isPermanentMarker && defaultOffset && (
                    <div>
                      <span className="font-medium">Default Offset:</span> {defaultOffset}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview:</h3>
                <div className="bg-gray-50 p-4 rounded-md border">
                  {previewText ? (
                    <p className="whitespace-pre-wrap">{previewText}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Enter a script template with placeholders to see a preview
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Placeholder Replacements:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">{"{sport}"}</span> → {previewSport}
                  </div>
                  <div>
                    <span className="font-medium">{"{teamName}"}</span> → {`${previewSport} Team`}
                  </div>
                  <div>
                    <span className="font-medium">{"{venue}"}</span> → Main Stadium
                  </div>
                  <div>
                    <span className="font-medium">{"{sponsorName}"}</span> → {sponsorName || "Sponsor"}
                  </div>
                  <div>
                    <span className="font-medium">{"{date}"}</span> → January 1, 2023
                  </div>
                  <div>
                    <span className="font-medium">{"{time}"}</span> → 7:00 PM
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            `${isEditing ? "Update" : "Create"} Element`
          )}
        </Button>
      </div>
    </div>
  )
}

