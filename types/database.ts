// Add this to your existing types file

export interface ElementType {
  id: number
  created_at?: string
  name: string
  type: string
  supported_sports: string[]
  script_template: string
  is_permanent: boolean
  default_offset: string | null
}

export interface Sport {
  id: number
  name: string
  created_at?: string
}

