export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      elements: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          period: string
          sponsor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          period: string
          sponsor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          period?: string
          sponsor_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          script_id: string
          title: string
          start_time: string
          duration: number
          period: string
          location: string | null
          audio_notes: string | null
          clock_reference: string | null
          notes: string | null
          element_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          script_id: string
          title: string
          start_time: string
          duration: number
          period: string
          location?: string | null
          audio_notes?: string | null
          clock_reference?: string | null
          notes?: string | null
          element_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          script_id?: string
          title?: string
          start_time?: string
          duration?: number
          period?: string
          location?: string | null
          audio_notes?: string | null
          clock_reference?: string | null
          notes?: string | null
          element_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sponsors: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

