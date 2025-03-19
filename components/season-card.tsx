"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, Copy, MoreHorizontal, Calendar, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteSeason } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import type { Season } from "@/lib/types"

interface SeasonCardProps {
  season: Season
  viewMode: "grid" | "list"
  onEdit: () => void
  onDelete: (seasonId: string) => void
}

export function SeasonCard({ season, viewMode, onEdit, onDelete }: SeasonCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate season progress based on actual data
  const gameCount = season.gameCount || 0
  const completedGames = season.completedGames || 0
  const progress = gameCount > 0 ? Math.round((completedGames / gameCount) * 100) : 0

  // Determine season status (mock data for now)
  const status = season.status ? season.status.charAt(0).toUpperCase() + season.status.slice(1) : "In Progress"

  // Handle season deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      console.log(`Deleting season with ID: ${season.id}`)
      await deleteSeason(season.id)

      toast({
        title: "Success",
        description: "Season deleted successfully",
      })

      // Call the onDelete callback to update the UI
      onDelete(season.id)
    } catch (error) {
      console.error("Error deleting season:", error)
      toast({
        title: "Error",
        description: "Failed to delete season",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle season duplication (mock implementation)
  const handleDuplicate = () => {
    toast({
      title: "Coming Soon",
      description: "Season duplication will be available soon",
    })
  }

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="p-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{season.title}</h3>
              <Badge variant="outline" className="w-fit">
                {season.status ? season.status.charAt(0).toUpperCase() + season.status.slice(1) : "In Progress"}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Sport: {season.sport}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Year: {season.year}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span>Created: {formatDate(season.createdAt)}</span>
              <span className="ml-4">Last Updated: {formatDate(season.updatedAt)}</span>
            </div>
          </div>
          <div className="flex sm:flex-col justify-end items-center gap-2 p-4 bg-gray-50 border-t sm:border-t-0 sm:border-l">
            <Link href={`/seasons/${season.id}`}>
              <Button variant="default" size="sm" className="w-full">
                Open Season
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-500 hover:text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Link href={`/seasons/${season.id}`} className="block h-full">
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="mr-2">{season.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    onEdit()
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Season
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    handleDuplicate()
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <Badge variant="outline">{season.sport}</Badge>
              <Badge variant="outline">{season.year}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <Badge variant="outline" className="font-normal">
                {season.status ? season.status.charAt(0).toUpperCase() + season.status.slice(1) : "In Progress"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(season.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {season.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">{season.description}</div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            {gameCount > 0 ? `${completedGames} of ${gameCount} games completed` : "No games yet"}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Season</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{season.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Season"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Link>
  )
}

