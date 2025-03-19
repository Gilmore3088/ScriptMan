export interface GameElement {
  id: string
  name: string
  description: string | null
  type: string
  script_template: string | null
  supported_sports: string[] | null
  sponsor_id: string | null
  sponsor_name: string | null
  is_permanent_marker: boolean
  default_offset: string | null
  lock_offset: boolean
  created_at: string
  updated_at: string
}

export interface Sponsor {
  id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

