"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import type { GameElement, Sponsor } from "@/types/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

interface AddEditElementDialogProps {
  element: GameElement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onDelete: (id: string) => void
  elementTypes: string[]
  allSports: string[]
  onAddCustomType: (type: string) => boolean
}

export function AddEditElementDialog({
  element,
  open,
  onOpenChange,
  onSave,
  onDelete,
  elementTypes,
  allSports,
  onAddCustomType,
}: AddEditElementDialogProps) {
  const isEditing = !!element
  const [name, setName] = useState(element?.name || "")
  const [description, setDescription] = useState(element?.description || "")
  const [type, setType] = useState(element?.type || elementTypes[0])
  const [newType, setNewType] = useState("")
  const [isAddingType, setIsAddingType] = useState(false)
  const [scriptTemplate, setScriptTemplate] = useState(element?.script_template || "")
  const [isPermanentMarker, setIsPermanentMarker] = useState(element?.is_permanent_marker || false)
  const [defaultOffset, setDefaultOffset] = useState(element?.default_offset || "")
  const [selectedSports, setSelectedSports] = useState<string[]>(element?.supported_sports || [])
  const [sponsorId, setSponsorId] = useState<string | null>(element?.sponsor_id || null)
  const [sponsorName, setSponsorName] = useState<string>(element?.sponsor_name || "")
  const [isAddingSponsor, setIsAddingSponsor] = useState(false)
  const [newSponsorName, setNewSponsorName] = useState("")
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loadingSponsors, setLoadingSponsors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchSponsors()
    }
  }, [open])

  const fetchSponsors = async () => {
    setLoadingSponsors(true)
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
    } finally {
      setLoadingSponsors(false)
    }
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

    setSaving(true)
    try {
      // If user entered a sponsor name but didn't select from dropdown
      const finalSponsorId = sponsorId
      let finalSponsorName = sponsorName

      if (!sponsorId && sponsorName.trim()) {
        // Store the sponsor name in a local field for display
        finalSponsorName = sponsorName.trim()
      }

      const elementData = {
        name,
        description: description || null,
        type,
        script_template: scriptTemplate || null,
        supported_sports: selectedSports.length > 0 ? selectedSports : null,
        sponsor_id: finalSponsorId,
        sponsor_name: finalSponsorName || null,
        is_permanent_marker: isPermanentMarker,
        default_offset: isPermanentMarker ? defaultOffset || null : null,
        updated_at: new Date().toISOString(),
      }

      let error
      if (isEditing && element) {
        const { error: updateError } = await supabase.from("game_elements").update(elementData).eq("id", element.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("game_elements").insert([elementData])
        error = insertError
      }

      if (error) {
        toast({
          title: "Error",
          description: `Failed to save element: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `Element ${isEditing ? "updated" : "created"} successfully`,
      })
      onSave()
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to save element: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditing || !element) return

    if (!confirm("Are you sure you want to delete this element?")) {
      return
    }

    setDeleting(true)
    try {
      onDelete(element.id)
      onOpenChange(false)
    } finally {
      setDeleting(false)
    }
  }

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]))
  }

  const handleAddCustomType = () => {
    if (!newType.trim()) {
      toast({
        title: "Error",
        description: "Type name cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (elementTypes.includes(newType.trim())) {
      toast({
        title: "Error",
        description: "This type already exists",
        variant: "destructive",
      })
      return
    }

    const success = onAddCustomType(newType.trim())
    if (success) {
      setType(newType.trim())
      setNewType("")
      setIsAddingType(false)
      toast({
        title: "Success",
        description: `Added new type: ${newType.trim()}`,
      })
    }
  }

  const handleAddSponsor = async () => {
    if (!newSponsorName.trim()) {
      toast({
        title: "Error",
        description: "Sponsor name cannot be empty",
        variant: "destructive",
      })
      return
    }

    // For now, just set the sponsor name without creating a new sponsor in the database
    setSponsorName(newSponsorName.trim())
    setSponsorId(null) // Clear any selected sponsor ID
    setNewSponsorName("")
    setIsAddingSponsor(false)

    toast({
      title: "Success",
      description: `Sponsor set to: ${newSponsorName.trim()}`,
    })
  }

  const handleSponsorSelect = (id: string) => {
    if (id === "none") {
      setSponsorId(null)
      setSponsorName("")
    } else if (id === "add") {
      setIsAddingSponsor(true)
    } else {
      const sponsor = sponsors.find((s) => s.id === id)
      if (sponsor) {
        setSponsorId(sponsor.id)
        setSponsorName(sponsor.name)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Element" : "Add New Element"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this element." : "Create a new reusable element for your game scripts."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Halftime Announcement"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <div className="col-span-3 flex gap-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
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
                  <SelectItem value="custom">+ Add Custom Type</SelectItem>
                </SelectContent>
              </Select>
              <Popover open={isAddingType || type === "custom"} onOpenChange={setIsAddingType}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setIsAddingType(true)} title="Add Custom Type">
                    <Plus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Add Custom Type</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a new element type that will be available for all elements.
                      </p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newType" className="text-right">
                        Type Name
                      </Label>
                      <Input
                        id="newType"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Special Announcement"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleAddCustomType} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                        Add Type
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sponsor" className="text-right">
              Sponsor
            </Label>
            <div className="col-span-3 flex gap-2">
              <Select value={sponsorId || (sponsorName ? "custom" : "none")} onValueChange={handleSponsorSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sponsor (optional)" />
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
                  <SelectItem value="add">+ Add Custom Sponsor</SelectItem>
                </SelectContent>
              </Select>
              <Popover open={isAddingSponsor} onOpenChange={setIsAddingSponsor}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddingSponsor(true)}
                    title="Add Custom Sponsor"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Add Custom Sponsor</h4>
                      <p className="text-sm text-muted-foreground">Enter a sponsor name for this element.</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newSponsorName" className="text-right">
                        Sponsor Name
                      </Label>
                      <Input
                        id="newSponsorName"
                        value={newSponsorName}
                        onChange={(e) => setNewSponsorName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Acme Corporation"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleAddSponsor} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                        Add Sponsor
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Show the current sponsor name if it's a custom one */}
          {!sponsorId && sponsorName && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1"></div>
              <div className="col-span-3 text-sm text-muted-foreground">Current sponsor: {sponsorName}</div>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Brief description of this element"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="scriptTemplate" className="text-right pt-2">
              Script Template
            </Label>
            <Textarea
              id="scriptTemplate"
              value={scriptTemplate}
              onChange={(e) => setScriptTemplate(e.target.value)}
              className="col-span-3"
              placeholder="Script text with placeholders like {sport}, {teamName}, etc."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Permanent Marker</Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="isPermanentMarker"
                checked={isPermanentMarker}
                onCheckedChange={(checked) => setIsPermanentMarker(checked === true)}
              />
              <Label htmlFor="isPermanentMarker">This is a permanent marker (e.g., Halftime, Gate Open)</Label>
            </div>
          </div>

          {isPermanentMarker && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defaultOffset" className="text-right">
                Default Offset
              </Label>
              <Input
                id="defaultOffset"
                value={defaultOffset}
                onChange={(e) => setDefaultOffset(e.target.value)}
                className="col-span-3"
                placeholder="e.g., -90m, 0m, 15m"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Supported Sports</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
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
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {isEditing && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleting || saving}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          )}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || deleting}
              className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

