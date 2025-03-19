"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { updateGame } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Palette, Plus } from "lucide-react"

interface ManageThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: any
  seasonId: string
  onGameUpdated?: () => void
}

// Common game themes
const COMMON_THEMES = [
  "Homecoming",
  "Family Weekend",
  "Military Appreciation",
  "Senior Day",
  "Alumni Day",
  "Hall of Fame",
  "Rivalry Game",
  "Blackout",
  "Whiteout",
  "Throwback",
  "Season Opener",
  "Conference Opener",
]

export function ManageThemeDialog({ open, onOpenChange, game, seasonId, onGameUpdated }: ManageThemeDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string>("")
  const [customTheme, setCustomTheme] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Set the current theme when dialog opens
  useEffect(() => {
    if (open) {
      if (game.theme) {
        if (COMMON_THEMES.includes(game.theme)) {
          setSelectedTheme(game.theme)
          setShowCustomInput(false)
        } else {
          setSelectedTheme("custom")
          setCustomTheme(game.theme)
          setShowCustomInput(true)
        }
      } else {
        setSelectedTheme("")
        setCustomTheme("")
        setShowCustomInput(false)
      }
    }
  }, [open, game])

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    if (value === "custom") {
      setShowCustomInput(true)
    } else {
      setShowCustomInput(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Determine the theme value to save
      const themeValue = selectedTheme === "custom" ? customTheme : selectedTheme === "" ? null : selectedTheme

      // Update the game with the selected theme
      await updateGame(game.id, {
        theme: themeValue,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Theme updated",
        description: themeValue
          ? `Theme for ${game.title} set to "${themeValue}".`
          : `Theme has been removed from ${game.title}.`,
      })

      // Close the dialog and refresh the data
      onOpenChange(false)
      if (onGameUpdated) {
        onGameUpdated()
      }
    } catch (error) {
      console.error("Error updating game theme:", error)
      toast({
        title: "Error",
        description: "There was an error updating the theme. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Game Theme</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select a theme for {game.title} or create a custom theme.
            </p>

            <RadioGroup value={selectedTheme} onValueChange={handleThemeChange}>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="" id="no-theme" />
                  <Label htmlFor="no-theme" className="flex-1 cursor-pointer">
                    No Theme
                  </Label>
                </div>

                {COMMON_THEMES.map((theme) => (
                  <div key={theme} className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value={theme} id={theme} />
                    <Label htmlFor={theme} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span>{theme}</span>
                      </div>
                    </Label>
                  </div>
                ))}

                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="custom" id="custom-theme" />
                  <Label htmlFor="custom-theme" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <span>Custom Theme</span>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {showCustomInput && (
              <div className="mt-4">
                <Label htmlFor="custom-theme-input">Custom Theme Name</Label>
                <Input
                  id="custom-theme-input"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  placeholder="Enter custom theme name"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (selectedTheme === "custom" && !customTheme.trim())}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

