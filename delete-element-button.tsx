"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteElement } from "@/app/elements/actions"
import { useRouter } from "next/navigation"

export function DeleteElementButton({ elementId }: { elementId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to delete this element? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteElement(elementId)

      if (result.success) {
        // Refresh the page to show updated list
        router.refresh()
      } else {
        alert(`Error: ${result.error || "Failed to delete element"}`)
      }
    } catch (error) {
      console.error("Error deleting element:", error)
      alert("An unexpected error occurred while deleting the element")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:bg-red-50"
    >
      <Trash2 className={`h-4 w-4 ${isDeleting ? "animate-spin" : ""}`} />
      <span className="sr-only">Delete</span>
    </Button>
  )
}

