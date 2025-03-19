"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ElementLibrary } from "./element-library"
import type { Element } from "@/lib/types"

interface ElementPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onElementSelect: (element: Element) => void
}

export function ElementPicker({ open, onOpenChange, onElementSelect }: ElementPickerProps) {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)

  const handleElementSelect = (element: Element) => {
    setSelectedElement(element)
  }

  const handleConfirm = () => {
    if (selectedElement) {
      onElementSelect(selectedElement)
      onOpenChange(false)
      setSelectedElement(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Element</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ElementLibrary onElementSelect={handleElementSelect} selectable={true} />
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedElement} onClick={handleConfirm}>
            {selectedElement ? `Insert "${selectedElement.name}"` : "Select an Element"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

