"use client"

import { useState } from "react"
import Timeline from "./timeline"
import TimelineSidebar from "./timeline-sidebar"

interface TimelineEditorProps {
  gameId: string
}

export function TimelineEditor({ gameId }: TimelineEditorProps) {
  const [selectedElement, setSelectedElement] = useState<any>(null)

  const handleElementDragStart = (element: any) => {
    setSelectedElement(element)
  }

  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <div className="col-span-3">
        <Timeline gameId={gameId} />
      </div>
      <div className="col-span-1">
        <TimelineSidebar gameId={gameId} onElementDragStart={handleElementDragStart} />
      </div>
    </div>
  )
}

export default TimelineEditor

