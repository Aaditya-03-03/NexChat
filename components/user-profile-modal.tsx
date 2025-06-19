import { useState, useEffect } from "react"
import { 
  Mail, 
  Bell, 
  Ban, 
  Trash2, 
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusIndicator, UserStatus } from "@/components/ui/status-indicator"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface UserProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  userStatus?: UserStatus
}

export function UserProfileModal({ userId, isOpen, onClose, userStatus = "offline" }: UserProfileModalProps) {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return
      
      setLoading(true)
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          setUserProfile({
            id: userDoc.id,
            ...userDoc.data()
          })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
      setLoading(false)
    }

    if (isOpen) {
      fetchUserProfile()
    }
  }, [userId, isOpen])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md p-0 gap-0 bg-[#0a0a0a] text-white rounded-lg">
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className="text-lg sm:text-xl font-semibold">Profile</h2>
          </DialogTitle>
        </DialogHeader>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-2 sm:p-4 pb-2">
          <span />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[80vh]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : userProfile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center space-y-2 p-4 pt-2 sm:pt-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={userProfile.photoURL || ""} />
                  <AvatarFallback className="text-xl sm:text-2xl bg-gray-700">
                    {userProfile.displayName?.[0] || userProfile.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mt-2">{userProfile.displayName}</h3>
                  <p className="text-gray-400 text-sm sm:text-base">{userStatus}</p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* About Section */}
              <div className="px-2 sm:px-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-medium">About</h4>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                  {userProfile.about || "Hey there! I'm using Nex Chat."}
                </p>
              </div>

              <Separator className="bg-white/10" />

              {/* Email Section */}
              <div className="px-2 sm:px-4">
                <h4 className="text-base sm:text-lg font-medium mb-2">Contact Info</h4>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-200 text-sm sm:text-base break-all">{userProfile.email}</p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Media, Links and Docs */}
              <div className="px-2 sm:px-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base sm:text-lg font-medium">Media, links and docs</h4>
                  <Button variant="link" className="text-emerald-500 h-auto p-0 text-xs sm:text-base">
                    See all
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  <div className="aspect-square bg-gray-800 rounded-lg"></div>
                  <div className="aspect-square bg-gray-800 rounded-lg"></div>
                  <div className="aspect-square bg-gray-800 rounded-lg hidden sm:block"></div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Actions */}
              <div className="space-y-2 p-2 sm:p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm sm:text-base py-2"
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Mute notifications
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 text-sm sm:text-base py-2"
                >
                  <Ban className="h-5 w-5 mr-3" />
                  Block {userProfile.displayName}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-500/10 text-sm sm:text-base py-2"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Delete chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-400">
              User profile not found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 