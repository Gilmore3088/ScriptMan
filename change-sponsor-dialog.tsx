"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateGame, getSponsors } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Building, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ChangeSponsorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: any
  seasonId: string
  onGameUpdated?: () => void
}

export function ChangeSponsorDialog({ open, onOpenChange, game, seasonId, onGameUpdated }: ChangeSponsorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sponsors, setSponsors] = useState<any[]>([])
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingSponsors, setIsLoadingSponsors] = useState(false)

  // Fetch sponsors when dialog opens
  useEffect(() => {
    if (open) {
      fetchSponsors()
      // Set the currently selected sponsor if there is one
      if (game.titleSponsor) {
        setSelectedSponsor(game.titleSponsor)
      } else {
        setSelectedSponsor(null)
      }
    }
  }, [open, game])

  const fetchSponsors = async () => {
    setIsLoadingSponsors(true)
    try {
      const sponsorsList = await getSponsors()
      setSponsors(sponsorsList)
    } catch (error) {
      console.error("Error fetching sponsors:", error)
      toast({
        title: "Error",
        description: "Failed to load sponsors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSponsors(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update the game with the selected sponsor
      await updateGame(game.id, {
        titleSponsor: selectedSponsor,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Sponsor updated",
        description: selectedSponsor
          ? `${game.title} is now presented by ${selectedSponsor}.`
          : `Title sponsor has been removed from ${game.title}.`,
      })

      // Close the dialog and refresh the data
      onOpenChange(false)
      if (onGameUpdated) {
        onGameUpdated()
      }
    } catch (error) {
      console.error("Error updating game sponsor:", error)
      toast({
        title: "Error",
        description: "There was an error updating the sponsor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter sponsors based on search query
  const filteredSponsors = sponsors.filter((sponsor) => sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Title Sponsor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sponsors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoadingSponsors ? (
              <div className="flex justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading sponsors...</p>
              </div>
            ) : filteredSponsors.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <RadioGroup value={selectedSponsor || ""} onValueChange={setSelectedSponsor}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="" id="no-sponsor" />
                      <Label htmlFor="no-sponsor" className="flex-1 cursor-pointer">
                        No Title Sponsor
                      </Label>
                    </div>

                    {filteredSponsors.map((sponsor) => (
                      <div key={sponsor.id} className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value={sponsor.name} id={sponsor.id} />
                        <Label htmlFor={sponsor.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{sponsor.name}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No sponsors match your search." : "No sponsors available."}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

