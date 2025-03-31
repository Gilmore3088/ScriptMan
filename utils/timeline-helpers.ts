// Constants for timeline rendering
export const LANE_HEADER_WIDTH = 120
export const LANE_PADDING = 5
export const TIME_HEADER_HEIGHT = 40

// Lane configuration
export const LANES = {
  PRODUCTION_CUES: { id: "production_cue", name: "Production Cues", color: "#4338ca" },
  SPONSOR_READS: { id: "sponsor_read", name: "Sponsor Reads", color: "#0891b2" },
  PERMANENT_MARKERS: { id: "permanent_marker", name: "Permanent Markers", color: "#ca8a04" },
  TALENT: { id: "talent", name: "Talent", color: "#15803d" },
  GRAPHICS: { id: "graphics", name: "Graphics", color: "#b91c1c" },
  AUDIO: { id: "audio", name: "Audio", color: "#7e22ce" },
  MISC: { id: "misc", name: "Misc", color: "#737373" },
}

// Lane order for rendering
export const LANE_ORDER = [
  { ...LANES.PRODUCTION_CUES, height: 60 },
  { ...LANES.SPONSOR_READS, height: 60 },
  { ...LANES.PERMANENT_MARKERS, height: 60 },
  { ...LANES.TALENT, height: 60 },
  { ...LANES.GRAPHICS, height: 60 },
  { ...LANES.AUDIO, height: 60 },
  { ...LANES.MISC, height: 60 },
]

// Helper function to calculate start time from offset
export function calculateStartTime(offset, baseTime) {
  const date = new Date(baseTime)
  date.setSeconds(date.getSeconds() + offset)
  return date
}

// Helper function to calculate time offset from date
export function calculateTimeOffset(date, baseTime) {
  return Math.round((date.getTime() - baseTime.getTime()) / 1000)
}

// Update the getEventLane function to better handle permanent markers
export function getEventLane(event: any) {
  // First check if a lane is explicitly specified
  if (event.lane) {
    const laneById = Object.values(LANES).find((lane) => lane.id === event.lane)
    if (laneById) return laneById
  }

  // If no lane is specified, determine based on element_type or category
  const eventType = (event.element_type || event.type || event.category || "").toLowerCase()

  if (eventType.includes("sponsor") || eventType === "sponsor_read") {
    return LANES.SPONSOR_READS
  } else if (eventType.includes("permanent") || eventType === "permanent_marker") {
    return LANES.PERMANENT_MARKERS
  } else if (eventType.includes("talent")) {
    return LANES.TALENT
  } else if (eventType.includes("graphic")) {
    return LANES.GRAPHICS
  } else if (eventType.includes("audio")) {
    return LANES.AUDIO
  } else if (eventType.includes("production") || eventType === "production_cue") {
    return LANES.PRODUCTION_CUES
  }

  // Default to production cues if no match
  return LANES.PRODUCTION_CUES
}

// Helper function to round time to interval
export function roundTimeToInterval(time, interval) {
  const date = new Date(time)

  // Parse the interval value
  let value, unit

  if (interval.endsWith("s")) {
    value = Number.parseInt(interval.slice(0, -1))
    unit = "seconds"
  } else {
    value = Number.parseInt(interval)
    unit = "minutes"
  }

  if (unit === "seconds") {
    // Round to nearest second interval
    const seconds = date.getSeconds()
    const roundedSeconds = Math.round(seconds / value) * value
    date.setSeconds(roundedSeconds, 0)
  } else {
    // Round to nearest minute interval
    const minutes = date.getMinutes()
    const roundedMinutes = Math.round(minutes / value) * value
    date.setMinutes(roundedMinutes, 0)
  }

  return date
}

// Helper function to get time marker density based on zoom level
export function getTimeMarkerDensity(zoomLevel, interval) {
  // Parse the interval value
  let value, unit

  if (interval.endsWith("s")) {
    value = Number.parseInt(interval.slice(0, -1))
    unit = "seconds"
  } else {
    value = Number.parseInt(interval)
    unit = "minutes"
  }

  // Convert to minutes for consistent calculation
  const intervalInMinutes = unit === "seconds" ? value / 60 : value

  // Calculate density based on zoom level and interval
  if (zoomLevel < 1) {
    return 5 // Show every 5th marker at low zoom
  } else if (zoomLevel < 3) {
    return 2 // Show every 2nd marker at medium zoom
  } else {
    return 1 // Show every marker at high zoom
  }
}

