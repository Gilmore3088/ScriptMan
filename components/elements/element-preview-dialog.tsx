"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ElementType } from "@/types/database"

interface ElementPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  element: ElementType | null
}

export function ElementPreviewDialog({ open, onOpenChange, element }: ElementPreviewDialogProps) {
  const [activeTab, setActiveTab] = useState("preview")
  const [placeholders, setPlaceholders] = useState<string[]>([])
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
  const [previewText, setPreviewText] = useState("")
  const [originalText, setOriginalText] = useState("")
  const [copied, setCopied] = useState(false)

  // Extract placeholders and set up initial state when element changes
  useEffect(() => {
    if (!element) return

    const scriptTemplate = element.script_template || ""
    setOriginalText(scriptTemplate)

    // Extract placeholders
    const placeholderRegex = /{([^}]+)}/g
    const matches = [...scriptTemplate.matchAll(placeholderRegex)]
    const extractedPlaceholders = [...new Set(matches.map((match) => match[1]))]

    setPlaceholders(extractedPlaceholders)

    // Initialize placeholder values
    const initialValues: Record<string, string> = {}
    extractedPlaceholders.forEach((placeholder) => {
      initialValues[placeholder] = ""
    })

    setPlaceholderValues(initialValues)
    updatePreviewText(scriptTemplate, initialValues)
  }, [element])

  // Update preview text when placeholder values change
  const updatePreviewText = (template: string, values: Record<string, string>) => {
    let result = template

    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, "g")
      result = result.replace(regex, value || `{${key}}`)
    })

    setPreviewText(result)
  }

  // Handle placeholder value change
  const handlePlaceholderChange = (placeholder: string, value: string) => {
    const newValues = { ...placeholderValues, [placeholder]: value }
    setPlaceholderValues(newValues)
    updatePreviewText(element?.script_template || "", newValues)
  }

  // Generate sample values for placeholders
  const generateSampleValues = () => {
    if (!element) return

    const sampleValues: Record<string, string> = { ...placeholderValues }

    placeholders.forEach((placeholder) => {
      switch (placeholder.toLowerCase()) {
        case "sportname":
          sampleValues[placeholder] = "Basketball"
          break
        case "teamname":
          sampleValues[placeholder] = "Wildcats"
          break
        case "hometeam":
          sampleValues[placeholder] = "Lakers"
          break
        case "awayteam":
          sampleValues[placeholder] = "Celtics"
          break
        case "venue":
          sampleValues[placeholder] = "Madison Square Garden"
          break
        case "timeuntilstart":
          sampleValues[placeholder] = "15 minutes"
          break
        case "score":
          sampleValues[placeholder] = "87-82"
          break
        case "sponsor":
          sampleValues[placeholder] = "Nike"
          break
        default:
          sampleValues[placeholder] = `Sample ${placeholder}`
      }
    })

    setPlaceholderValues(sampleValues)
    updatePreviewText(element.script_template, sampleValues)
  }

  // Copy preview text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Clear all placeholder values
  const clearValues = () => {
    const emptyValues: Record<string, string> = {}
    placeholders.forEach((placeholder) => {
      emptyValues[placeholder] = ""
    })

    setPlaceholderValues(emptyValues)
    updatePreviewText(element?.script_template || "", emptyValues)
  }

  // Format original text with highlighted placeholders
  const getFormattedOriginalText = () => {
    if (!element) return ""

    let formatted = element.script_template
    placeholders.forEach((placeholder) => {
      const regex = new RegExp(`{${placeholder}}`, "g")
      formatted = formatted.replace(regex, `<span class="text-[#4A6FA5] font-medium">{${placeholder}}</span>`)
    })

    return formatted
  }

  if (!element) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-[#C4C4C4]">
        <DialogHeader>
          <DialogTitle className="text-[#2D2D2D] text-xl font-bold">{element.name}</DialogTitle>
          <DialogDescription className="text-[#2D2D2D] opacity-70 flex items-center">
            <span>{element.type}</span>
            {element.is_permanent && (
              <Badge
                variant="outline"
                className="ml-2 bg-[#F0AD4E] bg-opacity-20 text-[#F0AD4E] border-[#F0AD4E] text-xs"
              >
                Permanent {element.default_offset && `(${element.default_offset})`}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#4A6FA5] data-[state=active]:text-white">
              Preview
            </TabsTrigger>
            <TabsTrigger value="template" className="data-[state=active]:bg-[#4A6FA5] data-[state=active]:text-white">
              Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {placeholders.length > 0 ? (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-[#2D2D2D] font-medium">Placeholder Values</Label>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateSampleValues}
                        className="text-[#4A6FA5] border-[#4A6FA5]"
                      >
                        Generate Sample Values
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearValues}
                        className="text-[#D9534F] border-[#D9534F]"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {placeholders.map((placeholder) => (
                      <div key={placeholder} className="space-y-1">
                        <Label htmlFor={`placeholder-${placeholder}`} className="text-[#2D2D2D]">
                          {placeholder}
                        </Label>
                        <Input
                          id={`placeholder-${placeholder}`}
                          value={placeholderValues[placeholder] || ""}
                          onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                          className="border-[#C4C4C4]"
                          placeholder={`Enter ${placeholder}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[#2D2D2D] font-medium">Preview</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="text-[#4A6FA5] border-[#4A6FA5]"
                    >
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                  </div>
                  <div className="p-4 bg-[#F5F5F5] rounded-md border border-[#C4C4C4] whitespace-pre-wrap">
                    {previewText}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-[#2D2D2D]">This element has no placeholders to fill in.</div>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#2D2D2D] font-medium">Original Template</Label>
              <div
                className="p-4 bg-[#F5F5F5] rounded-md border border-[#C4C4C4] whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: getFormattedOriginalText() }}
              />
            </div>

            {element.supported_sports && element.supported_sports.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[#2D2D2D] font-medium">Supported Sports</Label>
                <div className="flex flex-wrap gap-2">
                  {element.supported_sports.map((sport, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#4A6FA5] bg-opacity-10 text-[#4A6FA5] border-[#4A6FA5] border-opacity-30"
                    >
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-[#4A6FA5] hover:bg-[#3A5A8A] text-white">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

