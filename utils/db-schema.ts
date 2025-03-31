import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function getTimelineTableName() {
  const supabase = createClientComponentClient()

  // Check for timeline_events table
  const { data: timelineEventsData } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_name", "timeline_events")
    .single()

  if (timelineEventsData) {
    return "timeline_events"
  }

  // Check for events table
  const { data: eventsData } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_name", "events")
    .single()

  if (eventsData) {
    return "events"
  }

  // Default to script_timeline_events (even though it doesn't exist yet)
  return "script_timeline_events"
}

