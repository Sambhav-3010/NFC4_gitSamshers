"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Building2, MapPin, DollarSign, Eye, Heart, Loader2, ArrowLeft } from "lucide-react"

// Mock property data (should ideally come from a global state or API call)
const mockProperties = [
  {
    id: 1,
    title: "Luxury Villa with Pool",
    location: "Gurgaon, Haryana",
    area: "4,500 sq ft",
    price: "₹2.5 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Luxury+Villa",
    status: "Tokenized",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    verified: true,
    views: 1247,
    description: "An exquisite villa featuring a private pool, lush gardens, and smart home technology. Located in a prime residential area with excellent connectivity.",
    ownerId: "0xOwner123abc",
    latitude: "28.4595",
    longitude: "77.0266"
  },
  {
    id: 2,
    title: "Modern Apartment Complex",
    location: "Mumbai, Maharashtra",
    area: "1,200 sq ft",
    price: "₹1.8 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Modern+Apartment",
    status: "Pending Sale",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    verified: true,
    views: 892,
    description: "Contemporary apartment with stunning city views, modern amenities, and access to a state-of-the-art gym. Ideal for urban living.",
    ownerId: "0xOwner456def",
    latitude: "19.0760",
    longitude: "72.8777"
  },
  {
    id: 3,
    title: "Commercial Office Space",
    location: "Bangalore, Karnataka",
    area: "8,000 sq ft",
    price: "₹5.2 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Office+Space",
    status: "Smart Contract Verified",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 4,
    verified: true,
    views: 2156,
    description: "Spacious commercial office space in a bustling business district. Features multiple cabins, conference rooms, and ample parking.",
    ownerId: "0xOwner789ghi",
    latitude: "12.9716",
    longitude: "77.5946"
  },
  {
    id: 4,
    title: "Penthouse with City View",
    location: "Delhi, NCR",
    area: "3,200 sq ft",
    price: "₹4.1 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Penthouse",
    status: "Tokenized",
    type: "Penthouse",
    bedrooms: 3,
    bathrooms: 3,
    verified: true,
    views: 1678,
    description: "Luxurious penthouse offering panoramic city views, high-end finishes, and exclusive access to rooftop amenities. A true urban oasis.",
    ownerId: "0xOwner012jkl",
    latitude: "28.6139",
    longitude: "77.2090"
  },
  {
    id: 5,
    title: "Farmhouse with Land",
    location: "Lonavala, Maharashtra",
    area: "12,000 sq ft",
    price: "₹3.8 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Farmhouse",
    status: "Pending Sale",
    type: "Farmhouse",
    bedrooms: 5,
    bathrooms: 4,
    verified: false,
    views: 743,
    description: "Expansive farmhouse property with vast agricultural land, perfect for a serene retreat or agricultural ventures. Includes a large main house and outbuildings.",
    ownerId: "0xOwner345mno",
    latitude: "18.7500",
    longitude: "73.4000"
  },
  {
    id: 6,
    title: "Studio Apartment",
    location: "Pune, Maharashtra",
    area: "650 sq ft",
    price: "₹85 L",
    image: "/placeholder.svg?height=200&width=300&text=Studio",
    status: "Smart Contract Verified",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    verified: true,
    views: 456,
    description: "Compact and efficient studio apartment, ideal for singles or couples. Located near major IT hubs with easy access to public transport.",
    ownerId: "0xOwner678pqr",
    latitude: "18.5204",
    longitude: "73.8567"
  },
];

export default function PropertyDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = parseInt(params.propertyId as string) // Get propertyId from URL
  console.log("Property ID:", propertyId)
  const [property, setProperty] = useState<typeof mockProperties[0] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you'd fetch property details from an API/blockchain
    const foundProperty = mockProperties.find((p) => p.id === propertyId)
    if (foundProperty) {
      setProperty(foundProperty)
    } else {
      setError("Property not found.")
    }
  }, [propertyId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tokenized":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Pending Sale":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Smart Contract Verified":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center glass">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/marketplace")}>Back to Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="ml-4 text-lg text-muted-foreground">Loading property details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      <Navbar />

      <main className="px-4 py-8">
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
                    <p className="text-purple-100">{property.location}</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/marketplace")}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace
                </Button>
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                Property Overview
              </CardTitle>
              <CardDescription>Detailed information about this property.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <img
                src={property.image || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/600x400/E0E0E0/333333?text=${encodeURIComponent(property.title)}`;
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    Location
                  </h3>
                  <p className="text-muted-foreground">{property.location}</p>
                  <p className="text-muted-foreground text-sm">
                    Latitude: {property.latitude || "N/A"}, Longitude: {property.longitude || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    Pricing & Area
                  </h3>
                  <p className="text-2xl font-bold text-foreground">{property.price}</p>
                  <p className="text-muted-foreground text-sm">Area: {property.area}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Description
                </h3>
                <p className="text-muted-foreground">{property.description || "No detailed description available."}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{property.type}</p>
                </div>
                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Bedrooms:</span>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Bathrooms:</span>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Verification:</span>
                  <Badge className={property.verified ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                    {property.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Views:</span>
                  <p className="font-medium flex items-center"><Eye className="h-4 w-4 mr-1" /> {property.views}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-muted-foreground">Owner ID:</span>
                  <p className="font-medium text-xs break-all">{property.ownerId || "N/A"}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                  onClick={() => router.push(`/purchase/${propertyId}`)}
                  className="flex-1 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                >
                  Initiate Purchase
                </Button>
                <Button
                  onClick={() => router.push("/marketplace")}
                  variant="outline"
                  className="flex-1 border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5 bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
