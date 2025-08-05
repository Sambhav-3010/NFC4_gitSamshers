"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, CheckCircle } from "lucide-react"

const categories = [
  "Electronics",
  "Textiles",
  "Machinery",
  "Food & Beverages",
  "Chemicals",
  "Automotive",
  "Pharmaceuticals",
  "Raw Materials",
]

const esgTags = [
  "Organic",
  "Fair Trade",
  "Carbon Neutral",
  "Recyclable",
  "Sustainable Sourcing",
  "Renewable Energy",
  "Zero Waste",
  "Ethical Labor",
]

const countries = [
  "China",
  "Germany",
  "United States",
  "Japan",
  "United Kingdom",
  "India",
  "South Korea",
  "Italy",
  "France",
  "Canada",
]

export default function ProductListingPage() {
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: "",
    quantity: "",
    units: "",
    countryOfExport: "",
    selectedEsgTags: [] as string[],
    images: [] as File[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required"
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be a positive number"
    }

    if (!formData.units.trim()) {
      newErrors.units = "Units are required"
    }

    if (!formData.countryOfExport) {
      newErrors.countryOfExport = "Country of export is required"
    }

    if (formData.selectedEsgTags.length === 0) {
      newErrors.esgTags = "Please select at least one ESG tag"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleEsgTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEsgTags: prev.selectedEsgTags.includes(tag)
        ? prev.selectedEsgTags.filter((t) => t !== tag)
        : [...prev.selectedEsgTags, tag],
    }))
    if (errors.esgTags) {
      setErrors((prev) => ({ ...prev, esgTags: "" }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.images.length > 5) {
      setErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed" }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Mock API call
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setFormData({
          productName: "",
          description: "",
          category: "",
          quantity: "",
          units: "",
          countryOfExport: "",
          selectedEsgTags: [],
          images: [],
        })
        setShowSuccess(false)
      }, 3000)
    }, 2000)
  }

  if (showSuccess) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
              <p className="text-muted-foreground mb-4">
                Your product has been successfully listed on the marketplace.
              </p>
              <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Listing</h1>
          <p className="text-muted-foreground mt-1">Add your products to the global marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide essential details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                    className={errors.productName ? "border-red-500" : ""}
                  />
                  {errors.productName && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.productName}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your product (minimum 50 characters)"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">{formData.description.length}/50 characters minimum</p>
                  {errors.description && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.description}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select product category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.category}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity & Location</CardTitle>
                <CardDescription>Specify quantity and export location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                      className={errors.quantity ? "border-red-500" : ""}
                    />
                    {errors.quantity && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.quantity}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="units">Units *</Label>
                    <Input
                      id="units"
                      placeholder="e.g., kg, pieces, tons"
                      value={formData.units}
                      onChange={(e) => handleInputChange("units", e.target.value)}
                      className={errors.units ? "border-red-500" : ""}
                    />
                    {errors.units && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.units}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryOfExport">Country of Export *</Label>
                  <Select onValueChange={(value) => handleInputChange("countryOfExport", value)}>
                    <SelectTrigger className={errors.countryOfExport ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.countryOfExport && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.countryOfExport}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ESG Tags */}
          <Card>
            <CardHeader>
              <CardTitle>ESG Tags *</CardTitle>
              <CardDescription>
                Select relevant Environmental, Social & Governance tags for your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {esgTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.selectedEsgTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleEsgTagToggle(tag)}
                  >
                    {tag}
                    {formData.selectedEsgTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
              {errors.esgTags && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{errors.esgTags}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload up to 5 images of your product (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.images}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Product Listing"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
