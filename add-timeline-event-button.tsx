"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddTimelineEventDialog } from "./add-timeline-event-dialog"

export function AddTimelineEventButton({ gameId, onEventAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(new Date())

  const handleOpenModal = () => {
    setSelectedTime(new Date())
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSaveEvent = (eventData) => {
    if (onEventAdded) {
      onEventAdded(eventData, selectedTime)
    }
    setIsModalOpen(false)
  }

  return (
    <>
      <Button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
        <PlusCircle className="h-4 w-4 mr-1" /> Add Event
      </Button>

      <AddTimelineEventDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        startTime={selectedTime}
        event={null}
        gameId={gameId}
      />
    </>
  )
}

