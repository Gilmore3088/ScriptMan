"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { getSupabaseClient } from "@/utils/supabase-singleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Clock, Bookmark, Megaphone, Music, Video, Tag } from "lucide-react"

export function AddTimelineEventDialog({ isOpen, onClose, onSave, startTime, event, gameId }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("30")
  const [eventType, setEventType] = useState("sponsor_read")
  const [isPermanent, setIsPermanent] = useState(false)
  const [elementId, setElementId] = useState("")
  const [elements, setElements] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [selectedSponsor, setSelectedSponsor] = useState("")
  const [customAssets, setCustomAssets] = useState({
    boardLook: false,
    mainCamera: false,
    auxCamera: false,
    lowerThird: false,
    ribbon: false,
    controlRoom: false,
  })
  const [loading, setLoading] = useState(false)

  const supabase = getSupabaseClient()

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      if (event) {
        // Editing existing event
        setTitle(event.title || "")
        setDescription(event.description || event.notes || "")
        setDuration(event.duration?.toString() || "30")
        setEventType(event.type || "sponsor_read")
        setIsPermanent(event.is_permanent || false)
        setElementId(event.element_id || "")
        setSelectedSponsor(event.sponsor_id || "")

        // Parse custom assets if available
        if (event.custom_assets) {
          try {
            const assets =
              typeof event.custom_assets === "string" ? JSON.parse(event.custom_assets) : event.custom_assets

            setCustomAssets({
              boardLook: assets.boardLook || false,
              mainCamera: assets.mainCamera || false,
              auxCamera: assets.auxCamera || false,
              lowerThird: assets.lowerThird || false,
              ribbon: assets.ribbon || false,
              controlRoom: assets.controlRoom || false,
            })
          } catch (e) {
            console.error("Error parsing custom assets:", e)
            // Reset to defaults if parsing fails
            setCustomAssets({
              boardLook: false,
              mainCamera: false,
              auxCamera: false,
              lowerThird: false,
              ribbon: false,
              controlRoom: false,
            })
          }
        }
      } else {
        // Creating new event
        setTitle("")
        setDescription("")
        setDuration("30")
        setEventType(event?.type || "sponsor_read")
        setIsPermanent(event?.is_permanent || false)
        setElementId("")
        setSelectedSponsor("")
        setCustomAssets({
          boardLook: false,
          mainCamera: false,
          auxCamera: false,
          lowerThird: false,
          ribbon: false,
          controlRoom: false,
        })
      }

      // Load elements and sponsors
      fetchElements()
      fetchSponsors()
    }
  }, [isOpen, event])

  const fetchElements = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("elements").select("*")

      if (error) {
        console.error("Error fetching elements:", error)
        return
      }

      setElements(data || [])
    } catch (err) {
      console.error("Exception fetching elements:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("sponsors").select("*")

      if (error) {
        console.error("Error fetching sponsors:", error)
        return
      }

      setSponsors(data || [])
    } catch (err) {
      console.error("Exception fetching sponsors:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    // Validate form
    if (!title.trim()) {
      alert("Please enter a title for the event")
      return
    }

    // Prepare custom assets for saving
    const customAssetsJson = JSON.stringify(customAssets)

    // Create event data object
    const eventData = {
      title,
      description,
      duration: Number.parseInt(duration),
      type: eventType,
      is_permanent: isPermanent,
      element_id: elementId || null,
      sponsor_id: selectedSponsor || null,
      custom_assets: customAssetsJson,
    }

    // Call the onSave callback with the event data
    onSave(eventData)
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "sponsor_read":
        return <Tag className="h-4 w-4 mr-2" />
      case "permanent_marker":
        return <Bookmark className="h-4 w-4 mr-2" />
      case "promo":
        return <Megaphone className="h-4 w-4 mr-2" />
      case "music":
        return <Music className="h-4 w-4 mr-2" />
      case "video":
        return <Video className="h-4 w-4 mr-2" />
      default:
        return <Clock className="h-4 w-4 mr-2" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="assets">Custom Assets</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-time">Start Time</Label>
                <Input id="event-time" value={startTime ? format(startTime, "h:mm:ss a") : ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-duration">Duration (seconds)</Label>
                <Input
                  id="event-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsor_read">{getEventTypeIcon("sponsor_read")} Sponsor Read</SelectItem>
                  <SelectItem value="permanent_marker">
                    {getEventTypeIcon("permanent_marker")} Permanent Marker
                  </SelectItem>
                  <SelectItem value="promo">{getEventTypeIcon("promo")} Promotional Segment</SelectItem>
                  <SelectItem value="music">{getEventTypeIcon("music")} Music Cue</SelectItem>
                  <SelectItem value="video">{getEventTypeIcon("video")} Video Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description or notes"
                rows={3}
              />
            </div>

            {eventType === "sponsor_read" && (
              <div className="space-y-2">
                <Label htmlFor="sponsor-select">Sponsor</Label>
                <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
                  <SelectTrigger id="sponsor-select">
                    <SelectValue placeholder="Select a sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(eventType === "sponsor_read" || eventType === "promo") && (
              <div className="space-y-2">
                <Label htmlFor="element-select">Element Template</Label>
                <Select value={elementId} onValueChange={setElementId}>
                  <SelectTrigger id="element-select">
                    <SelectValue placeholder="Select an element template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {elements.map((element) => (
                      <SelectItem key={element.id} value={element.id}>
                        {element.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="board-look"
                  checked={customAssets.boardLook}
                  onCheckedChange={(checked) => setCustomAssets({ ...customAssets, boardLook: checked })}
                />
                <Label htmlFor="board-look">Board Look</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="main-camera"
                  checked={customAssets.mainCamera}
                  onCheckedChange={(checked) => setCustomAssets({ ...customAssets, mainCamera: checked })}
                />
                <Label htmlFor="main-camera">Main Camera</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aux-camera"
                  checked={customAssets.auxCamera}
                  onCheckedChange={(checked) => setCustomAssets({ ...customAssets, auxCamera: checked })}
                />
                <Label htmlFor="aux-camera">AUX Camera</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="lower-third"
                  checked={customAssets.lowerThird}
                  onCheckedChange={(checked) => setCustomAssets({ ...customAssets, lowerThird: checked })}
                />
                <Label htmlFor="lower-third">Lower Third</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ribbon"
                  checked={customAssets.ribbon}
                  onCheckedChange={(checked) => setCustomAssets({ ...customAssets, ribbon: checked })}
                />
                <Label htmlFor="ribbon">Ribbon</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="control-room"
                  checked={customAssets.controlRoom}
                  onCheckedChange={(checked) => setCustomAssets({ ...customAssets, controlRoom: checked })}
                />
                <Label htmlFor="control-room">Control Room</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch id="is-permanent" checked={isPermanent} onCheckedChange={setIsPermanent} />
              <Label htmlFor="is-permanent">Permanent Marker</Label>
            </div>
            <p className="text-sm text-gray-500">
              Permanent markers are fixed relative to game start and will automatically adjust if the game time changes.
            </p>

            {isPermanent && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  This event will be treated as a permanent marker in the game timeline. Examples include "Gate Open",
                  "Halftime", or "End of Game".
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{event?.id ? "Update Event" : "Add Event"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