// Draw time ruler
export function drawTimeRuler(
  ctx,
  width,
  headerHeight,
  startTime,
  endTime,
  pixelsPerMinute,
  interval,
  density,
  orientation,
) {
  // Parse the interval value
  let value, unit

  if (interval.endsWith("s")) {
    value = Number.parseInt(interval.slice(0, -1))
    unit = "seconds"
  } else {
    value = Number.parseInt(interval)
    unit = "minutes"
  }

  // Convert to minutes for consistent calculation
  const intervalInMinutes = unit === "seconds" ? value / 60 : value

  // Calculate total minutes
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / 60000

  // Draw time markers
  ctx.fillStyle = "#212529"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  if (orientation === "horizontal") {
    // Draw horizontal time ruler
    for (let i = 0; i <= totalMinutes; i += intervalInMinutes) {
      const x = i * pixelsPerMinute + LANE_HEADER_WIDTH

      // Draw time marker line
      ctx.strokeStyle = i % (intervalInMinutes * density) === 0 ? "#adb5bd" : "#dee2e6"
      ctx.lineWidth = i % (intervalInMinutes * density) === 0 ? 1 : 0.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, headerHeight)
      ctx.stroke()

      // Draw time label for major markers
      if (i % (intervalInMinutes * density) === 0) {
        const time = new Date(startTime)
        time.setMinutes(time.getMinutes() + i)
        const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        ctx.fillText(timeLabel, x, headerHeight / 2)
      }
    }
  } else {
    // Draw vertical time ruler
    for (let i = 0; i <= totalMinutes; i += intervalInMinutes) {
      const y = i * pixelsPerMinute + headerHeight

      // Draw time marker line
      ctx.strokeStyle = i % (intervalInMinutes * density) === 0 ? "#adb5bd" : "#dee2e6"
      ctx.lineWidth = i % (intervalInMinutes * density) === 0 ? 1 : 0.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(LANE_HEADER_WIDTH, y)
      ctx.stroke()

      // Draw time label for major markers
      if (i % (intervalInMinutes * density) === 0) {
        const time = new Date(startTime)
        time.setMinutes(time.getMinutes() + i)
        const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        ctx.fillText(timeLabel, LANE_HEADER_WIDTH / 2, y)
      }
    }
  }
}

// Draw lane headers
export function drawLaneHeaders(ctx, width, height, headerHeight, orientation) {
  const lanePositions = {}

  if (orientation === "horizontal") {
    // Draw horizontal lane headers
    let currentY = headerHeight

    for (const lane of LANE_ORDER) {
      // Draw lane header
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, currentY, LANE_HEADER_WIDTH, lane.height)

      // Draw lane header text
      ctx.fillStyle = "#212529"
      ctx.font = "12px Arial"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(lane.name, 10, currentY + lane.height / 2)

      // Draw lane separator
      ctx.strokeStyle = "#dee2e6"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, currentY)
      ctx.lineTo(width, currentY)
      ctx.stroke()

      // Store lane position
      lanePositions[lane.id] = {
        y: currentY,
        height: lane.height,
      }

      currentY += lane.height
    }
  } else {
    // Draw vertical lane headers
    const headerWidth = 180
    const laneWidth = (width - headerWidth) / LANE_ORDER.length

    for (let i = 0; i < LANE_ORDER.length; i++) {
      const lane = LANE_ORDER[i]
      const x = headerWidth + i * laneWidth

      // Draw lane header
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(x, 0, laneWidth, headerHeight)

      // Draw lane header text
      ctx.fillStyle = "#212529"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(lane.name, x + laneWidth / 2, headerHeight / 2)

      // Draw lane separator
      ctx.strokeStyle = "#dee2e6"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()

      // Store lane position
      lanePositions[lane.id] = {
        x: x,
        width: laneWidth,
      }
    }
  }

  return lanePositions
}

// Update the drawEventBlock function to improve visual feedback during dragging
// Replace the existing drawEventBlock function with this enhanced version

