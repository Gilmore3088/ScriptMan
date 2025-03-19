"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Filter,
  Search,
  Clock,
  Tag,
  Bookmark,
  Megaphone,
  Calendar,
  LayoutGrid,
  List,
  ChevronDown,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { ElementType, Sport } from "@/types/database"

// Icons for element types
const ElementTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Permanent Marker":
      return <Clock className="h-4 w-4 text-[#F0AD4E]" />
    case "Sponsor Read":
      return <Megaphone className="h-4 w-4 text-[#5BC0DE]" />
    case "Promotion":
      return <Tag className="h-4 w-4 text-[#5CB85C]" />
    case "Generic Event":
      return <Bookmark className="h-4 w-4 text-[#4A6FA5]" />
    case "Timeout":
      return <Clock className="h-4 w-4 text-[#D9534F]" />
    case "Commercial Break":
      return <Calendar className="h-4 w-4 text-[#9370DB]" />
    default:
      return <Bookmark className="h-4 w-4 text-[#4A6FA5]" />
  }
}

export function ElementLibrary() {
  const supabase = createClientComponentClient()
  const [elements, setElements] = useState<ElementType[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'recent'>('name')
  const [selectedElements, setSelectedElements] = useState<number[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [currentElement, setCurrentElement] = useState<ElementType | null>(null)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    types: [] as string[],
    sports: [] as string[],
    isPermanent: null as boolean | null,
  })

  // Fetch elements and sports
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch sports
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*')
        .order('name')
      
      if (sportsError) {
        console.error('Error fetching sports:', sportsError)
      } else {
        setSports(sportsData || [])
      }
      
      // Fetch elements
      const { data: elementsData, error: elementsError } = await supabase
        .from('elements')
        .select('*')
        .order('name')
      
      if (elementsError) {
        console.error('Error fetching elements:', elementsError)
      } else {
        setElements(elementsData || [])
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [supabase])

  // Get unique element types
  const elementTypes = [...new Set(elements.map(element => element.type))]

  // Filter elements based on active tab, search query, and filters
  const filteredElements = elements.filter(element => {
    // Filter by tab
    if (activeTab !== 'all' && element.type !== activeTab) {
      return false
    }
    
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      element.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      element.script_template.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by advanced filters
    const matchesTypes = 
      filters.types.length === 0 || 
      filters.types.includes(element.type)
    
    const matchesSports = 
      filters.sports.length === 0 || 
      (element.supported_sports && 
       Array.isArray(element.supported_sports) && 
       element.supported_sports.some(sport => filters.sports.includes(sport)))
    
    const matchesPermanent = 
      filters.isPermanent === null || 
      element.is_permanent === filters.isPermanent
    
    return matchesSearch && matchesTypes && matchesSports && matchesPermanent
  })

  // Sort elements
  const sortedElements = [...filteredElements].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy === 'type') {
      return a.type.localeCompare(b.type)
    } else if (sortBy === 'recent') {
      // This is a placeholder - in a real app, you'd sort by created_at or updated_at
      return (b.id || 0) - (a.id || 0)
    }
    return 0
  })

  // Handle element deletion
  const handleDeleteElement = async (id: number) => {
    if (confirm('Are you sure you want to delete this element?')) {
      const { error } = await supabase
        .from('elements')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting element:', error)
        alert('Failed to delete element')
      } else {
        setElements(elements.filter(element => element.id !== id))
        setSelectedElements(selectedElements.filter(elementId => elementId !== id))
      }
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedElements.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedElements.length} elements?`)) {
      const { error } = await supabase
        .from('elements')
        .delete()
        .in('id', selectedElements)
      
      if (error) {
        console.error('Error deleting elements:', error)
        alert('Failed to delete elements')
      } else {
        setElements(elements.filter(element => !selectedElements.includes(element.id)))
        setSelectedElements([])
      }
    }
  }

  // Handle element editing
  const handleEditElement = (element: ElementType) => {
    setCurrentElement(element)
    setIsAddDialogOpen(true)
  }

  // Handle element preview
  const handlePreviewElement = (element: ElementType) => {
    setCurrentElement(element)
    setIsPreviewDialogOpen(true)
  }

  // Handle adding a new element
  const handleAddElement = () => {
    setCurrentElement(null)
    setIsAddDialogOpen(true)
  }

  // Handle dialog close and element save
  const handleDialogClose = (savedElement?: ElementType) => {
    setIsAddDialogOpen(false)
    
    if (savedElement) {
      // If we're editing an existing element
      if (currentElement) {
        setElements(elements.map(e => e.id === savedElement.id ? savedElement : e))
      } 
      // If we're adding a new element
      else {
        setElements([...elements, savedElement])
      }
    }
  }

  // Handle preview dialog close
  const handlePreviewDialogClose = () => {
    setIsPreviewDialogOpen(false)
  }

  // Toggle element selection
  const toggleElementSelection = (id: number) => {
    setSelectedElements(prev => 
      prev.includes(id)
        ? prev.filter(elementId => elementId !== id)
        : [...prev, id]
    )
  }

  // Toggle all elements selection
  const toggleAllSelection = () => {
    if (selectedElements.length === filteredElements.length) {
      setSelectedElements([])
    } else {
      setSelectedElements(filteredElements.map(e => e.id))
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setActiveTab('all')
    setFilters({
      types: [],
      sports: [],
      isPermanent: null,
    })
  }

  // Toggle filter for type
  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }))
  }

  // Toggle filter for sport
  const toggleSportFilter = (sport: string) => {
    setFilters(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }))
  }

  // Set permanent filter
  const setPermanentFilter = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      isPermanent: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Top bar with search, view toggle, and add button */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            className="pl-8 border-[#C4C4C4]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {/* View mode toggle */}
          <div className="border border-[#C4C4C4] rounded-md flex">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 rounded-l-md ${viewMode === 'grid' ? 'bg-[#4A6FA5] text-white' : 'text-[#2D2D2D]'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 rounded-r-md ${viewMode === 'list' ? 'bg-[#4A6FA5] text-white' : 'text-[#2D2D2D]'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#C4C4C4]">
                <span className="mr-1">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortBy === 'name'}
                onCheckedChange={() => setSortBy('name')}
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'type'}
                onCheckedChange={() => setSortBy('type')}
              >
                Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'recent'}
                onCheckedChange={() => setSortBy('recent')}
              >
                Most Recent
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Advanced filter button */}
          <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-[#C4C4C4]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filter</span>
                {(filters.types.length > 0 || filters.sports.length > 0 || filters.isPermanent !== null) && (
                  <Badge className="ml-2 bg-[#4A6FA5]">
                    {filters.types.length + filters.sports.length + (filters.isPermanent !== null ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="font-medium text-[#2D2D2D]">Filter Elements</div>
                
                <div className="space-y-2">
                  <div className="font-medium text-sm text-[#2D2D2D]">Element Type</div>
                  <div className="grid grid-cols-2 gap-2">
                    {elementTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={filters.types.includes(type)}
                          onCheckedChange={() => toggleTypeFilter(type)}
                          className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm text-[#2D2D2D]"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-sm text-[#2D2D2D]">Sports</div>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {sports.map(sport => (
                      <div key={sport.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`sport-filter-${sport.id}`} 
                          checked={filters.sports.includes(sport.name)}
                          onCheckedChange={() => toggleSportFilter(sport.name)}
                          className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                        />
                        <label
                          htmlFor={`sport-filter-${sport.id}`}
                          className="text-sm text-[#2D2D2D]"
                        >
                          {sport.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-sm text-[#2D2D2D]">Permanent Marker</div>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="permanent-yes" 
                        checked={filters.isPermanent === true}
                        onCheckedChange={() => setPermanentFilter(filters.isPermanent === true ? null : true)}
                        className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                      />
                      <label
                        htmlFor="permanent-yes"
                        className="text-sm text-[#2D2D2D]"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="permanent-no" 
                        checked={filters.isPermanent === false}
                        onCheckedChange={() => setPermanentFilter(filters.isPermanent === false ? null : false)}
                        className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                      />
                      <label
                        htmlFor="permanent-no"
                        className="text-sm text-[#2D2D2D]"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-[#D9534F] border-[#D9534F] hover:bg-[#D9534F] hover:text-white"
                  >
                    Reset All
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsAdvancedFilterOpen(false)}
                    className="bg-[#4A6FA5] hover:bg-[#3A5A8A] text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Add element button */}
          <Button 
            onClick={handleAddElement}
            className="bg-[#4A6FA5] hover:bg-[#3A5A8A] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Element
          </Button>
        </div>
      </div>

      {/* Tabs for element types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-[#F5F5F5] p-0 h-auto flex flex-wrap">
          <TabsTrigger 
            value="all" 
            className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-[#4A6FA5] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4A6FA5] rounded-none"
          >
            All Elements
          </TabsTrigger>
          {elementTypes.map(type => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-[#4A6FA5] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4A6FA5] rounded-none"
            >
              <ElementTypeIcon type={type} />
              <span className="ml-2">{type}s</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Bulk actions bar - only show when elements are selected */}
        {selectedElements.length > 0 && (
          <div className="bg-[#4A6FA5] bg-opacity-10 p-2 mt-2 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <Checkbox 
                id="select-all" 
                checked={selectedElements.length === filteredElements.length && filteredElements.length > 0}
                onCheckedChange={toggleAllSelection}
                className="mr-2 border-[#4A6FA5] data-[state=checked]:bg-[#4A6FA5]"
              />
              <label htmlFor="select-all" className="text-sm text-[#2D2D2D]">
                {selectedElements.length} selected
              </label>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-[#D9534F] border-[#D9534F] hover:bg-[#D9534F] hover:text-white"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-[#4A6FA5] border-[#4A6FA5] hover:bg-[#4A6FA5] hover:text-white"
                onClick={() => setSelectedElements([])}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Elements content */}
        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-[#2D2D2D]">Loading elements...</div>
          ) : sortedElements.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#2D2D2D]">No elements found</p>
              <Button 
                variant="outline" 
                className="mt-4 border-[#4A6FA5] text-[#4A6FA5] hover:bg-[#4A6FA5] hover:text-white"
                onClick={handleAddElement}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first element
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedElements.map(element => (
                <Card key={element.id} className={`overflow-hidden border-[#C4C4C4] ${selectedElements.includes(element.id) ? 'ring-2 ring-[#4A6FA5]' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={selectedElements.includes(element.id)}
                          onCheckedChange={() => toggleElementSelection(element.id)}
                          className="mt-1 border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                        />
                        <div>
                          <CardTitle className="text-lg text-[#2D2D2D] font-bold group flex items-center">
                            {element.name}
                            <ElementTypeIcon type={element.type} />
                          </CardTitle>
                          <div className="text-sm text-[#2D2D2D] opacity-70 flex items-center">
                            {element.type}
                            {element.is_permanent && (
                              <Badge variant="outline" className="ml-2 bg-[#F0AD4E] bg-opacity-20 text-[#F0AD4E] border-[#F0AD4E] text-xs">
                                Permanent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-[#2D2D2D]">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePreviewElement(element)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditElement(element)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-[#D9534F] focus:text-[#D9534F]"
                            onClick={() => handleDeleteElement(element.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-[#2D2D2D] mb-2">
                      <div className="font-medium">Script Template:</div>
                      <div className="mt-1 whitespace-pre-wrap line-clamp-3">
                        {element.script_template.replace(/{([^}]+)}/g, (match, p1) => (
                          `<span class="text-[#4A6FA5] font-medium">{${p1}}</span>`
                        ))}
                      </div>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs text-[#4A6FA5]"
                        onClick={() => handlePreviewElement(element)}
                      >
                        Preview & Test
                      </Button>
                    </div>
                    
                    {element.is_permanent && element.default_offset && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-[#2D2D2D] border-[#C4C4C4]">
                          Offset: {element.default_offset}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {element.supported_sports && Array.isArray(element.supported_sports) && 
                       element.supported_sports.map((sport, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-[#4A6FA5] bg-opacity-10 text-[#4A6FA5] border-[#4A6FA5] border-opacity-30">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            // List view
            <div className="border border-[#C4C4C4] rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="p-2 text-left">
                      <Checkbox 
                        checked={selectedElements.length === filteredElements.length && filteredElements.length > 0}
                        onCheckedChange={toggleAllSelection}
                        className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                      />
                    </th>
                    <th className="p-2 text-left text-[#2D2D2D] font-medium">Name</th>
                    <th className="p-2 text-left text-[#2D2D2D] font-medium">Type</th>
                    <th className="p-2 text-left text-[#2D2D2D] font-medium">Sports</th>
                    <th className="p-2 text-left text-[#2D2D2D] font-medium">Permanent</th>
                    <th className="p-2 text-right text-[#2D2D2D] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedElements.map(element => (
                    <tr key={element.id} className={`border-t border-[#C4C4C4] ${selectedElements.includes(element.id) ? 'bg-[#4A6FA5] bg-opacity-5' : ''}`}>
                      <td className="p-2">
                        <Checkbox 
                          checked={selectedElements.includes(element.id)}
                          onCheckedChange={() => toggleElementSelection(element.id)}
                          className="border-[#C4C4C4] data-[state=checked]:bg-[#4A6FA5]"
                        />
                      </td>
                      <td className="p-2 text-[#2D2D2D] font-medium">{element.name}</td>
                      <td className="p-2 text-[#2D2D2D]">
                        <div className="flex items-center">
                          <ElementTypeIcon type={element.type} />
                          <span className="ml-1">{element.type}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {element.supported_sports && Array.isArray(element.supported_sports) && 
                           element.supported_sports.slice(0, 2).map((sport, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-[#4A6FA5] bg-opacity-10 text-[#4A6FA5] border-[#4A6FA5] border-opacity-30">
                              {sport}
                            </Badge>
                          ))}
                          {element.supported_sports && Array.isArray(element.supported_sports) && element.supported_sports.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-[#4A6FA5] bg-opacity-10 text-[#4A6FA5] border-[#4A6FA5] border-opacity-30">
                              +{element.supported_sports.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        {element.is_permanent ? (
                          <Badge variant="outline" className="bg-[#F0AD4E] bg-opacity-20 text-[#F0AD4E] border-[#F0AD4E]">
                            Yes {element.default_offset && `(${element.default_offset})`}
                          </Badge>
                        ) : (
                          <span className="text-[#2D2D2D]">No</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-[#4A6FA5]"
                            onClick={() => handlePreviewElement(element)}
                          >
                            <span className="sr-only">Preview</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C1\

