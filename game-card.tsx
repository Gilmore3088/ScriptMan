"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Copy,
  FileText,
  MapPin,
  Trash,
  LayoutTemplate,
  Edit,
  MoreHorizontal,
  Tv,
  Gift,
  DoorOpen,
  Palette,
  Building,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GameCardProps {
  game: {
    id: string
    title: string
    date: string
    location: string
    eventCount: number
    completedEvents: number
    status: string
    theme?: string
    titleSponsor?: string
    tvBroadcast?: string
    giveaway?: string
    eventStartTime?: string
  }
  seasonId: string
  onDuplicate: () => void
  onDelete: () => void
}

export function GameCard({ game, seasonId, onDuplicate, onDelete }: GameCardProps) {
  const progress = Math.round((game.completedEvents / game.eventCount) * 100)
  const isCompleted = game.status === "completed"
  const gameDate = new Date(game.date)
  const gameTime = gameDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSponsorDialog, setShowSponsorDialog] = useState(false)
  const [showThemeDialog, setShowThemeDialog] = useState(false)

  return (
    <>
      <Card className={`overflow-hidden h-full flex flex-col ${isCompleted ? "opacity-75" : ""}`}>
        {/* Header with Theme and TV Broadcast */}
        <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
          {game.theme ? (
            <Badge variant="outline" className="font-medium">
              {game.theme}
            </Badge>
          ) : (
            <span></span>
          )}

          {game.tvBroadcast && (
            <div className="flex items-center gap-1 text-xs">
              <Tv className="h-3 w-3 text-muted-foreground" />
              <span>{game.tvBroadcast}</span>
            </div>
          )}
        </div>

        {/* Title Sponsor if available */}
        {game.titleSponsor && (
          <div className="px-6 pt-4 pb-0 text-xs text-center text-muted-foreground">
            Presented by {game.titleSponsor}
          </div>
        )}

        <CardContent className="p-6 flex-1">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">{game.title}</h3>
            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 w-fit mt-1">
              {isCompleted ? "Completed" : "Upcoming"}
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(game.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Kickoff at {gameTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{game.location}</span>
            </div>

            {game.eventStartTime && (
              <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <span>Gates Open: {game.eventStartTime}</span>
              </div>
            )}

            {game.giveaway && (
              <div className="flex items-center gap-2 mt-2">
                <Gift className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Giveaway: {game.giveaway}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 p-4 pt-0 border-t mt-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link href={`/seasons/${seasonId}/games/${game.id}`} className="w-full">
              <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Show-Flow
              </Button>
            </Link>
            <Link href={`/seasons/${seasonId}/games/${game.id}?view=timeline`} className="w-full">
              <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                <LayoutTemplate className="h-4 w-4" />
                Timeline
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-1" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-1 text-red-500 hover:text-red-600"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => setShowSponsorDialog(true)}>
                  <Building className="h-4 w-4" />
                  <span>Change Sponsor</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => setShowThemeDialog(true)}>
                  <Palette className="h-4 w-4" />
                  <span>Manage Theme</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>

      {/* Edit Game Details Dialog */}
      <EditGameDetailsDialog open={showEditDialog} onOpenChange={setShowEditDialog} game={game} seasonId={seasonId} />

      {/* Change Sponsor Dialog */}
      <ChangeSponsorDialog
        open={showSponsorDialog}
        onOpenChange={setShowSponsorDialog}
        game={game}
        seasonId={seasonId}
      />

      {/* Manage Theme Dialog */}
      <ManageThemeDialog open={showThemeDialog} onOpenChange={setShowThemeDialog} game={game} seasonId={seasonId} />
    </>
  )
}

// Edit Game Details Dialog Component
function EditGameDetailsDialog({
  open,
  onOpenChange,
  game,
  seasonId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: any
  seasonId: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Game Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">Edit the details for {game.title}</p>
          {/* Game edit form would go here */}
          <p className="text-sm text-muted-foreground">
            This dialog will be implemented with a form to edit all game details.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Change Sponsor Dialog Component
function ChangeSponsorDialog({
  open,
  onOpenChange,
  game,
  seasonId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: any
  seasonId: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Title Sponsor</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">Select a title sponsor for {game.title}</p>
          {/* Sponsor selection form would go here */}
          <p className="text-sm text-muted-foreground">
            This dialog will be implemented with a form to select a sponsor from your sponsor roster.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Manage Theme Dialog Component
function ManageThemeDialog({
  open,
  onOpenChange,
  game,
  seasonId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: any
  seasonId: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Game Theme</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">Set a theme for {game.title}</p>
          {/* Theme selection form would go here */}
          <p className="text-sm text-muted-foreground">
            This dialog will be implemented with a form to select or create a theme for this game.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

