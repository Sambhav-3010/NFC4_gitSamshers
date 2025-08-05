"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle, Building2, MapPin } from "lucide-react"

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [propertyDocFile, setPropertyDocFile] = useState<File | null>(null)

  // Camera modal states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [liveCaptureImage, setLiveCaptureImage] = useState<File | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Cleanup camera stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setIsStreaming(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current && mounted) {
            videoRef.current.srcObject = stream
            setIsStreaming(true)
          }
        } catch {
          alert("Unable to access camera")
          setIsStreaming(false)
        }
      } else {
        alert("Camera not supported by browser")
      }
    }

    if (isCameraModalOpen && !liveCaptureImage) {
      startCamera()
    }

    return () => {
      mounted = false
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setIsStreaming(false)
    }
  }, [isCameraModalOpen, liveCaptureImage])

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
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const renameFileWithSuffix = (file: File, suffix: string) => {
    const dotIndex = file.name.lastIndexOf(".")
    const namePart = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name
    const extension = dotIndex !== -1 ? file.name.substring(dotIndex) : ""
    return new File([file], `${namePart}${suffix}${extension}`, { type: file.type })
  }

  const validateFiles = () => {
    if (!aadhaarFile) { alert("Please upload the Aadhaar image."); return false }
    if (!propertyDocFile) { alert("Please upload the Property document image."); return false }
    if (!liveCaptureImage) { alert("Please capture the Live Camera image."); return false }
    return true
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const width = videoRef.current.videoWidth
      const height = videoRef.current.videoHeight
      canvasRef.current.width = width
      canvasRef.current.height = height
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height)
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setLiveCaptureImage(new File([blob], "livephoto_live.png", { type: "image/png" }))
          }
        }, "image/png")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !validateFiles()) return
    setIsLoading(true)

    try {
      const aadhaarRenamed = renameFileWithSuffix(aadhaarFile!, "_id")
      const propertyDocRenamed = renameFileWithSuffix(propertyDocFile!, "_deed")

      const data = new FormData()
      data.append("aadhaarImage", aadhaarRenamed)
      data.append("propertyDeedImage", propertyDocRenamed)
      data.append("liveCaptureImage", liveCaptureImage!)

      for (const [key, value] of Object.entries(formData)) {
        data.append(key, value)
      }

      const response = await fetch("http://localhost:7000/upload", {
        method: "POST",
        body: data,
      })

      if (!response.ok) throw new Error("Failed to upload property data and images.")

      setIsLoading(false)
      setShowSuccess(true)
      localStorage.setItem("propertyDetailsSubmitted", "true")

      setTimeout(() => router.push("/verify-land"), 2000)
    } catch (error) {
      setIsLoading(false)
      alert(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full text-center glass">
            <CardContent className="pt-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mb-2">
                Property Details Submitted!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your property details and images have been recorded. Redirecting...
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to property verification...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
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
                    {errors.title && <Alert variant="destructive"><AlertDescription>{errors.title}</AlertDescription></Alert>}
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
                    {errors.address && <Alert variant="destructive"><AlertDescription>{errors.address}</AlertDescription></Alert>}
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
                      {errors.area && <Alert variant="destructive"><AlertDescription>{errors.area}</AlertDescription></Alert>}
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
                      {errors.price && <Alert variant="destructive"><AlertDescription>{errors.price}</AlertDescription></Alert>}
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
                    {errors.ownerId && <Alert variant="destructive"><AlertDescription>{errors.ownerId}</AlertDescription></Alert>}
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
                    {errors.description && <Alert variant="destructive"><AlertDescription>{errors.description}</AlertDescription></Alert>}
                  </div>
                </CardContent>
              </Card>

              {/* Location and Uploads */}
              <div className="space-y-6">
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

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Upload Documents and Live Capture</CardTitle>
                    <CardDescription>Upload your Aadhaar image, property document, and capture a live image using your camera.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Aadhaar Image Upload */}
                    <div>
                      <Label htmlFor="aadhaarFile">Aadhaar Image *</Label>
                      <input
                        id="aadhaarFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setAadhaarFile(file)
                        }}
                        className="mt-1"
                      />
                      {aadhaarFile && <p className="mt-2 text-sm text-muted-foreground">Selected file: {aadhaarFile.name}</p>}
                    </div>

                    {/* Property Document Upload */}
                    <div>
                      <Label htmlFor="propertyDocFile">Property Document Image *</Label>
                      <input
                        id="propertyDocFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setPropertyDocFile(file)
                        }}
                        className="mt-1"
                      />
                      {propertyDocFile && <p className="mt-2 text-sm text-muted-foreground">Selected file: {propertyDocFile.name}</p>}
                    </div>

                    {/* Live Camera Capture */}
                    <div>
                      <Label>Live Camera Capture Image *</Label>
                      {!liveCaptureImage && (
                        <Button type="button" onClick={() => setIsCameraModalOpen(true)} className="mt-2" variant="outline">
                          Capture with Camera
                        </Button>
                      )}
                      {liveCaptureImage && (
                        <div className="flex flex-col items-start mt-2">
                          <img
                            src={URL.createObjectURL(liveCaptureImage)}
                            alt="Live capture preview"
                            style={{ width: 160, borderRadius: 8 }}
                          />
                          <Button type="button" variant="outline" className="mt-2" onClick={() => setIsCameraModalOpen(true)}>
                            Retake
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-purple-800/20 dark:border-purple-100/20 bg-transparent"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
              >
                {isLoading ? "Submitting Details..." : "Submit Property Details"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Camera Modal Overlay */}
      {isCameraModalOpen && (
        <div
          style={{
            position: "fixed",
            zIndex: 1000,
            inset: 0,
            background: "rgba(10,10,10,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              boxShadow: "0 0 16px 2px #222",
              minWidth: 320,
              maxWidth: "95vw",
            }}
          >
            <h2 style={{ marginBottom: 12 }}>Live Camera</h2>
            {(!liveCaptureImage || isStreaming) ? (
              <div style={{ width: 320 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="flex gap-2 mt-2">
                  <Button type="button" onClick={handleCapture} className="mt-2">
                    Capture
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setLiveCaptureImage(null)
                      setIsCameraModalOpen(false)
                    }}
                    className="mt-2"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ width: 320 }}>
                <img
                  src={URL.createObjectURL(liveCaptureImage)}
                  alt="Live preview"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setLiveCaptureImage(null)
                      setTimeout(() => setIsCameraModalOpen(true), 120)
                    }}
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsCameraModalOpen(false)}
                    variant="outline"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}