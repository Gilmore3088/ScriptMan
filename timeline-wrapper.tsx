"use client"

import { useState } from "react"
import CanvasTimeline from "@/components/timeline"
import { TimelineEventModal } from "@/components/timeline-event-modal"
import { useToast } from "@/components/ui/use-toast"
import { createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/lib/db"

export function TimelineWrapper({ gameId, initialEvents = [], onEventsChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedTime, setSelectedTime] = useState(new Date())
  const { toast } = useToast()

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setSelectedTime(new Date(event.start_time))
    setIsModalOpen(true)
  }

  const handleAddEvent = (time, eventType) => {
    setSelectedEvent(null)
    setSelectedTime(time || new Date())
    setIsModalOpen(true)
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteTimelineEvent(eventId)

      // Update the parent component's state
      if (onEventsChange) {
        onEventsChange((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
      }

      toast({
        title: "Event deleted",
        description: "The timeline event has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updatedEventData = {
          ...selectedEvent,
          ...eventData,
        }

        const updated = await updateTimelineEvent(updatedEventData)

        // Update the parent component's state
        if (onEventsChange) {
          onEventsChange((prevEvents) =>
            prevEvents.map((event) => (event.id === selectedEvent.id ? { ...event, ...updated } : event)),
          )
        }

        toast({
          title: "Event updated",
          description: "The timeline event has been updated successfully.",
        })
      } else {
        // Create new event
        const newEventData = {
          ...eventData,
          game_id: gameId,
          start_time: selectedTime.toISOString(),
        }

        const created = await createTimelineEvent(newEventData)

        // Update the parent component's state
        if (onEventsChange) {
          onEventsChange((prevEvents) => [...prevEvents, created[0]])
        }

        toast({
          title: "Event created",
          description: "The timeline event has been created successfully.",
        })
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: `Error saving event: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <CanvasTimeline
        gameId={gameId}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onAddEvent={handleAddEvent}
      />

      <TimelineEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        startTime={selectedTime}
      />
    </>
  )
}

