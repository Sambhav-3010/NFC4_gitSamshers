"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FileUploader } from "@/components/file-uploader"
import { Shield, FileText, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  status: "pending" | "verified" | "rejected"
  uploadDate: string
  reason?: string
}

export default function VerifyDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "property_deed.pdf",
      type: "Ownership Deed",
      status: "verified",
      uploadDate: "2024-01-15",
    },
    {
      id: "2",
      name: "tax_records.pdf",
      type: "Tax Records",
      status: "pending",
      uploadDate: "2024-01-16",
    },
    {
      id: "3",
      name: "id_proof.jpg",
      type: "ID Proof",
      status: "rejected",
      uploadDate: "2024-01-14",
      reason: "Document quality too low",
    },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  const handleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      setIsUploading(true)

      // Simulate upload process
      setTimeout(() => {
        const newDocuments = files.map((file, index) => ({
          id: Date.now().toString() + index,
          name: file.name,
          type: "Uploaded Document",
          status: "pending" as const,
          uploadDate: new Date().toISOString().split("T")[0],
        }))

        setDocuments((prev) => [...prev, ...newDocuments])
        setIsUploading(false)
      }, 2000)
    }
  }

  const handleReupload = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? { ...doc, status: "pending" as const, reason: undefined } : doc)),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const verifiedCount = documents.filter((doc) => doc.status === "verified").length
  const pendingCount = documents.filter((doc) => doc.status === "pending").length
  const rejectedCount = documents.filter((doc) => doc.status === "rejected").length

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
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Document Verification</h1>
                  <p className="text-purple-100">Upload and verify your legal documents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verifiedCount}</div>
                <p className="text-xs text-muted-foreground">Documents approved</p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Under review</p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedCount}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upload Section */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Upload Documents
                </CardTitle>
                <CardDescription>Upload ID proofs, ownership certificates, and other legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFilesChange={handleFilesChange}
                  acceptedTypes=".pdf,.jpg,.jpeg,.png"
                  maxFiles={10}
                  maxSize={10}
                />
                {isUploading && (
                  <div className="mt-4 p-4 bg-purple-800/5 rounded-lg border border-purple-800/20">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full border-2 border-purple-800 border-t-transparent animate-spin" />
                      <span className="text-sm">Uploading documents...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Documents */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>Please ensure you have uploaded all required documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Government ID", description: "Aadhaar, Passport, or Driver's License" },
                    { name: "Address Proof", description: "Utility bill or bank statement" },
                    { name: "Property Deed", description: "Legal ownership document" },
                    { name: "Tax Records", description: "Property tax payment receipts" },
                    { name: "NOC Certificate", description: "No Objection Certificate (if applicable)" },
                  ].map((doc, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-background/50 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-800 dark:text-purple-100 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Status */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
              <CardDescription>Track the verification status of your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-purple-800/20"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-purple-800 dark:text-purple-100" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {doc.uploadDate}</p>
                          {doc.reason && <p className="text-xs text-red-600 mt-1">{doc.reason}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(doc.status)}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1 capitalize">{doc.status}</span>
                        </Badge>
                        {doc.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReupload(doc.id)}
                            className="border-purple-800/20 dark:border-purple-100/20"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Re-upload
                          </Button>
                        )}
                      </div>
                    </div>
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
