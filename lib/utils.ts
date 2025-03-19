import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

