"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface SponsorBuilderProps {
  sponsor?: {
    id: string
    name: string
    description: string
  }
  isNew?: boolean
}

export function SponsorBuilder({ sponsor, isNew = false }: SponsorBuilderProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [name, setName] = useState(sponsor?.name || "")
  const [description, setDescription] = useState(sponsor?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Error",
        description: "Sponsor name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isNew) {
        // Create new sponsor
        const { error } = await supabase.from("sponsors").insert({
          name,
          description,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Sponsor created successfully",
        })
      } else {
        // Update existing sponsor
        const { error } = await supabase
          .from("sponsors")
          .update({
            name,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sponsor?.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Sponsor updated successfully",
        })
      }

      router.push("/sponsors")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving sponsor:", error)
      toast({
        title: "Error",
        description: `Error ${isNew ? "creating" : "updating"} sponsor: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Sponsor Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter sponsor name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter sponsor description"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/sponsors")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isNew ? "Create Sponsor" : "Update Sponsor"}
        </Button>
      </div>
    </form>
  )
}

