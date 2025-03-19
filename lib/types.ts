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

// New Sponsor interface for the Sponsorship Roster
export interface Sponsor {
  id: string
  name: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  brandGuidelines?: string
  contractNotes?: string
  startDate?: string
  endDate?: string
  // Deliverables
  mentionsPerGame?: number
  totalMentionsRequired?: number
  scoreboardAdsPerGame?: number
  totalScoreboardAdsRequired?: number
  halftimeReadsPerGame?: number
  totalHalftimeReadsRequired?: number
  otherDeliverables?: string
  customDeliverables?: CustomDeliverable[] // Add this new field
  // Status
  status: "active" | "inactive" | "pending" | "completed"
  createdAt: string
  updatedAt: string
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

// Timeline event interface (derived from ShowFlowItem)
export interface TimelineEvent {
  id: string
  gameId: string
  startTime: number // Seconds from game start
  endTime?: number // Seconds from game start
  title: string
  components?: string[]
  notes?: string
  audioNotes?: string // Add this line
  clockRef?: string
  category: string
  location?: string
  createdAt?: string
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

