"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, Clock, X, Building2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "approved" | "rejected"
}

export default function VerifyPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const requiredDocuments = [
    { name: "ID Proof", description: "Aadhaar Card, Passport, or Driver's License" },
    { name: "Address Proof", description: "Utility Bill, Bank Statement, or Rental Agreement" },
    { name: "Income Proof", description: "Salary Slip, ITR, or Bank Statement" },
    { name: "Property Documents", description: "Sale Deed, Property Card, or NOC (if applicable)" },
  ]

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending" as const,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate file processing
    newFiles.forEach((file) => {
      setTimeout(
        () => {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, status: Math.random() > 0.3 ? "approved" : "rejected" } : f)),
          )
        },
        2000 + Math.random() * 3000,
      )
    })
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

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

  const handleSubmit = () => {
    setIsLoading(true)
    setTimeout(() => {
      localStorage.setItem("verificationStatus", "pending")
      router.push("/dashboard")
      setIsLoading(false)
    }, 2000)
  }

  const approvedFiles = uploadedFiles.filter((f) => f.status === "approved").length
  const canSubmit = approvedFiles >= 2

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient opacity-90"></div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl space-y-6">
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

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    Upload Documents
                  </CardTitle>
                  <CardDescription>Drag and drop files or click to browse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? "border-purple-800 bg-purple-800/5 dark:border-purple-100 dark:bg-purple-100/5"
                        : "border-purple-800/20 dark:border-purple-100/20 hover:border-purple-800/40 dark:hover:border-purple-100/40"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-purple-800 dark:text-purple-100" />
                    </div>
                    <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                    <p className="text-sm text-muted-foreground mb-4">Supports PDF, JPG, PNG files up to 10MB each</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500">
                      Browse Files
                    </Button>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="font-medium">Uploaded Files</h3>
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-purple-800/20 dark:border-purple-100/20"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-purple-800 dark:text-purple-100" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(file.status)}>
                              {getStatusIcon(file.status)}
                              <span className="ml-1 capitalize">{file.status}</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Required Documents & Status */}
            <div className="space-y-6">
              <Card className="gradient-border">
                <div className="gradient-border-content">
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>Please upload the following documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {requiredDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="p-3 bg-background/50 rounded-lg border border-purple-800/10 dark:border-purple-100/10"
                      >
                        <h4 className="font-medium text-sm">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </div>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Files Uploaded:</span>
                      <span className="text-sm font-medium">{uploadedFiles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Approved:</span>
                      <span className="text-sm font-medium text-green-600">{approvedFiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending:</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {uploadedFiles.filter((f) => f.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rejected:</span>
                      <span className="text-sm font-medium text-red-600">
                        {uploadedFiles.filter((f) => f.status === "rejected").length}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="w-full mt-4 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                  >
                    {isLoading ? "Submitting..." : "Submit for Verification"}
                  </Button>

                  {!canSubmit && uploadedFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      At least 2 approved documents required to proceed
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
