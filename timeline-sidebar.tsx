"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElementCard } from "@/components/element-card"
import { getSupabaseClient } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export function TimelineSidebar({ gameId, onElementDragStart }) {
  const [elements, setElements] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("elements")
  const { toast } = useToast()

  // Fetch elements and sponsors on component mount
  useEffect(() => {
    fetchElements()
    fetchSponsors()
  }, [])

  const fetchElements = async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("elements").select("*")

      if (error) throw error
      setElements(data || [])
    } catch (error) {
      console.error("Error fetching elements:", error)
      toast({
        title: "Error",
        description: "Failed to load elements",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSponsors = async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("sponsors").select("*")

      if (error) throw error

      // Transform sponsors into elements for consistent handling
      const sponsorElements = data.map((sponsor) => ({
        id: `sponsor-${sponsor.id}`,
        name: sponsor.name,
        description: sponsor.description || "",
        element_type: "sponsor_read",
        category: "sponsor_read",
        default_lane: "sponsor_reads",
        sponsor_id: sponsor.id,
        duration: 30, // Default duration for sponsor reads
      }))

      setSponsors(sponsorElements || [])
    } catch (error) {
      console.error("Error fetching sponsors:", error)
      toast({
        title: "Error",
        description: "Failed to load sponsors",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter elements based on search query
  const filteredElements = elements.filter(
    (element) =>
      element.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter sponsors based on search query
  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      sponsor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDragStart = (e, element) => {
    e.dataTransfer.setData("application/json", JSON.stringify(element))
    if (onElementDragStart) {
      onElementDragStart(element)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Element Library</h3>

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <Tabs defaultValue="elements" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredElements.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredElements.map((element) => (
                <div
                  key={element.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, element)}
                  className="cursor-grab"
                >
                  <ElementCard element={element} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-4">
              {searchQuery ? "No elements match your search" : "No elements found"}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sponsors" className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSponsors.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sponsor)}
                  className="cursor-grab"
                >
                  <ElementCard element={sponsor} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-4">
              {searchQuery ? "No sponsors match your search" : "No sponsors found"}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TimelineSidebar

