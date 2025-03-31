import { LANE_ORDER } from "@/utils/timeline-helpers"

export function TimelineLegend() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {LANE_ORDER.map((lane) => (
        <div key={lane.id} className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
          <span className="text-xs">{lane.name}</span>
        </div>
      ))}
    </div>
  )
}

