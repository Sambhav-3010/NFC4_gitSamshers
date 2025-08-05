"use client"

import type React from "react"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, CheckCircle, Package, Sparkles, ImageIcon } from "lucide-react"

const categories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys"]
const tags = ["New", "Popular", "Sale", "Limited Edition", "Eco-Friendly", "Premium"]

export default function ProductsPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    selectedTags: [] as string[],
    images: [] as File[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.price.trim()) newErrors.price = "Price is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
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
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          name: "",
          description: "",
          category: "",
          price: "",
          selectedTags: [],
          images: [],
        })
      }, 3000)
    }, 2000)
  }

  if (showSuccess) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md text-center gradient-border">
            <div className="gradient-border-content">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mb-2">
                  Success!
                </h2>
                <p className="text-muted-foreground mb-4">Your product has been successfully added to the catalog.</p>
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                >
                  Add Another Product
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Product Listing</h1>
                <p className="text-purple-100">Add your products with beautiful forms and validation</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card className="glass border-purple-800/20 dark:border-purple-100/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.description}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger
                        className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 ${errors.category ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select category" />
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

                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className={`bg-background/50 border-purple-800/20 dark:border-purple-100/20 focus:ring-purple-800 dark:focus:ring-purple-100 ${errors.price ? "border-red-500" : ""}`}
                    />
                    {errors.price && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.price}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags and Images */}
            <div className="space-y-6">
              {/* Tags */}
              <div className="gradient-border">
                <Card className="gradient-border-content border-0">
                  <CardHeader>
                    <CardTitle>Product Tags</CardTitle>
                    <CardDescription>Select relevant tags for your product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={formData.selectedTags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            formData.selectedTags.includes(tag)
                              ? "bg-gradient-to-r from-purple-800 to-purple-600 text-white hover:from-purple-700 hover:to-purple-500"
                              : "border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5"
                          }`}
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                          {formData.selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Image Upload */}
              <Card className="glass border-purple-800/20 dark:border-purple-100/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    Product Images
                  </CardTitle>
                  <CardDescription>Upload images of your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative border-2 border-dashed border-purple-800/20 dark:border-purple-100/20 rounded-lg p-6 text-center hover:border-purple-800/40 dark:hover:border-purple-100/40 transition-colors">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-purple-800 dark:text-purple-100" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
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
              {isLoading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
