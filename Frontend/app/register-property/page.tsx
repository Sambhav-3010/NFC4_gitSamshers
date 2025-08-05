"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Upload, X, CheckCircle, Building2, MapPin, FileText } from "lucide-react"

export default function RegisterPropertyPage() {
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    area: "",
    ownerId: "",
    latitude: "",
    longitude: "",
    price: "",
    description: "",
  })
  const [documents, setDocuments] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Property title is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.area.trim()) newErrors.area = "Area is required"
    if (!formData.ownerId.trim()) newErrors.ownerId = "Owner ID is required"
    if (!formData.price.trim()) newErrors.price = "Price is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocuments((prev) => [...prev, ...files])
  }

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // Mock API call
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)

      setTimeout(() => {
        router.push("/marketplace")
      }, 2000)
    }, 2000)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center glass">
            <CardContent className="pt-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mb-2">
                Property Registered Successfully!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your property has been registered and will be available in the marketplace shortly.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to marketplace...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Register New Property</h1>
                  <p className="text-purple-100">Add your property to the blockchain registry</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Information */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    Property Details
                  </CardTitle>
                  <CardDescription>Basic information about your property</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Modern Villa in Gurgaon"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.title}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Complete property address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.address}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (sq ft) *</Label>
                      <Input
                        id="area"
                        placeholder="e.g., 2500"
                        value={formData.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.area ? "border-red-500" : ""}`}
                      />
                      {errors.area && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.area}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        placeholder="e.g., ₹2.5 Cr"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.price ? "border-red-500" : ""}`}
                      />
                      {errors.price && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.price}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Owner ID *</Label>
                    <Input
                      id="ownerId"
                      placeholder="Property owner identification"
                      value={formData.ownerId}
                      onChange={(e) => handleInputChange("ownerId", e.target.value)}
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.ownerId ? "border-red-500" : ""}`}
                    />
                    {errors.ownerId && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.ownerId}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the property"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.description ? "border-red-500" : ""}`}
                    />
                    {errors.description && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.description}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location & Documents */}
              <div className="space-y-6">
                {/* Location */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                      Location Coordinates
                    </CardTitle>
                    <CardDescription>GPS coordinates for precise location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          placeholder="e.g., 28.4595"
                          value={formData.latitude}
                          onChange={(e) => handleInputChange("latitude", e.target.value)}
                          className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          placeholder="e.g., 77.0266"
                          value={formData.longitude}
                          onChange={(e) => handleInputChange("longitude", e.target.value)}
                          className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Upload */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                      Property Documents
                    </CardTitle>
                    <CardDescription>Upload ownership deed, tax records, etc.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-purple-800/20 dark:border-purple-100/20 rounded-lg p-6 text-center hover:border-purple-800/40 dark:hover:border-purple-100/40 transition-colors">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-purple-800 dark:text-purple-100" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB each</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Uploaded Documents</h4>
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-purple-800/20 dark:border-purple-100/20"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-purple-800 dark:text-purple-100" />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-purple-800/20 dark:border-purple-100/20 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
              >
                {isLoading ? "Registering Property..." : "Register Property"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
