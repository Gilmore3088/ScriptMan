"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign } from "lucide-react"
import type { GameElement } from "@/types/supabase"

interface ElementPreviewDialogProps {
  element: GameElement
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ElementPreviewDialog({ element, open, onOpenChange }: ElementPreviewDialogProps) {
  const [previewSport, setPreviewSport] = useState(
    element.supported_sports && element.supported_sports.length > 0 ? element.supported_sports[0] : "Football",
  )
  const [previewText, setPreviewText] = useState("")

  useEffect(() => {
    updatePreview()
  }, [previewSport])

  const updatePreview = () => {
    if (!element.script_template) {
      setPreviewText("No script template provided.")
      return
    }

    // Replace placeholders with sample values
    let preview = element.script_template
    preview = preview.replace(/\{sport\}/g, previewSport)
    preview = preview.replace(/\{teamName\}/g, `${previewSport} Team`)
    preview = preview.replace(/\{venue\}/g, "Main Stadium")
    preview = preview.replace(/\{sponsorName\}/g, element.sponsor_name || "Sponsor")
    preview = preview.replace(/\{date\}/g, "January 1, 2023")
    preview = preview.replace(/\{time\}/g, "7:00 PM")
    preview = preview.replace(/\{score\}/g, "21-14")
    preview = preview.replace(/\{player\}/g, "John Smith")

    // Handle any remaining placeholders generically
    preview = preview.replace(/\{(\w+)\}/g, (match, placeholder) => `[${placeholder}]`)

    setPreviewText(preview)
  }

  // Get type color class based on type
  const getTypeColorClass = (type: string) => {
    const typeColorMap: Record<string, string> = {
      "Sponsor Read": "bg-blue-100 text-blue-800",
      "Permanent Marker": "bg-purple-100 text-purple-800",
      "Generic Event": "bg-green-100 text-green-800",
      Promo: "bg-yellow-100 text-yellow-800",
      Announcement: "bg-indigo-100 text-indigo-800",
      Timeout: "bg-red-100 text-red-800",
      "Commercial Break": "bg-orange-100 text-orange-800",
      "Player Introduction": "bg-teal-100 text-teal-800",
      "Team Introduction": "bg-cyan-100 text-cyan-800",
      "Weather Update": "bg-sky-100 text-sky-800",
      "Score Update": "bg-emerald-100 text-emerald-800",
      Statistics: "bg-lime-100 text-lime-800",
    }

    return typeColorMap[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{element.name}</span>
            <Badge className={getTypeColorClass(element.type)}>{element.type}</Badge>
          </DialogTitle>
          <DialogDescription>{element.description || "No description provided."}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Element Details</h3>
              {element.sponsor_name && (
                <div className="flex items-center text-sm text-blue-600">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  <span>{element.sponsor_name}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-sm pt-2">
              <div>
                <span className="font-medium">Type:</span> {element.type}
              </div>
              {element.is_permanent_marker && (
                <div>
                  <span className="font-medium">Permanent Marker:</span> Yes
                </div>
              )}
              {element.is_permanent_marker && element.default_offset && (
                <div>
                  <span className="font-medium">Default Offset:</span> {element.default_offset}
                </div>
              )}
              {element.is_permanent_marker && (
                <div>
                  <span className="font-medium">Lock Offset:</span> {element.lock_offset ? "Yes" : "No"}
                </div>
              )}
            </div>
          </div>

          {element.supported_sports && element.supported_sports.length > 0 && (
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-sm font-medium">Supported Sports</h3>
              <Separator />
              <div className="flex flex-wrap gap-1 pt-2">
                {element.supported_sports.map((sport) => (
                  <Badge key={sport} variant="outline" className="text-xs">
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="flex items-center space-x-2">
                <Label htmlFor="previewSport" className="text-xs">
                  Sport:
                </Label>
                <Select value={previewSport} onValueChange={setPreviewSport}>
                  <SelectTrigger id="previewSport" className="h-8 w-32">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {element.supported_sports && element.supported_sports.length > 0 ? (
                      element.supported_sports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Baseball">Baseball</SelectItem>
                        <SelectItem value="Soccer">Soccer</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="bg-gray-50 p-4 rounded-md border mt-2">
              <p className="whitespace-pre-wrap">{previewText}</p>
            </div>
          </div>

          {element.script_template && (
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-sm font-medium">Script Template</h3>
              <Separator />
              <div className="bg-gray-50 p-4 rounded-md border mt-2 font-mono text-sm">{element.script_template}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

