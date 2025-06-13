"use client"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, File, FileText, Music, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileService } from "@/lib/file-service"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onUploadComplete: (url: string, type: 'image' | 'file') => void
  onUploadError: (error: string) => void
  chatId: string
  className?: string
  disabled?: boolean
}

export function FileUpload({ 
  onFileSelect, 
  onUploadComplete, 
  onUploadError, 
  chatId,
  className,
  disabled = false 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError("File size must be less than 10MB")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let result
      let type: 'image' | 'file'

      if (FileService.isImage(file)) {
        result = await FileService.uploadImage(file, chatId)
        type = 'image'
      } else if (FileService.isDocument(file)) {
        result = await FileService.uploadDocument(file, chatId)
        type = 'file'
      } else {
        throw new Error("Unsupported file type")
      }

      if (result.success && result.url) {
        onUploadComplete(result.url, type)
        setUploadProgress(100)
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error: any) {
      onUploadError(error.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const getFileIcon = (file: File) => {
    if (FileService.isImage(file)) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type.includes('video')) {
      return <Video className="h-4 w-4" />
    } else if (file.type.includes('audio')) {
      return <Music className="h-4 w-4" />
    } else if (file.type.includes('text')) {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Images, PDFs, documents up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// File preview component
interface FilePreviewProps {
  file: File
  onRemove: () => void
  className?: string
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  return (
    <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg", className)}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(file)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {FileService.formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

function getFileIcon(file: File) {
  if (FileService.isImage(file)) {
    return <ImageIcon className="h-4 w-4" />
  } else if (file.type.includes('video')) {
    return <Video className="h-4 w-4" />
  } else if (file.type.includes('audio')) {
    return <Music className="h-4 w-4" />
  } else if (file.type.includes('text')) {
    return <FileText className="h-4 w-4" />
  } else {
    return <File className="h-4 w-4" />
  }
} 