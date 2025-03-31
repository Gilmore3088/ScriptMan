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
import { FileIcon, FileTextIcon, ImageIcon, LinkIcon, PaperclipIcon, VideoIcon, XIcon } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface Asset {
  id: string
  fileName: string
  fileType: string
  url: string
  fileSizeBytes: number
  uploadedAt: string
}

interface ComponentDetailProps {
  component: {
    id: string
    name: string
    type: string
    version: number
    isGlobal: boolean
    description?: string
    content?: string
    assets: Asset[]
  } | null
  isOpen: boolean
  onClose: () => void
}

export function ComponentDetail({ component, isOpen, onClose }: ComponentDetailProps) {
  if (!component) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{component.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{component.type}</span>
                <span className="text-xs text-muted-foreground">Version {component.version}</span>
                {component.isGlobal && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Global Component</span>
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
            <TabsTrigger value="assets">Assets ({component.assets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {component.description || "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Usage Information</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type:</span> {component.type}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Version:</span> {component.version}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Global:</span> {component.isGlobal ? "Yes" : "No"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Assets:</span> {component.assets.length}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="p-4 border rounded-md mt-2">
            <div className="prose prose-sm max-w-none">
              {component.content ? (
                <div className="whitespace-pre-wrap">{component.content}</div>
              ) : (
                <p className="text-muted-foreground">No content available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="p-4 border rounded-md mt-2">
            {component.assets.length > 0 ? (
              <div className="space-y-2">
                {component.assets.map((asset) => (
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
              <p className="text-muted-foreground">No assets attached to this component.</p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {component.isGlobal && <Button>Edit Global Component</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

