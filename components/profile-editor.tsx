"use client"

import { useState, useRef } from "react"
import { User, Camera, Save, X, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileService } from "@/lib/file-service"
import { ChatService } from "@/lib/chat-service"
import { useAuthContext } from "@/components/auth-provider"
import { toast } from "sonner"

interface ProfileEditorProps {
  user: any
  userProfile: any
  onClose: () => void
  onUpdate: (profile: any) => void
}

export function ProfileEditor({ user, userProfile, onClose, onUpdate }: ProfileEditorProps) {
  const { refreshUserProfile } = useAuthContext()
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "")
  const [bio, setBio] = useState(userProfile?.bio || "")
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required")
      return
    }

    setIsLoading(true)
    try {
      const result = await ChatService.updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL,
      })

      if (result.success) {
        toast.success("Profile updated successfully")
        onUpdate({
          ...userProfile,
          displayName: displayName.trim(),
          bio: bio.trim(),
          photoURL,
        })
        onClose()
        refreshUserProfile()
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!FileService.isImage(file)) {
      toast.error("Please select a valid image file (JPG, PNG, GIF)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploading(true)
    const originalPhotoURL = photoURL // Store original URL for potential revert
    try {
      const uploadResult = await FileService.uploadProfilePicture(file, user.uid)
      
      if (uploadResult.success && uploadResult.url) {
        setPhotoURL(uploadResult.url) // Optimistically update UI
        toast.promise(
          ChatService.updateUserProfile(user.uid, { photoURL: uploadResult.url }),
          {
            loading: "Saving new picture...",
            success: (updateResult) => {
              if (updateResult.success) {
                onUpdate({ ...userProfile, photoURL: uploadResult.url })
                refreshUserProfile()
                return "Profile picture updated successfully!"
              } else {
                // Manually throw to enter the catch block for toast
                throw new Error(updateResult.error || "Failed to save profile picture.")
              }
            },
            error: (err) => {
              setPhotoURL(originalPhotoURL) // Revert on failure
              return err.message
            },
          }
        )
      } else {
        toast.error(uploadResult.error || "Failed to upload image")
      }
    } catch (error: any) {
      setPhotoURL(originalPhotoURL) // Revert on failure
      toast.error(error.message || "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const handleRemovePhoto = async () => {
    const originalPhotoURL = photoURL
    setPhotoURL(null) // Optimistically update UI

    try {
      const result = await ChatService.updateUserProfile(user.uid, { photoURL: null })
      if (result.success) {
        toast.success("Profile picture removed successfully")
        onUpdate({ ...userProfile, photoURL: null })
        refreshUserProfile()
      } else {
        setPhotoURL(originalPhotoURL) // Revert on failure
        toast.error(result.error || "Failed to remove profile picture")
      }
    } catch (error: any) {
      setPhotoURL(originalPhotoURL) // Revert on failure
      toast.error(error.message || "Failed to remove profile picture")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                {photoURL && <AvatarImage src={photoURL} alt={displayName} className="object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl font-semibold">
                  {displayName ? displayName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              <div 
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              
              {photoURL && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name *
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="mt-1"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {displayName.length}/50 characters
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                value={userProfile?.email || ""}
                className="mt-1 bg-muted/50"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="mt-1 resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bio.length}/200 characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !displayName.trim() || isUploading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 