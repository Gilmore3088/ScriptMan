"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ElementBuilder } from "@/components/element-builder"
import type { GameElement } from "@/types/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ElementsNavigation } from "@/components/elements-navigation"

export default function ElementPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === "new"
  const [element, setElement] = useState<GameElement | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

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

  useEffect(() => {
    if (!isNew) {
      fetchElement()
    }
  }, [id, isNew])

  const fetchElement = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("game_elements").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      console.log("Fetched element:", data)
      setElement(data)
    } catch (err) {
      console.error("Error fetching element:", err)
      setError(`Error fetching element: ${err instanceof Error ? err.message : String(err)}`)
      toast({
        title: "Error",
        description: `Failed to load element: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (elementData: Partial<GameElement>): Promise<boolean> => {
    setSaving(true)
    try {
      console.log("Saving element:", elementData)

      // Add updated_at timestamp
      const dataWithTimestamp = {
        ...elementData,
        updated_at: new Date().toISOString(),
      }

      let result

      if (isNew) {
        // Create a new element
        result = await supabase.from("game_elements").insert(dataWithTimestamp).select()
      } else {
        // Update existing element
        result = await supabase.from("game_elements").update(dataWithTimestamp).eq("id", id).select()
      }

      const { data, error } = result

      if (error) {
        console.error(`Error ${isNew ? "creating" : "updating"} element:`, error)
        toast({
          title: "Error",
          description: `Failed to ${isNew ? "create" : "update"} element: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      console.log(`Element ${isNew ? "created" : "updated"} successfully:`, data)
      toast({
        title: "Success",
        description: `Element ${isNew ? "created" : "updated"} successfully`,
      })

      // Navigate back to the elements library
      router.push("/elements")
      return true
    } catch (err) {
      console.error(`Exception ${isNew ? "creating" : "updating"} element:`, err)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} element: ${err instanceof Error ? err.message : String(err)}`,
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />
        </div>
      </div>
    )
  }

  if (error && !isNew) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <ElementsNavigation />
      <ElementBuilder
        element={element}
        onSave={handleSave}
        onCancel={handleCancel}
        elementTypes={elementTypes}
        allSports={allSports}
        isNew={isNew}
      />
    </div>
  )
}

