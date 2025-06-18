"use client"

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ShortLinkDisplayProps {
  shortUrl: string
  className?: string
  showCopyButton?: boolean
  showOpenButton?: boolean
  variant?: 'compact' | 'full'
}

export function ShortLinkDisplay({ 
  shortUrl, 
  className,
  showCopyButton = true,
  showOpenButton = true,
  variant = 'compact'
}: ShortLinkDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleOpen = () => {
    window.open(shortUrl, '_blank')
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground bg-background/20 rounded px-2 py-1", className)}>
        <span className="font-medium">Link:</span>
        <span className="truncate flex-1">{shortUrl}</span>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-4 w-4 p-0 hover:bg-background/40"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
        {showOpenButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpen}
            className="h-4 w-4 p-0 hover:bg-background/40"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 bg-background/20 rounded-lg", className)}>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">Short Link</span>
        <span className="text-xs text-muted-foreground truncate block">{shortUrl}</span>
      </div>
      <div className="flex gap-1">
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
        {showOpenButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpen}
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
} 