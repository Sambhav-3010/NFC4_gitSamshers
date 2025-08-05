"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Filter, Navigation, Layers, Zap } from "lucide-react"

const mockLocations = [
  {
    id: 1,
    name: "Purple Tower",
    type: "Office",
    lat: 40.7128,
    lng: -74.006,
    status: "Active",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Innovation Hub",
    type: "Coworking",
    lat: 34.0522,
    lng: -118.2437,
    status: "Available",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Tech Campus",
    type: "Campus",
    lat: 37.7749,
    lng: -122.4194,
    status: "Busy",
    rating: 4.9,
  },
]

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<(typeof mockLocations)[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
          <div className="relative px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Interactive Map</h1>
                <p className="text-purple-100">Explore locations with beautiful visualizations</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                  <Navigation className="mr-2 h-4 w-4" />
                  My Location
                </Button>
                <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                  <Layers className="mr-2 h-4 w-4" />
                  Layers
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass border-purple-800/20 dark:border-purple-100/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100"
                />
              </div>
              <Button
                variant="outline"
                className="border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5 bg-transparent"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="gradient-border h-[500px]">
              <div className="gradient-border-content relative overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-900/20 dark:to-purple-800/10">
                  <div className="absolute inset-0 opacity-30">
                    <svg viewBox="0 0 1000 500" className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path
                            d="M 50 0 L 0 0 0 50"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-purple-800/20 dark:text-purple-100/20"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                </div>

                {/* Location Pins */}
                {mockLocations.map((location, index) => (
                  <div
                    key={location.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`,
                    }}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-background/90 backdrop-blur-sm border border-purple-800/20 dark:border-purple-100/20 rounded-lg p-2 shadow-lg min-w-[120px]">
                          <p className="text-xs font-medium">{location.name}</p>
                          <p className="text-xs text-muted-foreground">{location.type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Floating Action Button */}
                <div className="absolute bottom-4 right-4">
                  <Button
                    size="icon"
                    className="rounded-full bg-gradient-to-br from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 shadow-lg"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <Card className="glass border-purple-800/20 dark:border-purple-100/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Location Details
                </CardTitle>
                <CardDescription>Click on map pins to view information</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedLocation ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedLocation.type}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge
                          className={
                            selectedLocation.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : selectedLocation.status === "Available"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                          }
                        >
                          {selectedLocation.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm">Rating:</span>
                        <span className="text-sm font-medium">⭐ {selectedLocation.rating}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm">Coordinates:</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500">
                      Get Directions
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-purple-800 dark:text-purple-100" />
                    </div>
                    <p className="text-sm text-muted-foreground">Select a location on the map to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="gradient-border">
              <div className="gradient-border-content">
                <CardHeader>
                  <CardTitle>Map Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-800 to-purple-100"></div>
                    <span className="text-sm">Active Locations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-200"></div>
                    <span className="text-sm">Available Spaces</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-300"></div>
                    <span className="text-sm">Busy Areas</span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
