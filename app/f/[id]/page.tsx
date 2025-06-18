"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getOriginalUrl } from '@/lib/utils'
import { Loader2, File, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FileRedirectPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [fileData, setFileData] = useState<{ url: string; fileName?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const shortId = params.id as string
    if (!shortId) {
      setError("Invalid file link")
      setLoading(false)
      return
    }

    const data = getOriginalUrl(shortId)
    if (data) {
      setFileData(data)
      setLoading(false)
    } else {
      setError("File not found or link has expired")
      setLoading(false)
    }
  }, [params.id])

  const handleDownload = () => {
    if (fileData) {
      window.open(fileData.url, '_blank')
    }
  }

  const handleCopyLink = () => {
    if (fileData) {
      navigator.clipboard.writeText(fileData.url)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">File Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <File className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {fileData?.fileName || 'Shared File'}
              </CardTitle>
              <CardDescription>
                Click below to download or view the file
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            This is a secure file link from NexChat
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 