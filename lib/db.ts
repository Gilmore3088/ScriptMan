import { supabase } from "./supabase"
import type { Season, Game, Element, Sport } from "./types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Fix the getSupabaseClient function to avoid using require()
export function getSupabaseClient() {
  // In the browser, always use the client component client
  if (typeof window !== "undefined") {
    if (!supabaseInstance) {
      supabaseInstance = createClientComponentClient<Database>()
    }
    return supabaseInstance
  }

  // On the server, use the imported supabase instance which should have admin privileges
  return supabase
}

// Debug helper function
function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, details)
}

// Seasons
export async function getSeasons() {
  try {
    const supabase = getSupabaseClient()
    logDbOperation("getSeasons", "Fetching all seasons")

    // Change from sorting by "name" to "created_at" since "name" doesn't exist
    const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching seasons:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getSeasons:", error)
    return []
  }
}

export async function getSeason(id: string) {
  try {
    logDbOperation("getSeason", { id })

    const { data, error } = await supabase.from("seasons").select("*").eq("id", id)

    if (error) {
      console.error(`Error fetching season ${id}:`, error)
      throw new Error(`Error fetching season: ${error.message}`)
    }

    // Check if we got any data back
    if (!data || data.length === 0) {
      console.log(`No season found with ID ${id}`)
      return null
    }

    // If we got multiple rows (shouldn't happen with a primary key), log a warning and return the first one
    if (data.length > 1) {
      console.warn(`Multiple seasons found with ID ${id}, using the first one`)
    }

    return data[0]
  } catch (error) {
    console.error(`Error in getSeason for ID ${id}:`, error)
    throw error
  }
}

// Games
export async function getGames(seasonId: string) {
  try {
    logDbOperation("getGames", { seasonId })

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("season_id", seasonId)
      .order("date", { ascending: true })

    if (error) {
      console.error(`Error fetching games for season ${seasonId}:`, error)
      throw new Error(`Error fetching games: ${error.message}`)
    }

    return (data || []).map((item) => ({
      id: item.id,
      seasonId: item.season_id,
      title: item.title,
      date: item.date,
      eventStartTime: item.event_start_time,
      location: item.location,
      theme: item.theme,
      titleSponsor: item.title_sponsor,
      broadcastNetwork: item.broadcast_network, // We'll keep this in the returned object for now
      giveaway: item.giveaway,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // Add computed fields
      eventCount: 0,
      completedEvents: 0,
    }))
  } catch (error) {
    console.error(`Error in getGames for season ${seasonId}:`, error)
    throw error
  }
}

export async function getGame(id: string) {
  try {
    logDbOperation("getGame", { id })

    const { data, error } = await supabase.from("games").select("*").eq("id", id)

    if (error) {
      console.error(`Error fetching game ${id}:`, error)
      throw new Error(`Error fetching game: ${error.message}`)
    }

    // Check if we got any data back
    if (!data || data.length === 0) {
      console.log(`No game found with ID ${id}`)
      return null
    }

    // If we got multiple rows (shouldn't happen with a primary key), log a warning and return the first one
    if (data.length > 1) {
      console.warn(`Multiple games found with ID ${id}, using the first one`)
    }

    const gameData = data[0]

    return {
      id: gameData.id,
      seasonId: gameData.season_id,
      title: gameData.title,
      date: gameData.date,
      eventStartTime: gameData.event_start_time,
      location: gameData.location,
      theme: gameData.theme,
      titleSponsor: gameData.title_sponsor,
      broadcastNetwork: gameData.broadcast_network, // We'll keep this in the returned object for now
      giveaway: gameData.giveaway,
      status: gameData.status,
      createdAt: gameData.created_at,
      updatedAt: gameData.updated_at,
      // Add computed fields
      eventCount: 0,
      completedEvents: 0,
    }
  } catch (error) {
    console.error(`Error in getGame for ID ${id}:`, error)
    throw error
  }
}

