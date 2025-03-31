"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/utils/supabase-singleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ElementsSidebar({ onElementSelect, gameId }) {
  const [elements, setElements] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Get the singleton Supabase client
  const supabase = getSupabaseClient()

  // Fetch elements and sponsors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch elements
        const { data: elementsData, error: elementsError } = await supabase.from("elements").select("*").order("name")

        if (elementsError) {
          console.error("Error fetching elements:", elementsError)
          setError(`Failed to load elements: ${elementsError.message}`)
          return
        }

        // Fetch sponsors
        const { data: sponsorsData, error: sponsorsError } = await supabase.from("sponsors").select("*").order("name")

        if (sponsorsError) {
          console.error("Error fetching sponsors:", sponsorsError)
          setError(`Failed to load sponsors: ${sponsorsError.message}`)
          return
        }

        // Group elements by type
        const groupedElements = elementsData.reduce((acc, element) => {
          const type = element.type || "Other"
          if (!acc[type]) {
            acc[type] = []
          }
          acc[type].push(element)
          return acc
        }, {})

        setElements(groupedElements)
        setSponsors(sponsorsData || [])
      } catch (err) {
        console.error("Exception fetching data:", err)
        setError(`An unexpected error occurred: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Filter elements based on search query
  const filteredElements = Object.entries(elements).reduce((acc, [type, items]) => {
    if (searchQuery) {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.script_template && item.script_template.toLowerCase().includes(searchQuery.toLowerCase())),
      )

      if (filtered.length > 0) {
        acc[type] = filtered
      }
    } else {
      acc[type] = items
    }

    return acc
  }, {})

  // Filter sponsors based on search query
  const filteredSponsors = searchQuery
    ? sponsors.filter(
        (sponsor) =>
          sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sponsor.description && sponsor.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : sponsors

  // Handle element click
  const handleElementClick = (element) => {
    if (onElementSelect) {
      onElementSelect(element)
    }

    toast({
      title: "Element Selected",
      description: `${element.name} has been selected.`,
    })
  }

  // Handle sponsor click
  const handleSponsorClick = (sponsor) => {
    // Find sponsor reads for this sponsor
    const sponsorReads = Object.values(elements)
      .flat()
      .filter((element) => element.type === "Sponsor Read" && element.sponsor_id === sponsor.id)

    if (sponsorReads.length > 0) {
      handleElementClick(sponsorReads[0])
    } else {
      toast({
        title: "No Sponsor Reads",
        description: `No sponsor reads found for ${sponsor.name}.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Elements Library</h2>
        <Button variant="ghost" size="sm">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search elements..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading elements...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-sm">{error}</div>
      ) : (
        <div className="space-y-4">
          {/* Sponsor Reads Section */}
          {filteredElements["Sponsor Read"] && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-blue-800">Sponsor Reads</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {filteredElements["Sponsor Read"].length}
                </span>
              </div>
              <div className="mt-2 text-sm space-y-1">
                {filteredElements["Sponsor Read"].map((element) => (
                  <div
                    key={element.id}
                    className="bg-white p-2 rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleElementClick(element)}
                  >
                    {element.name}
                    {element.duration && <div className="text-xs text-gray-500">{element.duration}s duration</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Markers Section */}
          {filteredElements["Time Marker"] && (
            <div className="bg-green-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-green-800">Time Markers</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {filteredElements["Time Marker"].length}
                </span>
              </div>
              <div className="mt-2 text-sm space-y-1">
                {filteredElements["Time Marker"].map((element) => (
                  <div
                    key={element.id}
                    className="bg-white p-2 rounded border border-green-100 cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => handleElementClick(element)}
                  >
                    {element.name}
                    {element.default_offset && (
                      <div className="text-xs text-gray-500">+{element.default_offset}m offset</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Element Types */}
          {Object.entries(filteredElements).map(([type, items]) => {
            if (type !== "Sponsor Read" && type !== "Time Marker" && items.length > 0) {
              return (
                <div key={type} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">{type}s</h3>
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{items.length}</span>
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    {items.map((element) => (
                      <div
                        key={element.id}
                        className="bg-white p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleElementClick(element)}
                      >
                        {element.name}
                        {element.duration && <div className="text-xs text-gray-500">{element.duration}s duration</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      {/* Sponsor Management Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Sponsor Management</h2>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading sponsors...</div>
        ) : (
          <div className="space-y-2">
            {filteredSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-gray-50 p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSponsorClick(sponsor)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    {sponsor.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{sponsor.name}</div>
                    <div className="text-xs text-gray-500">{sponsor.read_count || 0} reads planned</div>
                  </div>
                  <div className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">On Track</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

