"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  PaperclipIcon,
  VideoIcon,
  XIcon,
  Globe,
  Tag,
  Trash,
  Edit,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatFileSize } from "@/lib/utils"
import { deleteElement } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import type { Element } from "@/lib/types"
import { useState } from "react"

interface ElementDetailProps {
  element: Element
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: (elementId: string) => void
}

export function ElementDetail({ element, isOpen, onClose, onEdit, onDelete }: ElementDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!element) return null

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (fileType === "application/pdf") return <FileIcon className="h-4 w-4" />
    if (fileType.includes("text")) return <FileTextIcon className="h-4 w-4" />
    if (fileType.startsWith("video/")) return <VideoIcon className="h-4 w-4" />
    return <PaperclipIcon className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteElement(element.id)

      toast({
        title: "Success",
        description: "Element deleted successfully",
      })

      onDelete(element.id)
      onClose()
    } catch (error) {
      console.error("Error deleting element:", error)
      toast({
        title: "Error",
        description: "Failed to delete element",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{element.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {getTypeDisplayName()}
                </Badge>
                <span className="text-xs text-muted-foreground">Version {element.version}</span>
                {element.isGlobal && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <Globe className="h-3 w-3 mr-1" />
                    Global Element
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="assets">Assets ({element.assets?.length || 0})</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {element.description || "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Usage Information</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type:</span> {getTypeDisplayName()}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Version:</span> {element.version}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Global:</span> {element.isGlobal ? "Yes" : "No"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created:</span> {formatDate(element.createdAt)}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Updated:</span> {formatDate(element.updatedAt)}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Assets:</span> {element.assets?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="p-4 border rounded-md mt-2">
            <div className="prose prose-sm max-w-none">
              {element.content ? (
                <div className="whitespace-pre-wrap">{element.content}</div>
              ) : (
                <p className="text-muted-foreground">No content available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="p-4 border rounded-md mt-2">
            {element.assets && element.assets.length > 0 ? (
              <div className="space-y-2">
                {element.assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      {getFileIcon(asset.fileType)}
                      <div>
                        <p className="text-sm font-medium">{asset.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(asset.fileSizeBytes)} • Uploaded {formatDate(asset.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        <span>Copy Link</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No assets attached to this element.</p>
            )}
          </TabsContent>

          <TabsContent value="tags" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {element.tags && element.tags.length > 0 ? (
                  element.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No tags assigned to this element.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="default" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Element
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Element</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{element.name}"? This action cannot be undone.
              {element.isGlobal && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                  <strong>Warning:</strong> This is a global element. Deleting it may affect multiple show flow items.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Element"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

