import { supabase } from "./supabase"
import type { Season, Game, Sponsor, Element, TimelineEvent, ShowFlowItem, Sport, ElementUsage } from "./types"

// Debug helper function
function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, details)
}

// Seasons
export async function getSeasons() {
  try {
    logDbOperation("getSeasons", "Fetching all seasons")

    const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching seasons:", error)
      throw new Error(`Error fetching seasons: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getSeasons:", error)
    throw error
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
    logDbOperation("getSponsors", "Fetching all sponsors")

    const { data, error } = await supabase.from("sponsors").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching sponsors:", error)
      throw new Error(`Error fetching sponsors: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getSponsors:", error)
    throw error
  }
}

export async function getSponsor(id: string) {
  try {
    logDbOperation("getSponsor", { id })

    const { data, error } = await supabase.from("sponsors").select("*").eq("id", id)

    if (error) {
      console.error(`Error fetching sponsor ${id}:`, error)
      throw new Error(`Error fetching sponsor: ${error.message}`)
    }

    // Check if we got any data back
    if (!data || data.length === 0) {
      console.log(`No sponsor found with ID ${id}`)
      return null
    }

    // If we got multiple rows (shouldn't happen with a primary key), log a warning and return the first one
    if (data.length > 1) {
      console.warn(`Multiple sponsors found with ID ${id}, using the first one`)
    }

    return data[0]
  } catch (error) {
    console.error(`Error in getSponsor for ID ${id}:`, error)
    throw error
  }
}

// Sports
export async function getSports() {
  try {
    logDbOperation("getSports", "Fetching all sports")

    const { data, error } = await supabase.from("sports").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching sports:", error)
      throw new Error(`Error fetching sports: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getSports:", error)
    throw error
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
export async function getTimelineEvents(gameId: string) {
  try {
    logDbOperation("getTimelineEvents", { gameId })

    const { data, error } = await supabase
      .from("timeline_events")
      .select("*")
      .eq("game_id", gameId)
      .order("start_time", { ascending: true })

    if (error) {
      console.error(`Error fetching timeline events for game ${gameId}:`, error)
      throw new Error(`Error fetching timeline events: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Error in getTimelineEvents for game ${gameId}:`, error)
    throw error
  }
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

export async function createSponsor(sponsor: Omit<Sponsor, "id" | "created_at">) {
  try {
    logDbOperation("createSponsor", { sponsor })

    const { data, error } = await supabase.from("sponsors").insert([sponsor]).select()

    if (error) {
      console.error("Error creating sponsor:", error)
      throw new Error(`Error creating sponsor: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error("Error in createSponsor:", error)
    throw error
  }
}

export async function updateSponsor(id: string, sponsor: Partial<Sponsor>) {
  try {
    logDbOperation("updateSponsor", { id, sponsor })

    const { data, error } = await supabase.from("sponsors").update(sponsor).eq("id", id).select()

    if (error) {
      console.error(`Error updating sponsor ${id}:`, error)
      throw new Error(`Error updating sponsor: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error(`Error in updateSponsor for ID ${id}:`, error)
    throw error
  }
}

export async function deleteSponsor(id: string) {
  try {
    logDbOperation("deleteSponsor", { id })

    // Update any games that use this sponsor to use null instead
    const { error: gamesError } = await supabase.from("games").update({ sponsor_id: null }).eq("sponsor_id", id)

    if (gamesError) {
      console.error(`Error updating games for sponsor ${id}:`, gamesError)
      throw new Error(`Error updating games for sponsor: ${gamesError.message}`)
    }

    // Then delete the sponsor
    const { error } = await supabase.from("sponsors").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting sponsor ${id}:`, error)
      throw new Error(`Error deleting sponsor: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error(`Error in deleteSponsor for ID ${id}:`, error)
    throw error
  }
}

// Element Usage
export async function getElementUsage(elementId: string) {
  try {
    logDbOperation("getElementUsage", { elementId })

    const { data, error } = await supabase
      .from("element_usage")
      .select("*, games:game_id(*)")
      .eq("element_id", elementId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching usage for element ${elementId}:`, error)
      throw new Error(`Error fetching element usage: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Error in getElementUsage for element ${elementId}:`, error)
    throw error
  }
}

export async function createElementUsage(usage: Omit<ElementUsage, "id" | "createdAt">) {
  try {
    logDbOperation("createElementUsage", { usage })

    // Transform the data to match the database schema
    const dbUsage = {
      element_id: usage.elementId,
      game_id: usage.gameId,
      show_flow_item_id: usage.showFlowItemId,
      placeholders: usage.placeholders,
    }

    const { data, error } = await supabase.from("element_usage").insert([dbUsage]).select()

    if (error) {
      console.error("Error creating element usage:", error)
      throw new Error(`Error creating element usage: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error("Error in createElementUsage:", error)
    throw error
  }
}

// Update the createTimelineEvent function to only use columns that exist in the database
export async function createTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at">) {
  try {
    logDbOperation("createTimelineEvent", { event })

    // Let's log the event to see what fields we're trying to insert
    console.log("Timeline event to create:", event)

    // Map the TimelineEvent interface to the database schema
    // Only include fields that are confirmed to exist in the database
    const dbEvent = {
      game_id: event.gameId,
      start_time: event.startTime,
      title: event.title,
      category: event.category,
      notes: event.notes,
      clock_ref: event.clockRef,
      // Removed fields that don't exist in the database:
      // - location
      // - end_time
      // - components
      // - audio_notes
    }

    // Log what we're actually inserting
    console.log("Inserting into timeline_events:", dbEvent)

    const { data, error } = await supabase.from("timeline_events").insert([dbEvent]).select()

    if (error) {
      console.error("Error creating timeline event:", error)
      throw new Error(`Error creating timeline event: ${error.message}`)
    }

    // Map the database response back to our TimelineEvent type
    if (data && data.length > 0) {
      return {
        id: data[0].id,
        gameId: data[0].game_id,
        startTime: data[0].start_time,
        endTime: event.endTime, // Use the original endTime since it's not stored in DB
        title: data[0].title,
        category: data[0].category,
        location: event.location, // Keep this in the returned object even though it's not in DB
        notes: data[0].notes,
        audioNotes: event.audioNotes, // Keep the original audioNotes since it's not stored in DB
        clockRef: data[0].clock_ref,
        components: [], // Since we're not storing components, return an empty array
        createdAt: data[0].created_at,
      }
    }

    throw new Error("No data returned after creating timeline event")
  } catch (error) {
    console.error("Error in createTimelineEvent:", error)
    throw error
  }
}

export async function updateTimelineEvent(id: string, event: Partial<TimelineEvent>) {
  try {
    logDbOperation("updateTimelineEvent", { id, event })

    const { data, error } = await supabase.from("timeline_events").update(event).eq("id", id).select()

    if (error) {
      console.error(`Error updating timeline event ${id}:`, error)
      throw new Error(`Error updating timeline event: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error(`Error in updateTimelineEvent for ID ${id}:`, error)
    throw error
  }
}

export async function deleteTimelineEvent(id: string) {
  try {
    logDbOperation("deleteTimelineEvent", { id })

    const { error } = await supabase.from("timeline_events").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting timeline event ${id}:`, error)
      throw new Error(`Error deleting timeline event: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error(`Error in deleteTimelineEvent for ID ${id}:`, error)
    throw error
  }
}

// Update the createShowFlowItem and updateShowFlowItem functions to handle elementId

export async function createShowFlowItem(item: Omit<ShowFlowItem, "id" | "createdAt" | "updatedAt">) {
  try {
    logDbOperation("createShowFlowItem", { item })

    // Map the ShowFlowItem interface to the database schema
    const dbItem = {
      game_id: item.gameId,
      item_number: item.itemNumber,
      start_time: item.startTime,
      preset_time: item.presetTime,
      duration: item.duration,
      clock_ref: item.clockRef,
      location: item.location,
      audio_notes: item.audioNotes,
      script_read: item.scriptRead,
      board_look: item.boardLook,
      category: item.category,
      private_notes: item.privateNotes,
      element_id: item.elementId, // Add element_id
    }

    const { data, error } = await supabase.from("show_flow_items").insert([dbItem]).select()

    if (error) {
      console.error("Error creating show flow item:", error)
      throw new Error(`Error creating show flow item: ${error.message}`)
    }

    // If this item is linked to an element, create an element_usage record
    if (item.elementId) {
      await createElementUsage({
        elementId: item.elementId,
        gameId: item.gameId,
        showFlowItemId: data[0].id,
        placeholders: {}, // You would populate this with actual placeholders
      })
    }

    return data?.[0]
  } catch (error) {
    console.error("Error in createShowFlowItem:", error)
    throw error
  }
}

export async function updateShowFlowItem(id: string, item: Partial<ShowFlowItem>) {
  try {
    logDbOperation("updateShowFlowItem", { id, item })

    // Map the ShowFlowItem interface to the database schema
    const dbUpdates: any = {}

    if (item.gameId !== undefined) dbUpdates.game_id = item.gameId
    if (item.itemNumber !== undefined) dbUpdates.item_number = item.itemNumber
    if (item.startTime !== undefined) dbUpdates.start_time = item.startTime
    if (item.presetTime !== undefined) dbUpdates.preset_time = item.presetTime
    if (item.duration !== undefined) dbUpdates.duration = item.duration
    if (item.clockRef !== undefined) dbUpdates.clock_ref = item.clockRef
    if (item.location !== undefined) dbUpdates.location = item.location
    if (item.audioNotes !== undefined) dbUpdates.audio_notes = item.audioNotes
    if (item.scriptRead !== undefined) dbUpdates.script_read = item.scriptRead
    if (item.boardLook !== undefined) dbUpdates.board_look = item.boardLook
    if (item.category !== undefined) dbUpdates.category = item.category
    if (item.privateNotes !== undefined) dbUpdates.private_notes = item.privateNotes
    if (item.elementId !== undefined) dbUpdates.element_id = item.elementId // Add element_id

    const { data, error } = await supabase.from("show_flow_items").update(dbUpdates).eq("id", id).select()

    if (error) {
      console.error(`Error updating show flow item ${id}:`, error)
      throw new Error(`Error updating show flow item: ${error.message}`)
    }

    // If the element_id has changed, update the element_usage records
    if (item.elementId !== undefined) {
      // First, get the current show flow item to get the game_id
      const { data: currentItem } = await supabase.from("show_flow_items").select("game_id").eq("id", id).single()

      if (item.elementId) {
        // Check if there's already an element_usage record for this show_flow_item
        const { data: existingUsage } = await supabase
          .from("element_usage")
          .select("id")
          .eq("show_flow_item_id", id)
          .maybeSingle()

        if (existingUsage) {
          // Update the existing record
          await supabase.from("element_usage").update({ element_id: item.elementId }).eq("id", existingUsage.id)
        } else {
          // Create a new element_usage record
          await createElementUsage({
            elementId: item.elementId,
            gameId: currentItem.game_id,
            showFlowItemId: id,
            placeholders: {}, // You would populate this with actual placeholders
          })
        }
      } else {
        // If element_id is null, delete any element_usage records for this show_flow_item
        await supabase.from("element_usage").delete().eq("show_flow_item_id", id)
      }
    }

    return data?.[0]
  } catch (error) {
    console.error(`Error in updateShowFlowItem for ID ${id}:`, error)
    throw error
  }
}

// Helper function to process placeholders in a template
export function processTemplate(template: string, placeholders: Record<string, string>): string {
  if (!template) return ""

  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return placeholders[key] || match
  })
}

// Asset functions
export async function uploadAsset(file: File, path: string) {
  try {
    logDbOperation("uploadAsset", { fileName: file.name, path })

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage.from("assets").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading asset:", error)
      throw new Error(`Error uploading asset: ${error.message}`)
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(path)

    // Create an asset record in the database
    const assetRecord = {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      path: path,
      url: urlData.publicUrl,
      created_at: new Date().toISOString(),
    }

    const { data: assetData, error: assetError } = await supabase.from("assets").insert([assetRecord]).select()

    if (assetError) {
      console.error("Error creating asset record:", assetError)
      throw new Error(`Error creating asset record: ${assetError.message}`)
    }

    return {
      id: assetData[0].id,
      fileName: assetData[0].file_name,
      fileType: assetData[0].file_type,
      fileSizeBytes: assetData[0].file_size,
      path: assetData[0].path,
      url: assetData[0].url,
      uploadedAt: assetData[0].created_at,
    }
  } catch (error) {
    console.error("Error in uploadAsset:", error)
    throw error
  }
}

export async function linkAssetToShowFlow(showFlowItemId: string, assetId: string) {
  try {
    logDbOperation("linkAssetToShowFlow", { showFlowItemId, assetId })

    // Create a record in the show_flow_assets junction table
    const linkRecord = {
      show_flow_item_id: showFlowItemId,
      asset_id: assetId,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("show_flow_assets").insert([linkRecord])

    if (error) {
      console.error("Error linking asset to show flow:", error)
      throw new Error(`Error linking asset to show flow: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Error in linkAssetToShowFlow:", error)
    throw error
  }
}

export async function linkElementToShowFlow(showFlowItemId: string, elementId: string) {
  try {
    logDbOperation("linkElementToShowFlow", { showFlowItemId, elementId })

    // Create a record in the show_flow_elements junction table
    const linkRecord = {
      show_flow_item_id: showFlowItemId,
      element_id: elementId,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("show_flow_elements").insert([linkRecord])

    if (error) {
      console.error("Error linking element to show flow:", error)
      throw new Error(`Error linking element to show flow: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Error in linkElementToShowFlow:", error)
    throw error
  }
}

// Update the bulkShiftTimelineEvents function to only update columns that exist
export async function bulkShiftTimelineEvents(gameId: string, shiftSeconds: number) {
  try {
    logDbOperation("bulkShiftTimelineEvents", { gameId, shiftSeconds })

    // First, get all timeline events for this game
    const { data: events, error: fetchError } = await supabase.from("timeline_events").select("*").eq("game_id", gameId)

    if (fetchError) {
      console.error(`Error fetching timeline events for game ${gameId}:`, fetchError)
      throw new Error(`Error fetching timeline events: ${fetchError.message}`)
    }

    if (!events || events.length === 0) {
      console.log(`No timeline events found for game ${gameId}`)
      return 0
    }

    // Update each event with the new time
    const updates = events.map((event) => ({
      id: event.id,
      start_time: Math.max(0, event.start_time + shiftSeconds), // Ensure time doesn't go negative
      // Removed end_time since it doesn't exist in the database
    }))

    // Perform the updates in batches
    const batchSize = 100
    let updatedCount = 0

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)

      for (const update of batch) {
        const { error } = await supabase
          .from("timeline_events")
          .update({
            start_time: update.start_time,
            // Removed end_time
          })
          .eq("id", update.id)

        if (error) {
          console.error(`Error updating timeline event ${update.id}:`, error)
        } else {
          updatedCount++
        }
      }
    }

    return updatedCount
  } catch (error) {
    console.error(`Error in bulkShiftTimelineEvents for game ${gameId}:`, error)
    throw error
  }
}

export async function getGamesBySponsor(sponsorId: string) {
  try {
    logDbOperation("getGamesBySponsor", { sponsorId })

    const { data, error } = await supabase
      .from("games")
      .select("*, seasons:season_id(*)")
      .eq("sponsor_id", sponsorId)
      .order("date", { ascending: false })

    if (error) {
      console.error(`Error fetching games for sponsor ${sponsorId}:`, error)
      throw new Error(`Error fetching games: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Error in getGamesBySponsor for sponsor ${sponsorId}:`, error)
    throw error
  }
}

// Element Usage
export async function getTimelineEventsByElement(elementId: string) {
  try {
    logDbOperation("getTimelineEventsByElement", { elementId })

    const { data, error } = await supabase
      .from("timeline_events")
      .select("*, games:game_id(*)")
      .eq("element_id", elementId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error fetching usage for element ${elementId}:`, error)
      throw new Error(`Error fetching element usage: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Error in getTimelineEventsByElement for element ${elementId}:`, error)
    throw error
  }
}

// Test connection
export async function testConnection() {
  try {
    logDbOperation("testConnection", "Testing database connection")

    const startTime = Date.now()
    const { data, error } = await supabase.from("seasons").select("count")
    const endTime = Date.now()

    if (error) {
      console.error("Error testing connection:", error)
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        latency: null,
      }
    }

    return {
      success: true,
      message: "Connection successful",
      latency: endTime - startTime,
      count: data?.[0]?.count,
    }
  } catch (error) {
    console.error("Error in testConnection:", error)
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
      latency: null,
    }
  }
}

// Function to inspect the database schema
export async function inspectDatabaseSchema() {
  try {
    // Get the schema for the games table
    const { data, error } = await supabase.rpc("get_schema_info", { table_name: "games" })

    if (error) {
      console.error("Error inspecting schema:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in inspectDatabaseSchema:", error)
    return null
  }
}

export async function testElementsSchema() {
  try {
    logDbOperation("testElementsSchema", "Testing elements schema")

    // Try to fetch all elements
    const { data: elements, error: elementsError } = await supabase.from("elements").select("*").limit(5)

    if (elementsError) {
      console.error("Error fetching elements:", elementsError)
      return { success: false, message: elementsError.message }
    }

    // Try to fetch all sports
    const { data: sports, error: sportsError } = await supabase.from("sports").select("*").limit(5)

    if (sportsError) {
      console.error("Error fetching sports:", sportsError)
      return { success: false, message: sportsError.message }
    }

    return {
      success: true,
      message: "Successfully connected to elements schema",
      elements: elements || [],
      sports: sports || [],
      elementsCount: elements?.length || 0,
      sportsCount: sports?.length || 0,
    }
  } catch (error) {
    console.error("Error testing elements schema:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

