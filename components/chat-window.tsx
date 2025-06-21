"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, ImageIcon, File, MapPin, X, LogOut, Search, Edit, Trash2, Reply, Play, Pause, Square, Download } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Chat, Message, ChatService } from "@/lib/chat-service"
import { cn, getDownloadUrl, getCloudinaryVideoThumbnail } from "@/lib/utils"
import { EmojiPicker } from "@/components/emoji-picker"
import { MessageReactions } from "@/components/message-reactions"
import { MessageSearch } from "@/components/message-search"
import { FileUpload } from "@/components/file-upload"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"
import { toast } from "sonner"
import { FileService } from "@/lib/file-service"
import { ShortLinkDisplay } from "@/components/short-link-display"
import { Video as VideoIcon } from "lucide-react"
import { ProfilePhotoViewer } from "@/components/profile-photo-viewer"
import { useProfilePhotoViewer } from "@/hooks/use-profile-photo-viewer"

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', fileUrl?: string, shortUrl?: string, messageData?: Partial<Message>) => void
  onShowProfile: () => void
  onBackToChatList?: () => void
  onDeleteChat?: (chatId: string) => void
  currentUser: any
  chatDisplayName?: string
  otherUserPhotoURL?: string | null
}

export function ChatWindow({ chat, messages, onSendMessage, onShowProfile, onBackToChatList, onDeleteChat, currentUser, chatDisplayName, otherUserPhotoURL }: ChatWindowProps) {
  console.log('ChatWindow rendered with chat:', chat?.id, 'messages:', messages?.length, 'currentUser:', !!currentUser)
  
  const router = useRouter()
  const { logout } = useAuthContext()
  const { isOpen, photoURL, userName, userId, openViewer, closeViewer } = useProfilePhotoViewer()
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLeavingGroup, setIsLeavingGroup] = useState(false)
  
  // Video upload states
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  // Get chat display name from chat object
  const chatDisplayNameMemo = useMemo(() => {
    // Use the passed chatDisplayName prop if available
    if (chatDisplayName) {
      return chatDisplayName
    }
    
    if (chat.type === 'group') {
      return chat.name || 'Group Chat'
    } else {
      // For direct chats, we'll use a placeholder since the name is fetched in dashboard
      return 'Chat'
    }
  }, [chat, chatDisplayName])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle visibility change to mark messages as read
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && messages.length > 0) {
        // Mark all unread messages as read
        for (const message of messages) {
          if (message.userId !== currentUser?.uid && !message.readBy?.includes(currentUser?.uid)) {
            await ChatService.markMessageAsRead(chat.id, message.id, currentUser?.uid);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Initial check when component mounts
    handleVisibilityChange();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chat.id, messages, currentUser?.uid]);

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    const result = await ChatService.editMessage(chat.id, messageId, newContent, currentUser.uid)
    if (result.success) {
      setEditingMessage(null)
      toast.success("Message updated")
    } else {
      toast.error(result.error || "Failed to edit message")
    }
  }, [chat.id, currentUser?.uid])

  const handleSendMessage = useCallback(() => {
    if (editingMessage) {
      handleEditMessage(editingMessage.id, newMessage)
      return
    }

    if (!newMessage.trim() && !selectedFile) return
    if (isUploading) return // Prevent multiple uploads

    const messageData: Partial<Message> = {
      userDisplayName: currentUser.displayName || "Anonymous",
      userPhotoURL: currentUser.photoURL || "",
      replyTo: replyToMessage ? {
        messageId: replyToMessage.id,
        content: replyToMessage.content,
        userDisplayName: replyToMessage.userDisplayName
      } : undefined,
    };

    if (selectedFile) {
      // Use FileService for proper file upload
      const uploadFile = async () => {
        setIsUploading(true);
        try {
          let result;
          let type: 'image' | 'file';

          if (FileService.isImage(selectedFile)) {
            result = await FileService.uploadImage(selectedFile, chat.id);
            type = 'image';
          } else if (FileService.isDocument(selectedFile)) {
            result = await FileService.uploadDocument(selectedFile, chat.id);
            type = 'file';
          } else {
            result = await FileService.uploadFile(selectedFile, chat.id);
            type = 'file';
          }

          if (result.success && result.url) {
            onSendMessage(
              newMessage.trim() || selectedFile.name, 
              type, 
              result.url, 
              result.shortUrl,
              messageData
            );
            setSelectedFile(null);
          } else {
            toast.error(result.error || "Failed to upload file");
          }
        } catch (error) {
          toast.error("Failed to upload file");
        } finally {
          setIsUploading(false);
        }
      };
      uploadFile();
    } else {
      onSendMessage(newMessage.trim(), 'text', undefined, undefined, messageData)
    }
    setNewMessage("")
    setShowEmojiPicker(false)
    setReplyToMessage(null)
  }, [newMessage, selectedFile, onSendMessage, chat.id, isUploading, editingMessage, handleEditMessage, currentUser, replyToMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const addEmoji = useCallback((emoji: string) => {
    setNewMessage((prev) => prev + emoji)
  }, [])

  const formatTime = useCallback((timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }, [])

  const isMyMessage = useCallback((message: Message) => {
    return message.userId === currentUser?.uid
  }, [currentUser?.uid])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const result = await logout()
      if (result.success) {
        toast.success("Logged out successfully")
        router.push("/")
      } else {
        toast.error(result.error || "Failed to logout")
      }
    } catch (error) {
      toast.error("Failed to logout")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group? You won't be able to rejoin unless invited.")) {
      return
    }

    setIsLeavingGroup(true)
    try {
      const result = await ChatService.leaveGroup(chat.id, currentUser.uid)
      if (result.success) {
        toast.success("You have left the group")
        onBackToChatList?.()
      } else {
        toast.error(result.error || "Failed to leave group")
      }
    } catch (error) {
      toast.error("Failed to leave group")
    } finally {
      setIsLeavingGroup(false)
    }
  }

  const handleAddReaction = useCallback(async (messageId: string, emoji: string) => {
    const result = await ChatService.addReaction(chat.id, messageId, currentUser.uid, emoji)
    if (!result.success) {
      toast.error(result.error || "Failed to add reaction")
    }
  }, [chat.id, currentUser?.uid])

  const handleRemoveReaction = useCallback(async (messageId: string, emoji: string) => {
    const result = await ChatService.removeReaction(chat.id, messageId, currentUser.uid, emoji)
    if (!result.success) {
      toast.error(result.error || "Failed to remove reaction")
    }
  }, [chat.id, currentUser?.uid])

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    const result = await ChatService.deleteMessage(chat.id, messageId, currentUser.uid)
    if (result.success) {
      toast.success("Message deleted")
    } else {
      toast.error(result.error || "Failed to delete message")
    }
  }, [chat.id, currentUser?.uid])

  const handleFileUpload = useCallback((file: File) => {
    setSelectedFile(file)
    setShowAttachMenu(false)
  }, [])

  const handleFileUploadComplete = useCallback((url: string, type: 'image' | 'file', shortUrl?: string) => {
    onSendMessage(selectedFile?.name || '', type, url, shortUrl)
    setSelectedFile(null)
  }, [selectedFile, onSendMessage])

  const handleFileUploadError = useCallback((error: string) => {
    toast.error(error)
  }, [])

  // Video upload handler
  const handleVideoUpload = useCallback((file: File) => {
    setSelectedVideo(file)
    setShowAttachMenu(false)
  }, [])

  const handleSendVideo = useCallback(async () => {
    if (!selectedVideo) return
    setIsUploadingVideo(true)
    try {
      const result = await FileService.uploadVideo(selectedVideo, chat.id)
      if (result.success && result.url) {
        onSendMessage(selectedVideo.name, 'video', result.url, result.shortUrl)
        setSelectedVideo(null)
      } else {
        toast.error(result.error || 'Failed to upload video')
      }
    } catch (error) {
      toast.error('Failed to upload video')
    } finally {
      setIsUploadingVideo(false)
    }
  }, [selectedVideo, chat.id, onSendMessage])

  const shareLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            // Get address from coordinates (you might want to use a geocoding service)
            const locationData = {
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }
            
            const locationString = JSON.stringify(locationData)
            onSendMessage(locationString, 'location')
            setShowAttachMenu(false)
          } catch (error) {
            toast.error("Failed to share location")
          }
        },
        (error) => {
          toast.error("Failed to get location. Please check location permissions.")
        }
      )
    } else {
      toast.error("Geolocation is not supported by this browser.")
    }
  }, [onSendMessage])

  const handleMessageSelect = useCallback((message: Message) => {
    // Close the search overlay
    setShowSearch(false)
    
    // Find the message element and scroll to it
    const messageElement = document.getElementById(`message-${message.id}`)
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      
      // Add a temporary highlight effect
      messageElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50')
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50')
      }, 2000)
    }
  }, [])

  const MessageStatusIcon = ({ message, isMyMsg }: { message: Message; isMyMsg: boolean }) => {
    if (!isMyMsg) return null;

    switch (message.status) {
      case 'sent':
        return <span className="text-xs md:text-sm font-medium opacity-90 text-muted-foreground">✓</span>;
      case 'delivered':
        return <span className="text-xs md:text-sm font-medium opacity-90 text-muted-foreground">✓✓</span>;
      case 'read':
        return <span className="text-xs md:text-sm font-medium opacity-90 dark:text-blue-400 text-blue-600">✓✓</span>;
      default:
        return <span className="text-xs md:text-sm font-medium opacity-90 text-muted-foreground">✓</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col glass-card rounded-none md:rounded-l-2xl overflow-hidden animate-slide-from-right h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 lg:p-5 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer min-w-0 flex-1"
          role="button"
          tabIndex={0}
          onClick={onShowProfile}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onShowProfile(); }}
        >
          {/* Back button - show on mobile or when onBackToChatList is provided */}
          {onBackToChatList && (
            <Button
              variant="ghost"
              size="icon"
              onClick={e => { e.stopPropagation(); onBackToChatList?.(); }}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-primary/10 -ml-1 flex-shrink-0"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="sr-only">Back to chats</span>
            </Button>
          )}
          <div className="relative flex-shrink-0">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10">
              {chat.type === 'group' ? (
                <div className="bg-muted h-full w-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium">{chatDisplayNameMemo.charAt(0)}</span>
                </div>
              ) : (
                <>
                  <AvatarImage 
                    src={otherUserPhotoURL || "/placeholder.svg"} 
                    alt={chatDisplayNameMemo} 
                    className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (otherUserPhotoURL && chat.type === 'direct') {
                        const otherUserId = chat.participants.find(p => p !== currentUser?.uid)
                        openViewer(otherUserPhotoURL, chatDisplayNameMemo, otherUserId)
                      }
                    }}
                  />
                  <AvatarFallback className="text-xs sm:text-sm">{chatDisplayNameMemo.charAt(0)}</AvatarFallback>
                </>
              )}
            </Avatar>
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="font-medium text-xs sm:text-sm md:text-base lg:text-lg truncate">{chatDisplayNameMemo}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {chat.type === 'group' ? `${chat.participants.length} members` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSearch(!showSearch)}
            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-primary/10"
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="sr-only">Search messages</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-primary/10">
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="sr-only">Voice call</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-primary/10">
            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="sr-only">Video call</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-primary/10">
                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={onShowProfile}>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSearch(true)}>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              
              {/* Group-specific actions */}
              {chat.type === 'group' && (
                <>
                  <DropdownMenuItem 
                    onClick={handleLeaveGroup}
                    disabled={isLeavingGroup}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {isLeavingGroup ? "Leaving..." : "Exit Group"}
                  </DropdownMenuItem>
                  
                  {/* Show delete group option only for group creator */}
                  {chat.admins?.[0] === currentUser.uid && onDeleteChat && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteChat(chat.id)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Delete Group
                    </DropdownMenuItem>
                  )}
                </>
              )}
              
              {/* Direct chat actions */}
              {chat.type === 'direct' && onDeleteChat && (
                <DropdownMenuItem 
                  onClick={() => onDeleteChat(chat.id)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Delete Chat
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="absolute inset-0 z-10 bg-background">
          <MessageSearch
            chatId={chat.id}
            onMessageSelect={handleMessageSelect}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {messages.map((message, index) => {
            const isFirstInGroup = index === 0 || messages[index - 1].userId !== message.userId
            const isLastInGroup =
              index === messages.length - 1 || messages[index + 1].userId !== message.userId
            const isMyMsg = isMyMessage(message)

            return (
              <div 
                key={message.id} 
                id={`message-${message.id}`}
                className={cn("flex", isMyMsg ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%]", 
                  isLastInGroup && "mb-2"
                )}>
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className="mb-1 p-2 sm:p-3 bg-muted/30 rounded-lg border-l-2 border-primary">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Replying to {message.replyTo.userDisplayName}
                      </p>
                      <p className="text-xs sm:text-sm truncate">{message.replyTo.content}</p>
                    </div>
                  )}

                  <div
                    className={cn(
                      "group relative px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-2xl text-xs sm:text-sm md:text-base",
                      isMyMsg 
                        ? "bg-primary text-primary-foreground ml-2 sm:ml-4" 
                        : "bg-muted text-foreground mr-2 sm:mr-4",
                      !isFirstInGroup && isMyMsg && "rounded-tr-xl",
                      !isFirstInGroup && !isMyMsg && "rounded-tl-xl",
                    )}
                  >
                    {/* Message content */}
                    {editingMessage?.id === message.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingMessage.content}
                          onChange={(e) => setEditingMessage({...editingMessage, content: e.target.value})}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditMessage(message.id, editingMessage.content)
                            } else if (e.key === 'Escape') {
                              setEditingMessage(null)
                            }
                          }}
                          autoFocus
                          className="text-xs sm:text-sm md:text-base"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditMessage(message.id, editingMessage.content)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingMessage(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.type === 'image' ? (
                          <div className="space-y-2">
                            <div className="relative group">
                              <img 
                                src={message.originalUrl || message.content} 
                                alt="Shared image" 
                                className="max-w-full h-auto rounded-lg cursor-pointer transition-transform hover:scale-105 object-cover"
                                style={{
                                  maxHeight: '200px',
                                  width: 'auto',
                                  minWidth: '100px'
                                }}
                                onClick={() => window.open(message.originalUrl || message.content, '_blank')}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                <a
                                  href={getDownloadUrl(message.originalUrl || message.content)}
                                  download
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Button size="icon" variant="ghost" className="h-10 w-10 bg-black/50 hover:bg-black/70 text-white">
                                    <Download className="h-5 w-5" />
                                  </Button>
                                </a>
                              </div>
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : message.type === 'voice' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-background/20 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex-shrink-0"
                                onClick={() => {
                                  const audio = new Audio(message.originalUrl || message.content)
                                  audio.play()
                                }}
                              >
                                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <div className="flex-1 min-w-0">
                                <div className="w-full bg-muted/30 rounded-full h-1.5 sm:h-2">
                                  <div className="bg-primary h-1.5 sm:h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Voice message</p>
                              </div>
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : message.type === 'video' ? (
                          <div className="space-y-2">
                            <div className="relative group rounded-lg overflow-hidden bg-black">
                              {playingVideoId === message.id ? (
                                <video
                                  src={message.originalUrl || message.content}
                                  controls
                                  autoPlay
                                  onEnded={() => setPlayingVideoId(null)}
                                  className="max-w-full rounded-lg"
                                  preload="auto"
                                  style={{
                                    maxHeight: '300px',
                                    width: 'auto',
                                    minWidth: '150px'
                                  }}
                                />
                              ) : (
                                <>
                                  <img
                                    src={getCloudinaryVideoThumbnail(message.originalUrl || message.content)}
                                    alt="Video thumbnail"
                                    className="max-w-full h-auto rounded-lg object-cover cursor-pointer transition-transform group-hover:scale-105"
                                    style={{
                                      maxHeight: '300px',
                                      width: 'auto',
                                      minWidth: '150px'
                                    }}
                                    onClick={() => setPlayingVideoId(message.id)}
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setPlayingVideoId(message.id)}
                                      className="h-12 w-12 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                    >
                                      <Play className="h-6 w-6 ml-1" />
                                    </Button>
                                    <a
                                      href={getDownloadUrl(message.originalUrl || message.content)}
                                      download
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </a>
                                  </div>
                                </>
                              )}
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : message.type === 'location' ? (
                          <div className="p-2 sm:p-3 bg-background/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                              <span className="font-medium text-xs sm:text-sm md:text-base">Location</span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-all">{message.content}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                try {
                                  const locationData = JSON.parse(message.content)
                                  const url = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`
                                  window.open(url, '_blank')
                                } catch (e) {
                                  toast.error("Invalid location data")
                                }
                              }}
                              className="text-xs sm:text-sm"
                            >
                              Open in Maps
                            </Button>
                          </div>
                        ) : message.type === 'file' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 sm:p-3 bg-background/20 rounded-lg">
                              <File className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium block break-all">
                                  {message.fileMetadata?.fileName || message.content}
                                </span>
                              </div>
                              <a
                                href={getDownloadUrl(message.originalUrl || message.content, message.fileMetadata?.fileName)}
                                download={message.fileMetadata?.fileName || 'download'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                              >
                                <Button size="sm" variant="ghost" className="text-xs sm:text-sm">
                                  Download
                                </Button>
                              </a>
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : (
                          <div className="break-words">
                            {message.content}
                          </div>
                        )}
                        
                        {/* Message metadata */}
                        <div className="mt-1 flex items-center justify-between gap-2 opacity-90">
                          <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm">{formatTime(message.timestamp)}</span>
                            {message.edited && (
                              <span className="text-xs sm:text-sm text-muted-foreground">(edited)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageStatusIcon message={message} isMyMsg={isMyMsg} />
                          </div>
                        </div>

                        {/* Message actions */}
                        <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-border/40">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyToMessage(message)}
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                          >
                            <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                          {isMyMsg && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMessage(message)}
                                className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                              >
                                <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMessage(message.id)}
                                className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive"
                              >
                                <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Message reactions */}
                        <MessageReactions
                          reactions={message.reactions}
                          currentUserId={currentUser.uid}
                          onAddReaction={(emoji) => handleAddReaction(message.id, emoji)}
                          onRemoveReaction={(emoji) => handleRemoveReaction(message.id, emoji)}
                          className="mt-2"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply indicator */}
      {replyToMessage && (
        <div className="p-2 sm:p-3 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                Replying to {replyToMessage.userDisplayName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0"
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </div>
          <p className="text-xs sm:text-sm truncate mt-1">{replyToMessage.content}</p>
        </div>
      )}

      {/* File upload */}
      {selectedFile && (
        <div className="p-2 sm:p-3 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <File className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({FileService.formatFileSize(selectedFile.size)})
              </span>
              {isUploading && (
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <FileUpload
            chatId={chat.id}
            onFileSelect={handleFileUpload}
            onUploadComplete={handleFileUploadComplete}
            onUploadError={handleFileUploadError}
          />
        </div>
      )}

      {/* Attachment menu */}
      {showAttachMenu && (
        <div className="p-2 sm:p-3 border-t border-border/40 bg-background/50 backdrop-blur-sm animate-slide-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-xs sm:text-sm md:text-base">Attach</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachMenu(false)}
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8"
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            <button 
              className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleFileUpload(file)
                }
                input.click()
              }}
            >
              <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="text-xs">Photo</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,.doc,.docx,.txt,.zip,audio/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleFileUpload(file)
                }
                input.click()
              }}
            >
              <File className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="text-xs">Document</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'video/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleVideoUpload(file)
                }
                input.click()
              }}
            >
              <VideoIcon className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="text-xs">Video</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                setShowAttachMenu(false)
                shareLocation()
              }}
            >
              <MapPin className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="text-xs">Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Video upload preview and send button */}
      {selectedVideo && (
        <div className="p-2 sm:p-3 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <VideoIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{selectedVideo.name}</span>
              <span className="text-xs text-muted-foreground">
                ({FileService.formatFileSize(selectedVideo.size)})
              </span>
              {isUploadingVideo && (
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedVideo(null)}
              disabled={isUploadingVideo}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendVideo}
            disabled={isUploadingVideo}
            className="mt-2 text-xs sm:text-sm"
          >
            {isUploadingVideo ? 'Uploading...' : 'Send Video'}
          </Button>
        </div>
      )}

      {/* Message input */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 rounded-full hover:bg-primary/10 flex-shrink-0"
          >
            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <div className="flex-1 relative min-w-0">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-8 sm:pr-10 h-8 sm:h-9 md:h-10 lg:h-11 text-xs sm:text-sm md:text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full hover:bg-primary/10"
            >
              <Smile className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 rounded-full flex-shrink-0"
          >
            {isUploading ? (
              <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        {showEmojiPicker && (
          <div className="mt-2 relative">
            <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
              <EmojiPicker 
                onEmojiSelect={addEmoji} 
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Profile Photo Viewer */}
      <ProfilePhotoViewer
        isOpen={isOpen}
        onClose={closeViewer}
        photoURL={photoURL}
        userName={userName}
        userId={userId}
        onMessage={() => {
          closeViewer()
          // Already in chat, so just focus on the message input
          // Could add focus to message input here
        }}
        onAudioCall={() => {
          closeViewer()
          toast.info("Audio call feature coming soon!")
        }}
        onVideoCall={() => {
          closeViewer()
          toast.info("Video call feature coming soon!")
        }}
        onInfo={() => {
          closeViewer()
          onShowProfile()
        }}
      />
    </div>
  )
}
