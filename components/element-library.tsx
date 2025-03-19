"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, Settings, DollarSign, Edit, Eye } from "lucide-react"
import type { GameElement } from "@/types/supabase"
import { ElementPreviewDialog } from "./element-preview-dialog"
import { ManageTypesDialog } from "./manage-types-dialog"
import { gameElementsTableSQL } from "./sql-setup-script"
import { useToast } from "@/hooks/use-toast"

export function ElementLibrary() {
  const router = useRouter()
  const [elements, setElements] = useState<GameElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sportFilter, setSportFilter] = useState<string>("all")
  const [sponsorFilter, setSponsorFilter] = useState<string>("all")
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isManageTypesDialogOpen, setIsManageTypesDialogOpen] = useState(false)
  const [currentElement, setCurrentElement] = useState<GameElement | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [elementTypes, setElementTypes] = useState<string[]>([
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
  ])
  const [customTypes, setCustomTypes] = useState<string[]>([])
  const [sponsors, setSponsors] = useState<Set<string>>(new Set())
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // All possible sports for filtering
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

  // Combined element types (predefined + custom)
  const allElementTypes = [...elementTypes, ...customTypes]

  useEffect(() => {
    fetchElements()
    loadCustomTypes()
  }, [])

  const fetchElements = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("game_elements").select("*").order("name")

      if (error) {
        if (error.message.includes("does not exist")) {
          setTableExists(false)
          setError("The game_elements table doesn't exist yet. Please run the SQL setup script.")
        } else {
          setError(`Error fetching elements: ${error.message}`)
        }
        console.error("Error fetching elements:", error)
      } else {
        setElements(data || [])
        setTableExists(true)
        setError(null)

        // Extract any custom types from the elements
        const typesFromElements =
          data
            ?.map((element) => element.type)
            .filter((type) => !elementTypes.includes(type))
            .filter((value, index, self) => self.indexOf(value) === index) || []

        setCustomTypes((prev) => {
          const combined = [...prev, ...typesFromElements]
          return [...new Set(combined)] // Remove duplicates
        })

        // Extract sponsors for filtering
        const sponsorsSet = new Set<string>()
        data?.forEach((element) => {
          if (element.sponsor_name) {
            sponsorsSet.add(element.sponsor_name)
          }
        })
        setSponsors(sponsorsSet)
      }
    } catch (err) {
      console.error("Error fetching elements:", err)
      setError(`Error fetching elements: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomTypes = async () => {
    try {
      // Try to load custom types from localStorage
      const savedTypes = localStorage.getItem("scriptman_custom_element_types")
      if (savedTypes) {
        setCustomTypes(JSON.parse(savedTypes))
      }
    } catch (err) {
      console.error("Error loading custom types:", err)
    }
  }

  const saveCustomTypes = (types: string[]) => {
    try {
      localStorage.setItem("scriptman_custom_element_types", JSON.stringify(types))
      setCustomTypes(types)
    } catch (err) {
      console.error("Error saving custom types:", err)
    }
  }

  const handleAddElement = () => {
    if (!tableExists) {
      toast({
        title: "Database table missing",
        description: "Please run the SQL setup script first to create the game_elements table.",
        variant: "destructive",
      })
      return
    }
    router.push("/elements/new")
  }

  const handleEditElement = (element: GameElement) => {
    router.push(`/elements/${element.id}`)
  }

  const handlePreviewElement = (element: GameElement) => {
    setCurrentElement(element)
    setIsPreviewDialogOpen(true)
  }

  const handleManageTypes = () => {
    setIsManageTypesDialogOpen(true)
  }

  const handleTypesUpdated = (updatedTypes: string[]) => {
    saveCustomTypes(updatedTypes)
    setIsManageTypesDialogOpen(false)
  }

  // Get type color class based on type
  const getTypeColorClass = (type: string) => {
    const typeColorMap: Record<string, string> = {
      "Sponsor Read": "bg-blue-100 text-blue-800",
      "Permanent Marker": "bg-purple-100 text-purple-800",
      "Generic Event": "bg-green-100 text-green-800",
      Promo: "bg-yellow-100 text-yellow-800",
      Announcement: "bg-indigo-100 text-indigo-800",
      Timeout: "bg-red-100 text-red-800",
      "Commercial Break": "bg-orange-100 text-orange-800",
      "Player Introduction": "bg-teal-100 text-teal-800",
      "Team Introduction": "bg-cyan-100 text-cyan-800",
      "Weather Update": "bg-sky-100 text-sky-800",
      "Score Update": "bg-emerald-100 text-emerald-800",
      Statistics: "bg-lime-100 text-lime-800",
    }

    return typeColorMap[type] || "bg-gray-100 text-gray-800"
  }

  // Filter elements based on search query, type filter, sport filter, and sponsor filter
  const filteredElements = elements.filter((element) => {
    const matchesSearch =
      searchQuery === "" ||
      element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (element.description && element.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (element.script_template && element.script_template.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (element.sponsor_name && element.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === "all" || element.type === typeFilter

    const matchesSport =
      sportFilter === "all" || (element.supported_sports && element.supported_sports.includes(sportFilter))

    const matchesSponsor =
      sponsorFilter === "all" ||
      (sponsorFilter === "none" && !element.sponsor_name) ||
      element.sponsor_name === sponsorFilter

    return matchesSearch && matchesType && matchesSport && matchesSponsor
  })

  return (
    <div className="space-y-6">
      {!tableExists && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              The game_elements table doesn't exist yet. Please run the following SQL in your Supabase SQL Editor:
            </p>
            <pre className="bg-amber-100 p-4 rounded-md overflow-auto text-xs text-amber-900">
              {gameElementsTableSQL}
            </pre>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
              onClick={() => {
                navigator.clipboard.writeText(gameElementsTableSQL)
                toast({
                  title: "SQL Copied",
                  description: "SQL script copied to clipboard",
                })
              }}
            >
              Copy SQL to Clipboard
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search elements..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allElementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleManageTypes} title="Manage Element Types">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {allSports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All Sponsors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sponsors</SelectItem>
              <SelectItem value="none">No Sponsor</SelectItem>
              {Array.from(sponsors).map((sponsor) => (
                <SelectItem key={sponsor} value={sponsor}>
                  {sponsor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddElement} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Element
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />
        </div>
      ) : error && !tableExists ? (
        <div className="text-center py-8 text-muted-foreground">
          Please run the SQL setup script to create the game_elements table.
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredElements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {elements.length === 0
            ? "No elements found. Click 'Add Element' to create your first element."
            : "No elements match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElements.map((element) => (
            <Card key={element.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold truncate">{element.name}</CardTitle>
                  <Badge className={getTypeColorClass(element.type)}>{element.type}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {element.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {element.sponsor_name && (
                  <div className="flex items-center mb-2 text-sm text-blue-600">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    <span>{element.sponsor_name}</span>
                  </div>
                )}
                {element.script_template && (
                  <div className="bg-gray-50 p-2 rounded-md text-sm mb-3 line-clamp-3">
                    <span className="text-gray-500 italic">"{element.script_template}"</span>
                  </div>
                )}
                {element.is_permanent_marker && element.default_offset && (
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      Default Offset: {element.default_offset}
                    </span>
                  </div>
                )}
                {element.supported_sports && element.supported_sports.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {element.supported_sports.map((sport) => (
                      <Badge key={sport} variant="outline" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewElement(element)}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditElement(element)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {isPreviewDialogOpen && currentElement && (
        <ElementPreviewDialog
          element={currentElement}
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        />
      )}

      {isManageTypesDialogOpen && (
        <ManageTypesDialog
          open={isManageTypesDialogOpen}
          onOpenChange={setIsManageTypesDialogOpen}
          predefinedTypes={elementTypes}
          customTypes={customTypes}
          onSave={handleTypesUpdated}
        />
      )}
    </div>
  )
}

