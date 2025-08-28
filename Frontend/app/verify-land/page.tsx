"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, Clock, X, Building2, User2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "approved" | "rejected"
}

export default function VerifyPage() {
  const [propertyProofFile, setPropertyProofFile] = useState<UploadedFile | null>(null)
  const [idProofNumber, setIdProofNumber] = useState("")
  const [isPropertyDragOver, setIsPropertyDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Simulate verification status for ID and property proof
  const [idProofStatus, setIdProofStatus] = useState<"pending" | "approved" | "rejected" | "none">("none")
  const [propertyProofStatus, setPropertyProofStatus] = useState<"pending" | "approved" | "rejected" | "none">("none")

  // Drag and drop handlers for property proof
  const handlePropertyDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsPropertyDragOver(true)
  }, [])

  const handlePropertyDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsPropertyDragOver(false)
  }, [])

  const handlePropertyDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsPropertyDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handlePropertyFile(files[0])
    }
  }, [])

  const handlePropertyFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePropertyFile(file)
    }
  }

  const handlePropertyFile = (file: File) => {
    // Only accept image files
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file for property proof.")
      return
    }

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
    }
    setPropertyProofFile(newFile)
    setPropertyProofStatus("pending")

    // Simulate file processing
    setTimeout(
      () => {
        const status = Math.random() > 0.3 ? "approved" : "rejected"
        setPropertyProofFile((prev) => (prev ? { ...prev, status } : null))
        setPropertyProofStatus(status)
      },
      2000 + Math.random() * 3000,
    )
  }

  // ID proof handlers
  const handleIdProofNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIdProofNumber(value)

    // Reset status if input is cleared
    if (value === "") {
      setIdProofStatus("none")
    }
  }

  const handleIdProofVerify = () => {
    // Basic validation for Aadhaar (12 digits) or PAN (10 alphanumeric)
    const isAadhaar = /^\d{12}$/.test(idProofNumber)
    const isPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idProofNumber)
    if (!isAadhaar && !isPan) {
      alert("Please enter a valid Aadhaar (12 digits) or PAN (10 alphanumeric) number.")
      setIdProofStatus("rejected")
      return
    }

    setIdProofStatus("pending")
    // Simulate API call for verification
    setTimeout(() => {
      const status = Math.random() > 0.3 ? "approved" : "rejected"
      setIdProofStatus(status)
    }, 2000)
  }

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    }
  }

  // Status badge icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Submit handler
  const handleSubmit = () => {
    setIsLoading(true)
    setTimeout(() => {
      localStorage.setItem("verificationStatus", "pending")
      router.push("/dashboard")
      setIsLoading(false)
    }, 2000)
  }

  // Check if both verifications are approved to enable the submit button
  const canSubmit = idProofStatus === "approved" && propertyProofStatus === "approved"

  // Calculate progress for the progress bar
  const verificationProgress = useMemo(() => {
    let progress = 0
    if (idProofStatus === "approved") progress += 50
    if (propertyProofStatus === "approved") progress += 50
    return progress
  }, [idProofStatus, propertyProofStatus])

  return (
    <div className="min-h-screen relative overflow-hidden ">
      <div className="absolute inset-0 animated-gradient opacity-90"></div>


      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full mr-20 ml-20 space-y-6">
          {/* Header */}
          <Card className="glass">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center mr-3">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                    PropChain
                  </h1>
                  <p className="text-xs text-muted-foreground">Blockchain Real Estate</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Document Verification</CardTitle>
              <CardDescription>Upload your documents for identity and eligibility verification</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Property Proof Upload */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Property Proof (Image)
                </CardTitle>
                <CardDescription>Upload an image of your property document</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isPropertyDragOver
                      ? "border-purple-800 bg-purple-800/5 dark:border-purple-100 dark:bg-purple-100/5"
                      : "border-purple-800/20 dark:border-purple-100/20 hover:border-purple-800/40 dark:hover:border-purple-100/40"
                  }`}
                  onDragOver={handlePropertyDragOver}
                  onDragLeave={handlePropertyDragLeave}
                  onDrop={handlePropertyDrop}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-purple-800 dark:text-purple-100" />
                  </div>
                  <p className="text-lg font-medium mb-2">Drop image here or click to upload</p>
                  <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG files up to 10MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePropertyFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                    size="sm"
                  >
                    Browse Image
                  </Button>
                </div>

                {/* Uploaded File status */}
                {propertyProofFile && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-medium">Uploaded File</h3>
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-purple-800/20 dark:border-purple-100/20">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-800 dark:text-purple-100" />
                        <div>
                          <p className="font-medium text-sm">{propertyProofFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(propertyProofFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(propertyProofFile.status)}>
                          {getStatusIcon(propertyProofFile.status)}
                          <span className="ml-1 capitalize">{propertyProofFile.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ID Proof Input */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  ID Proof (Aadhaar or PAN)
                </CardTitle>
                <CardDescription>Enter your Aadhaar or PAN card number</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="id-proof-number">Aadhaar or PAN Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        id="id-proof-number"
                        placeholder="Enter 12-digit Aadhaar or 10-char PAN"
                        value={idProofNumber}
                        onChange={handleIdProofNumberChange}
                        className="flex-grow"
                      />
                      <Button
                        onClick={handleIdProofVerify}
                        disabled={!idProofNumber || idProofStatus === "pending"}
                        className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                      >
                        {idProofStatus === "pending" ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </div>
                  {/* Status badge for ID Proof */}
                  {idProofStatus !== "none" && (
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-purple-800/20 dark:border-purple-100/20">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-800 dark:text-purple-100" />
                        <p className="font-medium text-sm">ID Proof Number</p>
                      </div>
                      <Badge className={getStatusColor(idProofStatus)}>
                        {getStatusIcon(idProofStatus)}
                        <span className="ml-1 capitalize">{idProofStatus}</span>
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Status & Submit */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Check the status of your document verifications below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress:</span>
                  <span className="font-medium">{verificationProgress}%</span>
                </div>
                <Progress value={verificationProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-purple-800/20 dark:border-purple-100/20">
                  <span className="text-sm font-medium">Property Proof</span>
                  <Badge className={getStatusColor(propertyProofStatus)}>
                    {getStatusIcon(propertyProofStatus)}
                    <span className="ml-1 capitalize">{propertyProofStatus}</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-purple-800/20 dark:border-purple-100/20">
                  <span className="text-sm font-medium">ID Proof</span>
                  <Badge className={getStatusColor(idProofStatus)}>
                    {getStatusIcon(idProofStatus)}
                    <span className="ml-1 capitalize">{idProofStatus}</span>
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
              </Button>
              {!canSubmit && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Both property and ID proof must be approved to proceed.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}