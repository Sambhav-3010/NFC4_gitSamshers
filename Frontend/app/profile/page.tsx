"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { User, Building2, Plus, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: "Modern Villa in Gurgaon",
      address: "Sector 45, Gurgaon, Haryana",
      area: "3500 sq ft",
      price: "₹2.5 Cr",
      status: "Listed",
      image: "/placeholder.svg?height=200&width=300&text=Villa",
    },
    {
      id: 2,
      title: "Luxury Apartment",
      address: "Bandra West, Mumbai, Maharashtra",
      area: "1800 sq ft",
      price: "₹3.2 Cr",
      status: "Sold",
      image: "/placeholder.svg?height=200&width=300&text=Apartment",
    },
  ])
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState("All")

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setUser({
      name: localStorage.getItem("userName") || "John Doe",
      email: localStorage.getItem("userEmail") || "john@example.com",
      role: localStorage.getItem("userRole") || "buyer",
    })
  }, [router])

  const handleAddToMarketplace = (propertyId: number) => {
    setProperties((prev) => prev.map((prop) => (prop.id === propertyId ? { ...prop, status: "On Sale" } : prop)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Listed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "On Sale":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Sold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
                  <p className="text-purple-100 capitalize">{user.role} Dashboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <Badge className="capitalize bg-gradient-to-r from-purple-800/10 to-purple-100/10 text-purple-800 dark:text-purple-100">
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Properties Listed</span>
                  <span className="font-medium">{properties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Listings</span>
                  <span className="font-medium">
                    {properties.filter((p) => p.status === "Listed" || p.status === "On Sale").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sold Properties</span>
                  <span className="font-medium">{properties.filter((p) => p.status === "Sold").length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                >
                  <Link href="/register-property">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Property
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                >
                  <Link href="/verify-documents">Verify Documents</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                >
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Properties Section */}
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    My Properties
                  </CardTitle>
                  <CardDescription>Manage your registered properties</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={setFilterStatus} defaultValue="All">
                    <SelectTrigger className="w-[180px] bg-transparent border-purple-800/20 dark:border-purple-100/20">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Properties</SelectItem>
                      <SelectItem value="Listed">Listed</SelectItem>
                      <SelectItem value="On Sale">On Sale</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                  >
                    <Link href="/register-property">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No properties registered yet.</p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                  >
                    <Link href="/register-property">Register Your First Property</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {properties
                    .filter((property) => {
                      if (filterStatus === "All") return true
                      return property.status === filterStatus
                    })
                    .map((property) => (
                      <Card
                        key={property.id}
                        className="overflow-hidden border border-purple-800/20 dark:border-purple-100/20"
                      >
                        <div className="aspect-video bg-muted">
                          <img
                            src={property.image || "/placeholder.svg"}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{property.title}</CardTitle>
                            <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                          </div>
                          <CardDescription className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {property.address}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Area:</span>
                              <p className="font-medium">{property.area}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <p className="font-medium">{property.price}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {property.status === "Listed" && (
                              <Button
                                size="sm"
                                onClick={() => handleAddToMarketplace(property.id)}
                                className="flex-1 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                              >
                                Add to Marketplace
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-800/20 dark:border-purple-100/20 text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
