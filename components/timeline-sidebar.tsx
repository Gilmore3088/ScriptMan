interface TimelineSidebarProps {
  events: Array<{
    id: string
    startTime: number
    endTime: number
    title: string
    components: string[]
    notes: string
  }>
}

export function TimelineSidebar({ events }: TimelineSidebarProps) {
  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime)

  return (
    <div className="w-80 border-r overflow-auto p-4">
      <h2 className="font-semibold mb-4">Timeline Events</h2>
      <div className="space-y-3">
        {sortedEvents.map((event) => (
          <div key={event.id} className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between">
              <h3 className="font-medium text-sm">{event.title}</h3>
              <span className="text-xs text-muted-foreground">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{event.notes}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

