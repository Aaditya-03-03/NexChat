"use client"

import { useState } from "react"
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Search, 
  Users, 
  Settings, 
  Bell, 
  BellOff, 
  Shield, 
  Trash2, 
  ArrowLeft,
  Crown,
  UserPlus,
  Volume2,
  VolumeX,
  Pin,
  Archive,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Chat, ChatService } from "@/lib/chat-service"
import { toast } from "sonner"

interface ChatHeaderProps {
  chat: Chat
  currentUser: any
  onBackToChatList?: () => void
  onShowProfile: () => void
  onShowSearch: () => void
  onShowGroupManagement?: () => void
  isMobile?: boolean
  className?: string
}

export function ChatHeader({ 
  chat, 
  currentUser, 
  onBackToChatList, 
  onShowProfile, 
  onShowSearch, 
  onShowGroupManagement,
  isMobile = false,
  className = "" 
}: ChatHeaderProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isAdmin = chat.admins?.includes(currentUser.uid) || false
  const isCreator = chat.admins?.[0] === currentUser.uid
  const isGroupChat = chat.type === 'group'

  const handleMuteToggle = async () => {
    setIsLoading(true)
    try {
      const result = await ChatService.muteChat(chat.id, currentUser.uid, !isMuted)
      if (result.success) {
        setIsMuted(!isMuted)
        toast.success(isMuted ? "Chat unmuted" : "Chat muted")
      } else {
        toast.error(result.error || "Failed to update mute status")
      }
    } catch (error) {
      toast.error("Failed to update mute status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchiveToggle = async () => {
    setIsLoading(true)
    try {
      const result = isArchived 
        ? await ChatService.unarchiveChat(chat.id, currentUser.uid)
        : await ChatService.archiveChat(chat.id, currentUser.uid)
      
      if (result.success) {
        setIsArchived(!isArchived)
        toast.success(isArchived ? "Chat unarchived" : "Chat archived")
      } else {
        toast.error(result.error || "Failed to update archive status")
      }
    } catch (error) {
      toast.error("Failed to update archive status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = async () => {
    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const result = await ChatService.deleteChat(chat.id, currentUser.uid)
      if (result.success) {
        toast.success("Chat deleted successfully")
        onBackToChatList?.()
      } else {
        toast.error(result.error || "Failed to delete chat")
      }
    } catch (error) {
      toast.error("Failed to delete chat")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceCall = () => {
    toast.info("Voice call feature coming soon!")
  }

  const handleVideoCall = () => {
    toast.info("Video call feature coming soon!")
  }

  return (
    <div className={`flex items-center justify-between p-3 md:p-4 border-b border-border/40 bg-background/95 backdrop-blur-sm ${className}`}>
      {/* Left side - Chat info and back button */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back button (mobile only) */}
        {isMobile && onBackToChatList && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToChatList}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10 -ml-1 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Back to chats</span>
          </Button>
        )}

        {/* Chat avatar and info */}
        <button 
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-muted/50 rounded-lg p-1 transition-colors" 
          onClick={onShowProfile}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              {isGroupChat ? (
                <div className="bg-gradient-to-br from-primary/20 to-primary/40 h-full w-full flex items-center justify-center">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
              ) : (
                <>
                  <AvatarImage src="/placeholder.svg" alt={chat.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                    {(chat.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            
            {/* Online indicator for direct chats */}
            {!isGroupChat && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>

          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm md:text-base truncate">
                {chat.name || "Unnamed Chat"}
              </p>
              {isMuted && (
                <Badge variant="secondary" className="text-xs">
                  <BellOff className="h-3 w-3 mr-1" />
                  Muted
                </Badge>
              )}
              {isPinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isGroupChat 
                ? `${chat.participants.length} members${isAdmin ? " • Admin" : ""}`
                : "Online • Tap for profile"
              }
            </p>
          </div>
        </button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Search button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onShowSearch}
          className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
          title="Search messages"
        >
          <Search className="h-4 w-4 md:h-5 md:w-5" />
          <span className="sr-only">Search messages</span>
        </Button>

        {/* Call buttons (only for direct chats) */}
        {!isGroupChat && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleVoiceCall}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
              title="Voice call"
            >
              <Phone className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Voice call</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleVideoCall}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
              title="Video call"
            >
              <Video className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Video call</span>
            </Button>
          </>
        )}

        {/* More options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
              disabled={isLoading}
            >
              <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card">
            {/* Chat info */}
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{chat.name || "Chat"}</p>
              <p className="text-xs text-muted-foreground">
                {isGroupChat ? `${chat.participants.length} members` : "Direct message"}
              </p>
            </div>
            <DropdownMenuSeparator />

            {/* Quick actions */}
            <DropdownMenuItem onClick={onShowProfile}>
              <Shield className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>

            {isGroupChat && onShowGroupManagement && (
              <DropdownMenuItem onClick={onShowGroupManagement}>
                <Users className="mr-2 h-4 w-4" />
                Manage Group
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={onShowSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search Messages
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Chat settings */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 h-4 w-4" />
                Chat Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem onClick={handleMuteToggle}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {isMuted ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                      {isMuted ? "Unmute" : "Mute"}
                    </div>
                    <Switch checked={isMuted} onChange={handleMuteToggle} />
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleArchiveToggle}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Archive className="mr-2 h-4 w-4" />
                      {isArchived ? "Unarchive" : "Archive"}
                    </div>
                    <Switch checked={isArchived} onChange={handleArchiveToggle} />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setIsPinned(!isPinned)}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Pin className="mr-2 h-4 w-4" />
                      Pin Chat
                    </div>
                    <Switch checked={isPinned} onChange={() => setIsPinned(!isPinned)} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Dangerous actions */}
            <DropdownMenuItem 
              onClick={handleDeleteChat}
              disabled={isLoading}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isLoading ? "Deleting..." : "Delete Chat"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 