export function drawEventBlock(
  ctx: CanvasRenderingContext2D,
  event: any,
  lanePositions: any,
  width: number,
  headerHeight: number,
  startTime: Date,
  pixelsPerMinute: number,
  showCustomAssets: boolean,
  orientation: string,
  isDragged = false,
  visualScale = 1.0,
) {
  // Determine which lane this event belongs to
  const lane = getEventLane(event)

  // Get the lane position from the lanePositions map
  const lanePosition = lanePositions[lane.id]
  if (!lanePosition) {
    console.error(`Lane position not found for lane ${lane.id}`)
    return
  }

  // For events with time_offset, use that directly
  let startDate
  if (event.time_offset !== undefined) {
    // Calculate the start time based on time_offset (in seconds)
    startDate = calculateStartTime(event.time_offset, startTime)
  } else if (event.start_time) {
    // For events with start_time, parse it as a date
    startDate = new Date(event.start_time)
  } else {
    // Skip this event if no time information
    console.error(`Event ${event.id || "unknown"} has no time information`)
    return
  }

  // Ensure we have a valid duration (in seconds)
  const duration = event.duration && event.duration > 0 ? event.duration : 60

  // Convert duration from seconds to minutes for pixel calculation
  const durationInMinutes = duration / 60

  // Calculate position and dimensions based on orientation
  let position, eventWidth, eventHeight, eventX, eventY

  if (orientation === "horizontal") {
    // Calculate position in pixels from the start time
    const minutesSinceStart = (startDate.getTime() - startTime.getTime()) / 60000
    position = minutesSinceStart * pixelsPerMinute + LANE_HEADER_WIDTH

    // Log position calculation for debugging
    if (isDragged) {
      console.log("Dragged event position calculation:", {
        event: event.title,
        time_offset: event.time_offset,
        startDate: startDate.toISOString(),
        minutesSinceStart,
        pixelsPerMinute,
        position,
      })
    }

    // Calculate width based on duration (minimum 100px for visibility)
    eventWidth = Math.max(durationInMinutes * pixelsPerMinute, 100) * visualScale

    // Position in the lane
    eventX = position
    eventY = lanePosition.y + LANE_PADDING
    eventHeight = lanePosition.height - LANE_PADDING * 2
  } else {
    // Vertical orientation
    const minutesSinceStart = (startDate.getTime() - startTime.getTime()) / 60000
    position = minutesSinceStart * pixelsPerMinute + headerHeight

    // Calculate height based on duration (minimum 60px for visibility)
    eventHeight = Math.max(durationInMinutes * pixelsPerMinute, 60) * visualScale

    // Position in the lane
    eventX = lanePosition.x + LANE_PADDING
    eventY = position
    eventWidth = lanePosition.width - LANE_PADDING * 2
  }

  // Determine colors based on event type
  let bgColor, borderColor, textColor

  const eventType = event.element_type || event.type || event.category || "production_cue"

  if (eventType.includes("sponsor") || eventType === "sponsor_read") {
    bgColor = "#e3f2fd" // Light blue
    borderColor = "#2196f3"
    textColor = "#0d47a1"
  } else if (eventType.includes("permanent") || eventType === "permanent_marker") {
    bgColor = "#fff9c4" // Light yellow
    borderColor = "#fbc02d"
    textColor = "#f57f17"
  } else if (eventType.includes("talent")) {
    bgColor = "#e8f5e9" // Light green
    borderColor = "#4caf50"
    textColor = "#1b5e20"
  } else if (eventType.includes("graphic")) {
    bgColor = "#f3e5f5" // Light purple
    borderColor = "#9c27b0"
    textColor = "#4a148c"
  } else if (eventType.includes("audio")) {
    bgColor = "#ffebee" // Light red
    borderColor = "#f44336"
    textColor = "#b71c1c"
  } else {
    bgColor = "#f5f5f5" // Light gray
    borderColor = "#9e9e9e"
    textColor = "#212121"
  }

  // If the event is being dragged, make it more prominent
  if (isDragged) {
    bgColor = "#bbdefb" // Brighter highlight color
    borderColor = "#1976d2"
    textColor = "#0d47a1"
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 5
    ctx.shadowOffsetY = 5
  }

  // Draw the event block
  ctx.fillStyle = bgColor
  ctx.strokeStyle = borderColor
  ctx.lineWidth = isDragged ? 3 : 2

  // Use rounded rectangle for better appearance
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(eventX, eventY, eventWidth, eventHeight, 5)
    ctx.fill()
    ctx.stroke()
  } else {
    // Fallback for browsers without roundRect
    ctx.fillRect(eventX, eventY, eventWidth, eventHeight)
    ctx.strokeRect(eventX, eventY, eventWidth, eventHeight)
  }

  // Reset shadow for text
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Draw the event title
  ctx.fillStyle = textColor
  ctx.font = isDragged ? "bold 13px Arial" : "bold 12px Arial"
  ctx.textBaseline = "top"

  // Truncate text if needed
  const title = event.title || "Untitled"
  const maxTextWidth = eventWidth - 10
  let displayTitle = title

  ctx.save()
  if (orientation === "horizontal") {
    // For horizontal, truncate if too long
    if (ctx.measureText(title).width > maxTextWidth) {
      let truncated = title
      while (ctx.measureText(truncated + "...").width > maxTextWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1)
      }
      displayTitle = truncated + "..."
    }
    ctx.fillText(displayTitle, eventX + 5, eventY + 5)

    // Add time information below title
    ctx.font = isDragged ? "11px Arial" : "10px Arial"
    const timeText = `${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${duration}s)`
    ctx.fillText(timeText, eventX + 5, eventY + 20)

    // If dragged, add a visual indicator
    if (isDragged) {
      ctx.fillStyle = "#1976d2"
      ctx.font = "10px Arial"
      ctx.fillText("Dragging...", eventX + 5, eventY + 35)
    }
  } else {
    // For vertical, rotate text if needed
    if (eventHeight > 40) {
      ctx.fillText(displayTitle, eventX + 5, eventY + 5)

      // Add time information below title
      ctx.font = "10px Arial"
      const timeText = `${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${duration}s)`
      ctx.fillText(timeText, eventX + 5, eventY + 20)

      // If dragged, add a visual indicator
      if (isDragged) {
        ctx.fillStyle = "#1976d2"
        ctx.font = "10px Arial"
        ctx.fillText("Dragging...", eventX + 5, eventY + 35)
      }
    } else {
      // For small events, just show title
      ctx.fillText(displayTitle, eventX + 5, eventY + 5)
    }
  }
  ctx.restore()
}

