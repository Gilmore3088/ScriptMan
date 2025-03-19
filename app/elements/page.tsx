"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ElementsNavigation } from "@/components/elements-navigation"
import { DatabaseSetup } from "@/components/database-setup"
import { TestDbConnection } from "@/components/test-db-connection"
import { Loader2, Plus, Search, Filter, Tag, Clock, AlertCircle } from "lucide-react"
import type { GameElement } from "@/types/supabase"

export default function ElementsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [elements, setElements] = useState<GameElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  // Element types for filtering
  const elementTypes = [
    "All Types",
    "Sponsor Read",
    "Permanent Marker",
    "Generic Event",
    "Promo",
    "Announcement",
    "Timeout",
    "Commercial Break",
  ]

  useEffect(() => {
    fetchElements()
  }, [])

  const fetchElements = async () => {
    setLoading(true)
    setError(null)
    setDbError(null)
    setNeedsSetup(false)

    try {
      // First check if the tables exist
      const { data: tablesExist, error: tablesError } = await supabase
        .rpc("check_tables_exist", {
          table_names: ["game_elements", "sponsors"],
        })
        .single()

      if (tablesError) {
        console.log("Error checking tables:", tablesError)
        // If the RPC doesn't exist, we'll try a direct query
        const { data, error } = await supabase.from("game_elements").select("*")

        if (error) {
          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            setNeedsSetup(true)
            setLoading(false)
            return
          }
          throw error
        }

        console.log("Fetched elements:", data)
        setElements(data || [])
        setNeedsSetup(false)
      } else if (!tablesExist) {
        setNeedsSetup(true)
        setLoading(false)
        return
      } else {
        // Tables exist, fetch elements
        const { data, error } = await supabase.from("game_elements").select("*")

        if (error) {
          throw error
        }

        console.log("Fetched elements:", data)
        setElements(data || [])
        setNeedsSetup(false)
      }
    } catch (err) {
      console.error("Error fetching elements:", err)

      // Check if the error is related to missing tables
      if (err instanceof Error && err.message.includes("relation") && err.message.includes("does not exist")) {
        setNeedsSetup(true)
      } else {
        setError(`Error fetching elements: ${err instanceof Error ? err.message : String(err)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddElement = () => {
    router.push("/elements/new")
  }

  const handleEditElement = (id: string) => {
    router.push(`/elements/${id}`)
  }

  const filteredElements = elements.filter((element) => {
    const matchesSearch =
      element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (element.description && element.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = !selectedType || selectedType === "All Types" || element.type === selectedType

    return matchesSearch && matchesType
  })

  return (
    <div className="container mx-auto py-6">
      <ElementsNavigation />

      {needsSetup && (
        <div className="mb-6">
          <DatabaseSetup onComplete={fetchElements} />
        </div>
      )}

      {dbError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{dbError}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={fetchElements}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={fetchElements}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      )}

      {!needsSetup && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search elements..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="type-filter" className="whitespace-nowrap">
                  Filter by:
                </Label>
              </div>
              <Select value={selectedType || "All Types"} onValueChange={setSelectedType}>
                <SelectTrigger id="type-filter" className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {elementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleAddElement} className="ml-2 bg-[#FF5722] hover:bg-[#E64A19] text-white">
                <Plus className="h-4 w-4 mr-1" />
                Add Element
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />
            </div>
          ) : (
            <>
              {filteredElements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredElements.map((element) => (
                    <Card
                      key={element.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleEditElement(element.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{element.name}</CardTitle>
                          <Badge variant={element.is_permanent_marker ? "default" : "outline"}>{element.type}</Badge>
                        </div>
                        {element.description && (
                          <CardDescription className="line-clamp-2">{element.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pb-2">
                        {element.script_template && (
                          <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {element.script_template}
                          </div>
                        )}

                        {element.supported_sports && element.supported_sports.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {element.supported_sports.slice(0, 3).map((sport) => (
                              <Badge key={sport} variant="secondary" className="text-xs">
                                {sport}
                              </Badge>
                            ))}
                            {element.supported_sports.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{element.supported_sports.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(element.created_at).toLocaleDateString()}

                          {element.sponsor_name && (
                            <>
                              <Separator orientation="vertical" className="mx-2 h-3" />
                              <Tag className="h-3 w-3 mr-1" />
                              {element.sponsor_name}
                            </>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-center">No Elements Found</CardTitle>
                    <CardDescription className="text-center">
                      {searchTerm || selectedType
                        ? "No elements match your search criteria. Try adjusting your filters."
                        : "You haven't created any elements yet."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center pb-6">
                    <Button onClick={handleAddElement} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Create Your First Element
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Database connection test (hidden in production) */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8">
          <TestDbConnection />
        </div>
      )}
    </div>
  )
}

