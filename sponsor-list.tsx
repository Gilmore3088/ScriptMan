"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Upload } from "lucide-react"
import { SponsorFilters } from "./sponsor-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Sponsor } from "@/lib/types"

export function SponsorList({
  sponsors = [],
  sports = [],
  seasons = [],
}: {
  sponsors?: Sponsor[]
  sports?: any[]
  seasons?: any[]
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])

  // Filter sponsors based on search term and filters
  const filteredSponsors = (sponsors || []).filter((sponsor) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sponsor.contact_name && sponsor.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sponsor.contact_email && sponsor.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by sports
    const matchesSports =
      selectedSports.length === 0 ||
      (sponsor.sports && sponsor.sports.some((sportId) => selectedSports.includes(sportId)))

    // Filter by seasons
    const matchesSeasons =
      selectedSeasons.length === 0 ||
      (sponsor.seasons && sponsor.seasons.some((seasonId) => selectedSeasons.includes(seasonId)))

    return matchesSearch && matchesSports && matchesSeasons
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sponsors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Link href="/sponsors/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Sponsor
            </Button>
          </Link>
          <Link href="/sponsors/bulk">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Create
            </Button>
          </Link>
        </div>
      </div>

      <SponsorFilters
        sports={sports}
        seasons={seasons}
        selectedSports={selectedSports}
        selectedSeasons={selectedSeasons}
        onSportsChange={setSelectedSports}
        onSeasonsChange={setSelectedSeasons}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSponsors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No sponsors found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters, or add a new sponsor.</p>
          </div>
        ) : (
          filteredSponsors.map((sponsor) => (
            <Link key={sponsor.id} href={`/sponsors/${sponsor.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{sponsor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sponsor.logo_url && (
                      <div
                        className="h-16 bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${sponsor.logo_url})`,
                          backgroundColor: sponsor.brand_color || "transparent",
                        }}
                      />
                    )}

                    {sponsor.sports && sponsor.sports.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Sports</h4>
                        <div className="flex flex-wrap gap-1">
                          {sponsor.sports.map((sportId) => (
                            <Badge key={sportId} variant="outline">
                              {sports.find((s) => s.id === sportId)?.name || sportId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {sponsor.seasons && sponsor.seasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Seasons</h4>
                        <div className="flex flex-wrap gap-1">
                          {sponsor.seasons.map((seasonId) => (
                            <Badge key={seasonId} variant="outline">
                              {seasons.find((s) => s.id === seasonId)?.name || seasonId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {sponsor.contact_name && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact</h4>
                        <p className="text-sm">{sponsor.contact_name}</p>
                        {sponsor.contact_email && (
                          <p className="text-sm text-muted-foreground">{sponsor.contact_email}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

