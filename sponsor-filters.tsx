"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"

export function SponsorFilters({
  sports = [],
  seasons = [],
  selectedSports = [],
  selectedSeasons = [],
  onSportsChange,
  onSeasonsChange,
}: {
  sports?: any[]
  seasons?: any[]
  selectedSports?: string[]
  selectedSeasons?: string[]
  onSportsChange: (sports: string[]) => void
  onSeasonsChange: (seasons: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSportChange = (sportId: string, checked: boolean) => {
    if (checked) {
      onSportsChange([...selectedSports, sportId])
    } else {
      onSportsChange(selectedSports.filter((id) => id !== sportId))
    }
  }

  const handleSeasonChange = (seasonId: string, checked: boolean) => {
    if (checked) {
      onSeasonsChange([...selectedSeasons, seasonId])
    } else {
      onSeasonsChange(selectedSeasons.filter((id) => id !== seasonId))
    }
  }

  const clearFilters = () => {
    onSportsChange([])
    onSeasonsChange([])
  }

  const hasActiveFilters = selectedSports.length > 0 || selectedSeasons.length > 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {selectedSports.length + selectedSeasons.length}
              </span>
            )}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
          {sports.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Sports</h3>
              <div className="space-y-2">
                {sports.map((sport) => (
                  <div key={sport.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sport-${sport.id}`}
                      checked={selectedSports.includes(sport.id)}
                      onCheckedChange={(checked) => handleSportChange(sport.id, checked as boolean)}
                    />
                    <label htmlFor={`sport-${sport.id}`} className="text-sm cursor-pointer">
                      {sport.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seasons.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Seasons</h3>
              <div className="space-y-2">
                {seasons.map((season) => (
                  <div key={season.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`season-${season.id}`}
                      checked={selectedSeasons.includes(season.id)}
                      onCheckedChange={(checked) => handleSeasonChange(season.id, checked as boolean)}
                    />
                    <label htmlFor={`season-${season.id}`} className="text-sm cursor-pointer">
                      {season.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

