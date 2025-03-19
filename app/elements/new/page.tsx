"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ElementBuilder } from "@/components/element-builder"
import type { GameElement } from "@/types/supabase"
import { useToast } from "@/hooks/use-toast"

export default function NewElementPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // Element types and sports
  const elementTypes = [
    "Sponsor Read",
    "Permanent Marker",
    "Generic Event",
    "Promo",
    "Announcement",
    "Timeout",
    "Commercial Break",
    "Player Introduction",
    "Team Introduction",
    "Weather Update",
    "Score Update",
    "Statistics",
  ]

  const allSports = [
    "Football",
    "Basketball",
    "Soccer",
    "Baseball",
    "Volleyball",
    "Hockey",
    "Track & Field",
    "Swimming",
    "Tennis",
    "Golf",
  ]

  const handleSave = async (elementData: Partial<GameElement>): Promise<boolean> => {
    setSaving(true)
    try {
      console.log("Saving element:", elementData)

      // Add created_at and updated_at timestamps
      const now = new Date().toISOString()
      const dataWithTimestamps = {
        ...elementData,
        created_at: now,
        updated_at: now,
      }

      const { data, error } = await supabase.from("game_elements").insert([dataWithTimestamps]).select()

      if (error) {
        console.error("Error saving element:", error)
        toast({
          title: "Error",
          description: `Failed to save element: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      console.log("Element saved successfully:", data)
      toast({
        title: "Success",
        description: "Element created successfully",
      })

      // Navigate back to the elements library
      router.push("/elements")
      return true
    } catch (err) {
      console.error("Exception saving element:", err)
      toast({
        title: "Error",
        description: `Failed to save element: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/elements")
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <ElementBuilder
        element={null}
        onSave={handleSave}
        onCancel={handleCancel}
        elementTypes={elementTypes}
        allSports={allSports}
      />
    </div>
  )
}

