"use server"

import { createSponsor } from "@/lib/db"
import { createClient } from "@/utils/supabase/server"

const supabase = createClient()

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Update the bulkCreateSponsors function to handle RLS
export async function bulkCreateSponsors(sponsors: any[]) {
  try {
    console.log(`Attempting to create ${sponsors.length} sponsors`)

    const results = []
    const errors = []

    // Process sponsors sequentially with a delay to avoid rate limiting
    for (let i = 0; i < sponsors.length; i++) {
      try {
        // Add a small delay between requests to avoid overwhelming the API
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        const sponsor = sponsors[i]
        const result = await createSponsor(sponsor)
        results.push(result)
        console.log(`Created sponsor ${i + 1}/${sponsors.length}: ${sponsor.name}`)
      } catch (error) {
        console.error(`Error creating sponsor ${i + 1}/${sponsors.length}:`, error)
        errors.push({
          index: i,
          sponsor: sponsors[i],
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return {
      success: errors.length === 0,
      created: results.length,
      total: sponsors.length,
      results,
      errors,
    }
  } catch (error) {
    console.error("Error in bulkCreateSponsors:", error)
    throw error
  }
}

// Find the function that creates or updates timeline events (likely named something like createTimelineEvent or updateTimelineEvent)
// Modify it to explicitly specify the fields being inserted or updated, omitting 'location'

// For example, if there's a function like:
export async function saveTimelineEvent(formData: any) {
  // Extract only the fields that exist in the database schema
  const {
    id,
    game_id,
    title,
    description,
    start_time,
    end_time,
    element_id,
    element_type, // Make sure this is 'element_type', not 'type'
    sponsor_id,
    theme_id,
    status,
    notes,
    created_by,
    updated_by,
  } = formData

  // Then use these specific fields in your insert/update
  const { data, error } = await supabase.from("timeline_events").upsert({
    id,
    game_id,
    title,
    description,
    start_time,
    end_time,
    element_id,
    element_type, // Make sure this is 'element_type', not 'type'
    sponsor_id,
    theme_id,
    status,
    notes,
    created_by,
    updated_by,
  })
}

