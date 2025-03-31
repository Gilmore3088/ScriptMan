"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import AddItemModal from "./add-item-modal"

export default function AddItemButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
        <PlusCircle size={16} />
        Add Item
      </Button>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

