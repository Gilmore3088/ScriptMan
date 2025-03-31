"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ElementFiltersProps {
  onFilterChange: (filter: string) => void
  onSearchChange: (search: string) => void
}

export function ElementFilters({ onFilterChange, onSearchChange }: ElementFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearchChange(value)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onFilterChange("sponsor")}>
            Sponsors
          </Button>
          <Button variant="outline" size="sm" onClick={() => onFilterChange("all")}>
            All
          </Button>
        </div>
      </div>

      <Input
        type="search"
        placeholder="Search elements..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full"
      />
    </div>
  )
}

