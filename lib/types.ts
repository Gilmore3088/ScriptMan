// Core entity types
export interface Season {
  id: string
  title: string
  sport: string // Keep for backward compatibility
  sportId: string | null // Add this field
  year: number
  description?: string
  status?: string
  gameCount?: number
  completedGames?: number
  createdAt: string
  updatedAt: string
}

export interface Game {
  id: string
  seasonId: string
  title: string
  date: string
  eventStartTime?: string
  location: string
  theme?: string
  titleSponsor?: string
  broadcastNetwork?: string
  giveaway?: string
  status?: "upcoming" | "completed" | "in-progress"
  eventCount?: number
  completedEvents?: number
  createdAt: string
  updatedAt: string
}

export interface ShowFlowItem {
  id: string
  gameId: string
  itemNumber: number
  startTime: string
  presetTime: string | null
  duration: string | null
  clockRef: string | null
  location: string | null
  audioNotes: string | null
  scriptRead: string | null
  boardLook: string | null
  category: string | null
  privateNotes: string | null
  elementId: string | null // Added this field
  createdAt: string
  updatedAt: string
}

export interface Component {
  id: string
  name: string
  type: string
  version: number
  isGlobal: boolean
  description?: string
  content?: string
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: string
  fileName: string
  fileType: string
  fileSizeBytes: number
  url: string
  uploadedAt: string
}

// Add this to your existing types.ts file

export interface Deliverable {
  type: string
  description: string
  quantity: number
  unitLabel?: string
  fulfilled?: number
}

export interface Sponsor {
  id: string
  name: string
  logo?: string
  brandColor?: string
  sports?: string[]
  seasons?: string[]
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  contractNotes?: string
  startDate?: string
  endDate?: string
  deliverables?: Deliverable[]
  createdAt?: string
  updatedAt?: string
}

// Add this new interface after the Sponsor interface:
export interface CustomDeliverable {
  id: string
  name: string
  description?: string
  perGame?: number
  totalRequired?: number
  completed?: number
  type?: "audio" | "visual" | "digital" | "print" | "other"
}

// New interface for tracking sponsor usage
export interface SponsorUsage {
  sponsorId: string
  gameId: string
  elementId: string
  usageType: "mention" | "scoreboard_ad" | "halftime_read" | "other"
  usageDate: string
  notes?: string
  createdAt: string
}

// New Element interface for the Element Library
export interface Element {
  id: string
  name: string
  type: string // 'Sponsor Read', 'Permanent Marker', 'Generic Event', etc.
  sponsorId: string | null
  supportedSports: string[] // Array of sport names
  scriptTemplate: string | null
  isPermanent: boolean
  defaultOffset: string | null
  createdAt: string
  updatedAt: string
}

// Join table interfaces
export interface EventComponent {
  id: string
  showFlowId: string
  componentId: string
}

export interface ShowFlowAsset {
  id: string
  showFlowId: string
  assetId: string
}

export interface ComponentAsset {
  id: string
  componentId: string
  assetId: string
}

export interface ElementAsset {
  id: string
  elementId: string
  assetId: string
}

// Add this to your types.ts file if it doesn't already exist
export interface TimelineEvent {
  id: string
  game_id: string
  title: string
  start_time: number
  duration: number
  category?: string
  description?: string
  sponsor_id?: string
  element_id?: string
  created_at: string
  updated_at: string
  time_offset?: string
  // This will be populated by our getTimelineEvents function
  elements?: {
    id: string
    name: string
    type: string
    script_template?: string
  }
}

// Activity interface for tracking user actions
export interface Activity {
  id: string
  action: string
  timestamp: string
  user: string
  entityId?: string
  entityType?: "season" | "game" | "showFlow" | "component" | "asset" | "element" | "sponsor"
}

export interface Sport {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ElementUsage {
  id: string
  elementId: string
  gameId: string
  showFlowItemId: string | null
  placeholders: Record<string, string> // e.g., {"sport": "football"}
  createdAt: string
}

