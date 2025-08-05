"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void
  acceptedTypes?: string
  maxFiles?: number
  maxSize?: number // in MB
}

export function FileUploader({
  onFilesChange,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
  maxFiles = 5,
  maxSize = 10,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<Record<string, "pending" | "success" | "error">>({})

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

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const sizeInMB = file.size / 1024 / 1024
      return sizeInMB <= maxSize
    })

    if (files.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)

    // Simulate upload status
    validFiles.forEach((file) => {
      const fileId = `${file.name}-${file.size}`
      setUploadStatus((prev) => ({ ...prev, [fileId]: "pending" }))

      setTimeout(
        () => {
          setUploadStatus((prev) => ({
            ...prev,
            [fileId]: Math.random() > 0.1 ? "success" : "error",
          }))
        },
        1000 + Math.random() * 2000,
      )
    })
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const getStatusIcon = (file: File) => {
    const fileId = `${file.name}-${file.size}`
    const status = uploadStatus[fileId]

    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-purple-800 border-t-transparent animate-spin" />
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? "border-purple-800 bg-purple-800/5" : "border-purple-800/20 hover:border-purple-800/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-800/10 to-purple-100/10 flex items-center justify-center">
          <Upload className="h-6 w-6 text-purple-800 dark:text-purple-100" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground">
          {acceptedTypes.replace(/\./g, "").toUpperCase()} up to {maxSize}MB each
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          {files.map((file, index) => (
            <Card key={index} className="border border-purple-800/20">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-800 dark:text-purple-100" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
