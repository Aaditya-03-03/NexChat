"use client"

import { useState, useEffect } from "react"
import { X, MessageSquare, Phone, Video, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ProfilePhotoViewerProps {
  isOpen: boolean
  onClose: () => void
  photoURL: string
  userName: string
  userId?: string
  onMessage?: () => void
  onAudioCall?: () => void
  onVideoCall?: () => void
  onInfo?: () => void
}

export function ProfilePhotoViewer({ isOpen, onClose, photoURL, userName, userId, onMessage, onAudioCall, onVideoCall, onInfo }: ProfilePhotoViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(false)
    }
  }, [isOpen])

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError(true)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[400px] aspect-square p-0 bg-black/95 border-0 rounded-lg">
        <DialogTitle className="sr-only">Profile Photo Viewer</DialogTitle>
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-black/50 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium text-sm">{userName}</h3>
              {userId && (
                <span className="text-white/60 text-xs">ID: {userId}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full hover:bg-white/10 text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Image Container - Square Area */}
          <div className="flex-1 relative overflow-hidden p-4 flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
            
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <X className="h-6 w-6" />
                </div>
                <p className="text-sm">Failed to load image</p>
              </div>
            ) : (
              <div 
                className="w-full h-full"
              >
                <img
                  src={photoURL}
                  alt={`${userName}'s profile photo`}
                  className="w-full h-full object-cover rounded-lg"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  draggable={false}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 p-4 bg-black/50 backdrop-blur-sm border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMessage}
              className="h-10 w-10 rounded-full hover:bg-white/10 text-white"
              title="Send Message"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAudioCall}
              className="h-10 w-10 rounded-full hover:bg-white/10 text-white"
              title="Audio Call"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onVideoCall}
              className="h-10 w-10 rounded-full hover:bg-white/10 text-white"
              title="Video Call"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onInfo}
              className="h-10 w-10 rounded-full hover:bg-white/10 text-white"
              title="Profile Info"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 