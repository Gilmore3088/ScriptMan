"use client"

import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface TimelineLegendProps {
  categories: string[]
}

export function TimelineLegend({ categories }: TimelineLegendProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PREGAME":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "IN GAME":
        return "bg-green-100 text-green-800 border-green-200"
      case "HALFTIME":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "POSTGAME":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <h3 className="text-sm font-medium">Timeline Legend</h3>
        <CollapsibleTrigger asChild>
          <button className="p-1 rounded-md hover:bg-gray-200">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="p-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              PREGAME
            </Badge>
            <span className="text-xs text-muted-foreground">Before game activities</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              IN GAME
            </Badge>
            <span className="text-xs text-muted-foreground">During active gameplay</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              HALFTIME
            </Badge>
            <span className="text-xs text-muted-foreground">Mid-game break</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              POSTGAME
            </Badge>
            <span className="text-xs text-muted-foreground">After game activities</span>
          </div>

          {categories
            .filter((c) => !["PREGAME", "IN GAME", "HALFTIME", "POSTGAME"].includes(c))
            .map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Badge variant="outline" className={getCategoryColor(category)}>
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">Custom category</span>
              </div>
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

