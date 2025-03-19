"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Video, Megaphone, Paperclip, Globe, Clock } from "lucide-react"
import type { Element } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface ElementCardProps {
  element: Element
  onClick: () => void
  viewMode?: "grid" | "list"
  selectable?: boolean
}

export function ElementCard({ element, onClick, viewMode = "grid", selectable = false }: ElementCardProps) {
  // Get icon based on element type
  const getTypeIcon = () => {
    switch (element.type) {
      case "sponsor_read":
        return <FileText className="h-4 w-4" />
      case "promotion":
        return <Megaphone className="h-4 w-4" />
      case "media_asset":
        return <Video className="h-4 w-4" />
      case "script":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get display name for element type
  const getTypeDisplayName = () => {
    switch (element.type) {
      case "sponsor_read":
        return "Sponsor Read"
      case "promotion":
        return "Promotion"
      case "media_asset":
        return "Media Asset"
      case "script":
        return "Script"
      default:
        return element.type.charAt(0).toUpperCase() + element.type.slice(1).replace(/_/g, " ")
    }
  }

  // Format content preview
  const getContentPreview = () => {
    if (!element.content) return null
    return element.content.length > 100 ? `${element.content.substring(0, 100)}...` : element.content
  }

  if (viewMode === "list") {
    return (
      <Card
        className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${selectable ? "hover:border-primary" : ""}`}
        onClick={onClick}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="p-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className="font-semibold">{element.name}</h3>
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 w-fit">
                {getTypeIcon()}
                <span className="ml-1">{getTypeDisplayName()}</span>
              </div>
              {element.isGlobal && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Globe className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{element.description}</p>
            {element.content && (
              <div className="mt-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded line-clamp-2">
                {getContentPreview()}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {element.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex sm:flex-col justify-end items-center gap-2 p-4 bg-gray-50 border-t sm:border-t-0 sm:border-l">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>v{element.version}</span>
            </div>
            {element.assets && element.assets.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span>
                  {element.assets.length} file{element.assets.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">Updated {formatDate(element.updatedAt)}</div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col ${selectable ? "hover:border-primary" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 w-fit">
            {getTypeIcon()}
            <span className="ml-1">{getTypeDisplayName()}</span>
          </div>
          {element.isGlobal && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Globe className="h-3 w-3 mr-1" />
              Global
            </Badge>
          )}
        </div>
        <h3 className="font-semibold mb-2">{element.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{element.description}</p>
        {element.content && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded line-clamp-3 mb-2">
            {getContentPreview()}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-auto">
          {element.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-2 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>v{element.version}</span>
        </div>
        {element.assets && element.assets.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            <span>{element.assets.length}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

