import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }
  return supabaseInstance
}

export function formatTimeOffset(timeOffset: number): string {
  const minutes = Math.floor(timeOffset / 60000)
  const seconds = Math.floor((timeOffset % 60000) / 1000)

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Process a template string by replacing placeholders with values
 * @param template The template string with placeholders like {sport}
 * @param placeholders An object mapping placeholder names to values
 * @returns The processed string with placeholders replaced
 */
export function processTemplate(template: string, placeholders: Record<string, string>): string {
  if (!template) return ""

  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return placeholders[key] || match
  })
}

/**
 * Extract placeholders from a template string
 * @param template The template string with placeholders like {sport}
 * @returns An array of placeholder names without the braces
 */
export function extractPlaceholders(template: string): string[] {
  if (!template) return []

  const placeholders: string[] = []
  const regex = /\{([^}]+)\}/g
  let match

  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1])
  }

  return placeholders
}

/**
 * Validates if a string is a valid UUID
 * @param uuid The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

