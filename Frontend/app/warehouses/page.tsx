"use client"

import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Star, Shield, Truck, Thermometer } from "lucide-react"

const mockWarehouses = [
  {
    id: 1,
    name: "Hamburg Logistics Center",
    location: "Hamburg, Germany",
    capacity: "50,000 m²",
    esgScore: 8.7,
    certifications: ["ISO 9001", "ISO 14001", "TAPA FSR"],
    features: ["Climate Control", "24/7 Security", "Rail Access", "Customs Clearance"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Singapore Free Trade Zone",
    location: "Singapore",
    capacity: "75,000 m²",
    esgScore: 9.1,
    certifications: ["GDP", "HACCP", "Halal"],
    features: ["Temperature Controlled", "Automated Systems", "Port Proximity", "Multi-modal Access"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Dubai Logistics Hub",
    location: "Dubai, UAE",
    capacity: "60,000 m²",
    esgScore: 8.9,
    certifications: ["ISO 22000", "OHSAS 18001", "Dubai Municipality"],
    features: ["Free Zone Benefits", "Cold Storage", "Cross Docking", "E-commerce Ready"],
    availability: "Limited",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Rotterdam Distribution Center",
    location: "Rotterdam, Netherlands",
    capacity: "40,000 m²",
    esgScore: 8.3,
    certifications: ["AEO", "ISO 28000", "C-TPAT"],
    features: ["Deep Sea Access", "Intermodal Terminal", "Customs Bonded", "Green Building"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Los Angeles Trade Complex",
    location: "Los Angeles, USA",
    capacity: "85,000 m²",
    esgScore: 7.5,
    certifications: ["FDA", "USDA", "C-TPAT"],
    features: ["Near Port Complex", "Rail Connectivity", "Food Grade", "Hazmat Certified"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    name: "Shanghai Bonded Warehouse",
    location: "Shanghai, China",
    capacity: "55,000 m²",
    esgScore: 7.8,
    certifications: ["China Customs", "ISO 9001", "AQSIQ"],
    features: ["Bonded Storage", "Value Added Services", "Quality Inspection", "Export Processing"],
    availability: "Limited",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function WarehousesPage() {
  const getEsgColor = (score: number) => {
    if (score >= 8.5) return "text-green-600"
    if (score >= 7.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Limited":
        return "bg-yellow-100 text-yellow-800"
      case "Unavailable":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verified Warehouses</h1>
          <p className="text-muted-foreground mt-1">
            Explore our network of certified and verified warehouse facilities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockWarehouses.map((warehouse) => (
            <Card key={warehouse.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img
                  src={warehouse.image || "/placeholder.svg"}
                  alt={warehouse.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    {warehouse.name}
                  </CardTitle>
                  <Badge className={getAvailabilityColor(warehouse.availability)}>{warehouse.availability}</Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {warehouse.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <p className="font-medium">{warehouse.capacity}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                    <span className={`text-sm font-medium ${getEsgColor(warehouse.esgScore)}`}>
                      ESG: {warehouse.esgScore}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center">
                    <Shield className="mr-1 h-4 w-4" />
                    Certifications:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {warehouse.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {warehouse.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        {feature.includes("Climate") || feature.includes("Temperature") ? (
                          <Thermometer className="mr-1 h-3 w-3 text-blue-500" />
                        ) : feature.includes("Security") ? (
                          <Shield className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <Truck className="mr-1 h-3 w-3 text-gray-500" />
                        )}
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" disabled={warehouse.availability === "Unavailable"}>
                  {warehouse.availability === "Available"
                    ? "Request Quote"
                    : warehouse.availability === "Limited"
                      ? "Check Availability"
                      : "Unavailable"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
