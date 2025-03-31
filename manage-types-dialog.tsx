"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManageTypesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  predefinedTypes: string[]
  customTypes: string[]
  onSave: (updatedTypes: string[]) => void
}

export function ManageTypesDialog({
  open,
  onOpenChange,
  predefinedTypes,
  customTypes,
  onSave,
}: ManageTypesDialogProps) {
  const [editableTypes, setEditableTypes] = useState<string[]>([...customTypes])
  const [newType, setNewType] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleAddType = () => {
    if (!newType.trim()) {
      toast({
        title: "Error",
        description: "Type name cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (predefinedTypes.includes(newType.trim()) || editableTypes.includes(newType.trim())) {
      toast({
        title: "Error",
        description: "This type already exists",
        variant: "destructive",
      })
      return
    }

    setEditableTypes([...editableTypes, newType.trim()])
    setNewType("")
    toast({
      title: "Success",
      description: `Added new type: ${newType.trim()}`,
    })
  }

  const handleRemoveType = (typeToRemove: string) => {
    setEditableTypes(editableTypes.filter((type) => type !== typeToRemove))
  }

  const handleSave = () => {
    setSaving(true)
    try {
      onSave(editableTypes)
      toast({
        title: "Success",
        description: "Element types updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to save types: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Element Types</DialogTitle>
          <DialogDescription>
            Add, edit, or remove custom element types. Predefined types cannot be modified.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Predefined Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedTypes.map((type) => (
                <div key={type} className="flex items-center p-2 bg-gray-100 rounded-md">
                  <span className="text-sm">{type}</span>
                  <span className="ml-auto text-xs text-gray-500">(System)</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Custom Types</Label>
            {editableTypes.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No custom types added yet.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {editableTypes.map((type) => (
                  <div key={type} className="flex items-center p-2 bg-gray-100 rounded-md">
                    <span className="text-sm">{type}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={() => handleRemoveType(type)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="newType" className="text-sm font-medium mb-2 block">
                Add New Type
              </Label>
              <Input
                id="newType"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="e.g., Special Announcement"
              />
            </div>
            <Button onClick={handleAddType} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