// Sponsors
export async function getSponsors() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("sponsors").select("*").order("name")

    if (error) {
      console.error("Error fetching sponsors:", error)
      throw new Error(`Error fetching sponsors: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getSponsors:", error)
    // Return empty array instead of throwing to prevent page from crashing
    return []
  }
}

export async function getSponsor(id: string) {
  try {
    // If the ID is "new" or not a valid UUID, return null
    if (id === "new" || !isValidUUID(id)) {
      return null
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("sponsors").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching sponsor:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getSponsor:", error)
    return null
  }
}

// Update the createSponsor function to use the admin client:
export async function createSponsor(sponsorData: any) {
  try {
    // Use the supabase instance directly
    // This should be the admin client on the server
    const { data, error } = await supabase.from("sponsors").insert(sponsorData).select().single()

    if (error) {
      console.error("Error creating sponsor:", error)
      throw new Error(`Error creating sponsor: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in createSponsor:", error)
    throw error
  }
}

export async function updateSponsor(id: string, sponsorData: any) {
  try {
    const supabase = getSupabaseClient()

    // Update the sponsor
    const { data, error } = await supabase.from("sponsors").update(sponsorData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating sponsor:", error)
      throw new Error(`Error updating sponsor: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateSponsor:", error)
    throw error
  }
}

export async function deleteSponsor(id: string) {
  try {
    const supabase = getSupabaseClient()

    // Delete the sponsor
    const { error } = await supabase.from("sponsors").delete().eq("id", id)

    if (error) {
      console.error("Error deleting sponsor:", error)
      throw new Error(`Error deleting sponsor: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Error in deleteSponsor:", error)
    throw error
  }
}

// Sports
export async function getSports() {
  try {
    const supabase = getSupabaseClient()
    logDbOperation("getSports", "Fetching all sports")

    // Change from sorting by "name" to "created_at" since "name" might not exist
    const { data, error } = await supabase.from("sports").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching sports:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getSports:", error)
    return []
  }
}

export async function getSport(id: string) {
  try {
    logDbOperation("getSport", { id })

    const { data, error } = await supabase.from("sports").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching sport ${id}:`, error)
      throw new Error(`Error fetching sport: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`Error in getSport for ID ${id}:`, error)
    throw error
  }
}

export async function createSport(sport: Omit<Sport, "id" | "createdAt" | "updatedAt">) {
  try {
    logDbOperation("createSport", { sport })

    const { data, error } = await supabase.from("sports").insert([sport]).select()

    if (error) {
      console.error("Error creating sport:", error)
      throw new Error(`Error creating sport: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error("Error in createSport:", error)
    throw error
  }
}

// Elements
export async function getElements() {
  try {
    logDbOperation("getElements", "Fetching all elements")

    const { data, error } = await supabase
      .from("elements")
      .select("*, sponsors:sponsor_id(*)")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching elements:", error)
      throw new Error(`Error fetching elements: ${error.message}`)
    }

    // Transform the data to match our Element interface
    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      sponsorId: item.sponsor_id,
      supportedSports: item.supported_sports || [],
      scriptTemplate: item.script_template,
      isPermanent: item.is_permanent,
      defaultOffset: item.default_offset,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // Include sponsor data if available
      sponsor: item.sponsors,
    }))
  } catch (error) {
    console.error("Error in getElements:", error)
    throw error
  }
}

export async function getElement(id: string) {
  try {
    logDbOperation("getElement", { id })

    const { data, error } = await supabase.from("elements").select("*, sponsors:sponsor_id(*)").eq("id", id).single()

    if (error) {
      console.error(`Error fetching element ${id}:`, error)
      throw new Error(`Error fetching element: ${error.message}`)
    }

    // Transform the data to match our Element interface
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      sponsorId: data.sponsor_id,
      supportedSports: data.supported_sports || [],
      scriptTemplate: data.script_template,
      isPermanent: data.is_permanent,
      defaultOffset: data.default_offset,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // Include sponsor data if available
      sponsor: data.sponsors,
    }
  } catch (error) {
    console.error(`Error in getElement for ID ${id}:`, error)
    throw error
  }
}

export async function createElement(element: Omit<Element, "id" | "createdAt" | "updatedAt">) {
  try {
    logDbOperation("createElement", { element })

    // Transform the data to match the database schema
    const dbElement = {
      name: element.name,
      type: element.type,
      sponsor_id: element.sponsorId,
      supported_sports: element.supportedSports,
      script_template: element.scriptTemplate,
      is_permanent: element.isPermanent,
      default_offset: element.defaultOffset,
    }

    const { data, error } = await supabase.from("elements").insert([dbElement]).select()

    if (error) {
      console.error("Error creating element:", error)
      throw new Error(`Error creating element: ${error.message}`)
    }

    // Transform the response to match our Element interface
    return {
      id: data[0].id,
      name: data[0].name,
      type: data[0].type,
      sponsorId: data[0].sponsor_id,
      supportedSports: data[0].supported_sports || [],
      scriptTemplate: data[0].script_template,
      isPermanent: data[0].is_permanent,
      defaultOffset: data[0].default_offset,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at,
    }
  } catch (error) {
    console.error("Error in createElement:", error)
    throw error
  }
}

export async function updateElement(id: string, element: Partial<Element>) {
  try {
    logDbOperation("updateElement", { id, element })

    // Transform the data to match the database schema
    const dbElement: any = {}
    if (element.name !== undefined) dbElement.name = element.name
    if (element.type !== undefined) dbElement.type = element.type
    if (element.sponsorId !== undefined) dbElement.sponsor_id = element.sponsorId
    if (element.supportedSports !== undefined) dbElement.supported_sports = element.supportedSports
    if (element.scriptTemplate !== undefined) dbElement.script_template = element.scriptTemplate
    if (element.isPermanent !== undefined) dbElement.is_permanent = element.isPermanent
    if (element.defaultOffset !== undefined) dbElement.default_offset = element.defaultOffset

    const { data, error } = await supabase.from("elements").update(dbElement).eq("id", id).select()

    if (error) {
      console.error(`Error updating element ${id}:`, error)
      throw new Error(`Error updating element: ${error.message}`)
    }

    // Transform the response to match our Element interface
    return {
      id: data[0].id,
      name: data[0].name,
      type: data[0].type,
      sponsorId: data[0].sponsor_id,
      supportedSports: data[0].supported_sports || [],
      scriptTemplate: data[0].script_template,
      isPermanent: data[0].is_permanent,
      defaultOffset: data[0].default_offset,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at,
    }
  } catch (error) {
    console.error(`Error in updateElement for ID ${id}:`, error)
    throw error
  }
}

export async function deleteElement(id: string) {
  try {
    logDbOperation("deleteElement", { id })

    // First, update any show_flow_items that use this element
    const { error: showFlowError } = await supabase
      .from("show_flow_items")
      .update({ element_id: null })
      .eq("element_id", id)

    if (showFlowError) {
      console.error(`Error updating show_flow_items for element ${id}:`, showFlowError)
      throw new Error(`Error updating show_flow_items: ${showFlowError.message}`)
    }

    // Delete any element_usage records
    const { error: usageError } = await supabase.from("element_usage").delete().eq("element_id", id)

    if (usageError) {
      console.error(`Error deleting element_usage for element ${id}:`, usageError)
      throw new Error(`Error deleting element_usage: ${usageError.message}`)
    }

    // Delete any element_sports records
    const { error: sportsError } = await supabase.from("element_sports").delete().eq("element_id", id)

    if (sportsError) {
      console.error(`Error deleting element_sports for element ${id}:`, sportsError)
      throw new Error(`Error deleting element_sports: ${sportsError.message}`)
    }

    // Then delete the element
    const { error } = await supabase.from("elements").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting element ${id}:`, error)
      throw new Error(`Error deleting element: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error(`Error in deleteElement for ID ${id}:`, error)
    throw error
  }
}

// Add this function after the getElement function and before getTimelineEvents

/**
 * Retrieves all sponsor elements from the database
 */
export async function getSponsorElements() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("sponsor_elements").select("*").order("name")

  if (error) {
    console.error("Error fetching sponsor elements:", error)
    throw new Error(`Error fetching sponsor elements: ${error.message}`)
  }

  return data || []
}

// Components
export async function getComponent(id: string) {
  try {
    logDbOperation("getComponent", { id })

    const { data, error } = await supabase.from("components").select("*").eq("id", id)

    if (error) {
      console.error(`Error fetching component ${id}:`, error)
      throw new Error(`Error fetching component: ${error.message}`)
    }

    // Check if we got any data back
    if (!data || data.length === 0) {
      console.log(`No component found with ID ${id}`)
      return null
    }

    // If we got multiple rows (shouldn't happen with a primary key), log a warning and return the first one
    if (data.length > 1) {
      console.warn(`Multiple components found with ID ${id}, using the first one`)
    }

    return data[0]
  } catch (error) {
    console.error(`Error in getComponent for ID ${id}:`, error)
    throw error
  }
}

export async function getComponents() {
  try {
    logDbOperation("getComponents", "Fetching all components")

    const { data, error } = await supabase.from("components").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching components:", error)
      throw new Error(`Error fetching components: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getComponents:", error)
    throw error
  }
}

// Timeline Events
export async function createTimelineEvent({
  gameId,
  title,
  description,
  timeOffset,
  elementId,
}: {
  gameId: string
  title: string
  description?: string
  timeOffset: string
  elementId?: string
}) {
  const supabase = createClientComponentClient<Database>()

  console.log("Creating timeline event with data:", {
    game_id: gameId,
    title,
    description,
    time_offset: timeOffset,
    element_id: elementId,
  })

  // Insert the timeline event with only the fields that exist in the table
  const { data, error } = await supabase
    .from("timeline_events")
    .insert({
      game_id: gameId,
      title,
      description,
      time_offset: timeOffset,
      element_id: elementId,
    })
    .select()

  if (error) {
    console.error("Error creating timeline event:", error)
    throw new Error(`Error creating timeline event: ${error.message}`)
  }

  return data
}

// Add the updateTimelineEvent function
export async function updateTimelineEvent(eventData) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("timeline_events")
    .update({
      title: eventData.title,
      description: eventData.description,
      time_offset: eventData.timeOffset,
      element_id: eventData.elementId,
      type: eventData.type,
      is_permanent: eventData.is_permanent,
      sponsor_id: eventData.sponsor_id,
      custom_assets: eventData.custom_assets,
      duration: eventData.duration,
    })
    .eq("id", eventData.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating timeline event:", error)
    throw new Error(`Failed to update timeline event: ${error.message}`)
  }

  return data
}

// Add the updateTimelineEvent function
export async function updateTimelineEvent_old({
  id,
  title,
  description,
  timeOffset,
  elementId,
  gameId,
}: {
  id: string
  title: string
  description?: string
  timeOffset: string
  elementId?: string
  gameId: string
}) {
  const supabase = createClientComponentClient<Database>()

  console.log("Updating timeline event with data:", {
    id,
    title,
    description,
    time_offset: timeOffset,
    element_id: elementId,
    game_id: gameId,
  })

  // Update the timeline event
  const { data, error } = await supabase
    .from("timeline_events")
    .update({
      title,
      description,
      time_offset: timeOffset,
      element_id: elementId,
      game_id: gameId,
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating timeline event:", error)
    throw new Error(`Error updating timeline event: ${error.message}`)
  }

  return data
}

// Get timeline events for a game
export async function getTimelineEvents(gameId: string) {
  const supabase = createClientComponentClient<Database>()

  console.log("Fetching timeline events for game:", gameId)

  // First, fetch the timeline events without trying to join with elements
  const { data: events, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("game_id", gameId)
    .order("time_offset")

  if (error) {
    console.error("Error fetching timeline events:", error)
    throw new Error(`Error fetching timeline events: ${error.message}`)
  }

  // If we have events with element_ids, fetch those elements separately
  if (events && events.length > 0) {
    // Get all unique element IDs
    const elementIds = events.filter((event) => event.element_id).map((event) => event.element_id)

    if (elementIds.length > 0) {
      // Fetch the elements
      const { data: elements, error: elementsError } = await supabase
        .from("elements")
        .select("id, name, type, script_template")
        .in("id", elementIds)

      if (elementsError) {
        console.error("Error fetching elements for timeline events:", elementsError)
        // Don't throw here, just log the error and continue with the events we have
      }

      // If we got elements, attach them to the events
      if (elements && elements.length > 0) {
        // Create a map for quick lookup
        const elementsMap = elements.reduce((map, element) => {
          map[element.id] = element
          return map
        }, {})

        // Attach elements to events
        events.forEach((event) => {
          if (event.element_id && elementsMap[event.element_id]) {
            event.elements = elementsMap[event.element_id]
          }
        })
      }
    }
  }

  return events || []
}

// Delete a timeline event
export async function deleteTimelineEvent(id: string) {
  const supabase = createClientComponentClient<Database>()

  const { error } = await supabase.from("timeline_events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting timeline event:", error)
    throw new Error(`Error deleting timeline event: ${error.message}`)
  }

  return true
}

// Show Flow Items
export async function getShowFlowItems(gameId: string) {
  try {
    logDbOperation("getShowFlowItems", { gameId })

    const { data, error } = await supabase
      .from("show_flow_items")
      .select("*")
      .eq("game_id", gameId)
      .order("item_number", { ascending: true }) // Changed from order_index to item_number

    if (error) {
      console.error(`Error fetching show flow items for game ${gameId}:`, error)
      throw new Error(`Error fetching show flow items: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Error in getShowFlowItems for game ${gameId}:`, error)
    throw error
  }
}

// Create/Update functions

export async function createSeason(season: Omit<Season, "id" | "created_at">) {
  try {
    logDbOperation("createSeason", { season })

    const { data, error } = await supabase.from("seasons").insert([season]).select()

    if (error) {
      console.error("Error creating season:", error)
      throw new Error(`Error creating season: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error("Error in createSeason:", error)
    throw error
  }
}

export async function updateSeason(id: string, season: Partial<Season>) {
  try {
    logDbOperation("updateSeason", { id, season })

    const { data, error } = await supabase.from("seasons").update(season).eq("id", id).select()

    if (error) {
      console.error(`Error updating season ${id}:`, error)
      throw new Error(`Error updating season: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error(`Error in updateSeason for ID ${id}:`, error)
    throw error
  }
}

export async function deleteSeason(id: string) {
  try {
    logDbOperation("deleteSeason", { id })

    // First, delete all games associated with this season
    const { error: gamesError } = await supabase.from("games").delete().eq("season_id", id)

    if (gamesError) {
      console.error(`Error deleting games for season ${id}:`, gamesError)
      throw new Error(`Error deleting games for season: ${gamesError.message}`)
    }

    // Then delete the season
    const { error } = await supabase.from("seasons").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting season ${id}:`, error)
      throw new Error(`Error deleting season: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error(`Error in deleteSeason for ID ${id}:`, error)
    throw error
  }
}

export async function createGame(game: Omit<Game, "id" | "created_at">) {
  try {
    logDbOperation("createGame", { game })

    const gameDate = game.date ? new Date(game.date) : null

    // Create a new game object without the broadcastNetwork field
    const newGame = {
      season_id: game.seasonId,
      title: game.title,
      date: gameDate ? gameDate.toISOString() : game.date,
      event_start_time: game.eventStartTime,
      location: game.location,
      theme: game.theme,
      title_sponsor: game.titleSponsor,
      // Removed broadcast_network/broadcast_channel field
      giveaway: game.giveaway,
      status: game.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Log the schema to help debug
    console.log("Attempting to create game with fields:", Object.keys(newGame))

    const { data, error } = await supabase.from("games").insert([newGame]).select()

    if (error) {
      console.error("Error creating game:", error)
      throw new Error(`Error creating game: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.error("No data returned after creating game")
      throw new Error("No data returned after creating game")
    }

    // Map the database response to our Game type
    const createdGame = {
      id: data[0].id,
      seasonId: data[0].season_id,
      title: data[0].title,
      date: data[0].date,
      eventStartTime: data[0].event_start_time,
      location: data[0].location,
      theme: data[0].theme,
      titleSponsor: data[0].title_sponsor,
      broadcastNetwork: data[0].broadcast_network,
      giveaway: data[0].giveaway,
      status: data[0].status,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      // Add computed fields
      eventCount: 0,
      completedEvents: 0,
    }

    return createdGame
  } catch (error) {
    console.error("Error in createGame:", error)
    throw error
  }
}

export async function updateGame(id: string, game: Partial<Game>) {
  try {
    logDbOperation("updateGame", { id, game })

    const dbUpdates = {
      ...(game.title !== undefined ? { title: game.title } : {}),
      ...(game.date !== undefined ? { date: game.date } : {}),
      ...(game.eventStartTime !== undefined ? { event_start_time: game.eventStartTime } : {}),
      ...(game.location !== undefined ? { location: game.location } : {}),
      ...(game.theme !== undefined ? { theme: game.theme } : {}),
      ...(game.titleSponsor !== undefined ? { title_sponsor: game.titleSponsor } : {}),
      // Removed broadcast_network/broadcast_channel field
      ...(game.giveaway !== undefined ? { giveaway: game.giveaway } : {}),
      ...(game.status !== undefined ? { status: game.status } : {}),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("games").update(dbUpdates).eq("id", id).select()

    if (error) {
      console.error(`Error updating game ${id}:`, error)
      throw new Error(`Error updating game: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.error(`No data returned after updating game ${id}`)
      throw new Error(`No data returned after updating game ${id}`)
    }

    // Map the database response to our Game type
    return {
      id: data[0].id,
      seasonId: data[0].season_id,
      title: data[0].title,
      date: data[0].date,
      eventStartTime: data[0].event_start_time,
      location: data[0].location,
      theme: data[0].theme,
      titleSponsor: data[0].title_sponsor,
      broadcastNetwork: data[0].broadcast_network,
      giveaway: data[0].giveaway,
      status: data[0].status,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      // Add computed fields
      eventCount: 0,
      completedEvents: 0,
    }
  } catch (error) {
    console.error(`Error in updateGame for ID ${id}:`, error)
    throw error
  }
}

export async function deleteGame(id: string) {
  try {
    logDbOperation("deleteGame", { id })

    // First, delete all timeline events and show flow items associated with this game
    const { error: timelineError } = await supabase.from("timeline_events").delete().eq("game_id", id)

    if (timelineError) {
      console.error(`Error deleting timeline events for game ${id}:`, timelineError)
      throw new Error(`Error deleting timeline events: ${timelineError.message}`)
    }

    const { error: showFlowError } = await supabase.from("show_flow_items").delete().eq("game_id", id)

    if (showFlowError) {
      console.error(`Error deleting show flow items for game ${id}:`, showFlowError)
      throw new Error(`Error deleting show flow items: ${showFlowError.message}`)
    }

    // Then delete the game
    const { error } = await supabase.from("games").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting game ${id}:`, error)
      throw new Error(`Error deleting game: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error(`Error in deleteGame for ID ${id}:`, error)
    throw error
  }
}

// Update the createSponsor function to match our form fields
// export async function createSponsor(sponsor: {
//   name: string
//   logo_url?: string
//   brand_color?: string
//   contact_name?: string
//   contact_email?: string
//   contact_phone?: string
//   notes?: string
//   start_date?: string
//   end_date?: string
//   sports?: string[]
//   seasons?: string[]
//   deliverables?: any[]
// }) {
//   try {
//     logDbOperation("createSponsor", { sponsor })

//     const { data, error } = await supabase.from("sponsors").insert([sponsor]).select()

//     if (error) {
//       console.error("Error creating sponsor:", error)
//       throw new Error(`Error creating sponsor: ${error.message}`)
//     }

//     return data?.[0]
//   } catch (error) {
//     console.error("Error in createSponsor:", error)
//     throw error
//   }
// }

// export async function updateSponsor(id: string, sponsor: Partial<Sponsor>) {
//   try {
//     logDbOperation("updateSponsor", { id, sponsor })

//     const { data, error } = await supabase.from("sponsors").update(sponsor).eq("id", id).select()

//     if (error) {
//       console.error(`Error updating sponsor ${id}:`, error)
//       throw new Error(`Error updating sponsor: ${error.message}`)
//     }

//     return data?.[0]
//   } catch (error) {
//     console.error(`Error in updateSponsor for ID ${id}:`, error)
//     throw error
//   }
// }

