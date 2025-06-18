"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, ImageIcon, File, MapPin, X, LogOut, Search, Edit, Trash2, Reply, Play, Pause, Square } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Chat, Message, ChatService } from "@/lib/chat-service"
import { cn } from "@/lib/utils"
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

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', fileUrl?: string, shortUrl?: string) => void
  onShowProfile: () => void
  onBackToChatList?: () => void
  onDeleteChat?: (chatId: string) => void
  currentUser: any
  chatDisplayName?: string
}

export function ChatWindow({ chat, messages, onSendMessage, onShowProfile, onBackToChatList, onDeleteChat, currentUser, chatDisplayName }: ChatWindowProps) {
  console.log('ChatWindow rendered with chat:', chat?.id, 'messages:', messages?.length, 'currentUser:', !!currentUser)
  
  const router = useRouter()
  const { logout } = useAuthContext()
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
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() && !selectedFile) return
    if (isUploading) return // Prevent multiple uploads

    if (selectedFile) {
      // Use FileService for proper file upload
      const uploadFile = async () => {
        setIsUploading(true);
        try {
          let result;
          const type = selectedFile.type.startsWith('image/') ? 'image' : 'file';
          
          if (type === 'image') {
            result = await FileService.uploadImage(selectedFile, chat.id);
          } else {
            result = await FileService.uploadFile(selectedFile, chat.id);
          }
          
          if (result.success && result.url) {
            onSendMessage(newMessage.trim() || selectedFile.name, type, result.url, result.shortUrl);
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
      onSendMessage(newMessage.trim())
    }
    
    setNewMessage("")
    setShowEmojiPicker(false)
    setReplyToMessage(null)
  }, [newMessage, selectedFile, onSendMessage, chat.id, isUploading])

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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  const isMyMessage = useCallback((message: Message) => {
    return message.userId === currentUser?.uid
  }, [currentUser?.uid])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const result = await logout()
    
    if (result.success) {
      toast.success("Logged out successfully")
      router.push("/")
    } else {
      toast.error(result.error || "Failed to logout")
    }
    
    setIsLoggingOut(false)
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

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    const result = await ChatService.editMessage(chat.id, messageId, newContent, currentUser.uid)
    if (result.success) {
      setEditingMessage(null)
      toast.success("Message updated")
    } else {
      toast.error(result.error || "Failed to edit message")
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

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      toast.error("Failed to start recording. Please check microphone permissions.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const sendVoiceNote = useCallback(async () => {
    if (!audioBlob) return

    try {
      const file = new File([audioBlob], `voice-note-${Date.now()}.wav`, { type: 'audio/wav' })
      const result = await FileService.uploadVoiceNote(file, chat.id)
      
      if (result.success && result.url) {
        onSendMessage('Voice note', 'voice', result.url, result.shortUrl)
        setAudioBlob(null)
        setRecordingTime(0)
      } else {
        toast.error("Failed to upload voice note")
      }
    } catch (error) {
      toast.error("Failed to send voice note")
    }
  }, [audioBlob, chat.id, onSendMessage])

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

  const formatRecordingTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleMessageSelect = useCallback((message: Message) => {
    setReplyToMessage(message)
  }, [])

  return (
    <div className="flex-1 flex flex-col glass-card rounded-none md:rounded-l-2xl overflow-hidden animate-slide-from-right">
      {/* Chat header */}
      <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 flex-1"
          role="button"
          tabIndex={0}
          onClick={onShowProfile}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onShowProfile(); }}
        >
          {onBackToChatList && (
            <Button
              variant="ghost"
              size="icon"
              onClick={e => { e.stopPropagation(); onBackToChatList(); }}
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full hover:bg-primary/10 -ml-1 flex-shrink-0"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="sr-only">Back to chats</span>
            </Button>
          )}
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
              {chat.type === 'group' ? (
                <div className="bg-muted h-full w-full flex items-center justify-center">
                  <span className="text-sm font-medium">{chatDisplayNameMemo.charAt(0)}</span>
                </div>
              ) : (
                <>
                  <AvatarImage src="/placeholder.svg" alt={chatDisplayNameMemo} />
                  <AvatarFallback>{chatDisplayNameMemo.charAt(0)}</AvatarFallback>
                </>
              )}
            </Avatar>
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base truncate">{chatDisplayNameMemo}</p>
            <p className="text-xs text-muted-foreground truncate">
              {chat.type === 'group' ? `${chat.participants.length} members` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSearch(!showSearch)}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Search messages</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full hover:bg-primary/10">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Voice call</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full hover:bg-primary/10">
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Video call</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full hover:bg-primary/10">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={onShowProfile}>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSearch(true)}>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              {onDeleteChat && (
                <DropdownMenuItem 
                  onClick={() => onDeleteChat(chat.id)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete chat
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
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
      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-3 md:space-y-4">
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
                <div className={cn("max-w-[85%] md:max-w-[75%]", isLastInGroup && "mb-2")}>
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className="mb-1 p-2 bg-muted/30 rounded-lg border-l-2 border-primary">
                      <p className="text-xs text-muted-foreground">
                        Replying to {message.replyTo.userDisplayName}
                      </p>
                      <p className="text-xs truncate">{message.replyTo.content}</p>
                    </div>
                  )}

                  <div
                    className={cn(
                      "group relative px-3 py-2 md:px-4 md:py-3 rounded-2xl text-sm md:text-base",
                      isMyMsg 
                        ? "bg-primary text-primary-foreground ml-4" 
                        : "bg-muted text-foreground mr-4",
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
                                  maxHeight: '300px',
                                  width: 'auto',
                                  minWidth: '200px'
                                }}
                                onClick={() => window.open(message.originalUrl || message.content, '_blank')}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs">
                                  Click to view full size
                                </div>
                              </div>
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : message.type === 'voice' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-background/20 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-full"
                                onClick={() => {
                                  const audio = new Audio(message.originalUrl || message.content)
                                  audio.play()
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <div className="flex-1">
                                <div className="w-full bg-muted/30 rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Voice message</p>
                              </div>
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : message.type === 'video' ? (
                          <div className="space-y-2">
                            <video 
                              src={message.originalUrl || message.content} 
                              controls
                              className="max-w-full rounded-lg"
                              preload="metadata"
                            />
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : message.type === 'location' ? (
                          <div className="p-3 bg-background/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">Location</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
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
                            >
                              Open in Maps
                            </Button>
                          </div>
                        ) : message.type === 'file' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-background/20 rounded-lg">
                              <File className="h-4 w-4" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium block truncate">
                                  {message.fileMetadata?.fileName || message.content}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => window.open(message.originalUrl || message.content, '_blank')}
                              >
                                Download
                              </Button>
                            </div>
                            {message.shortUrl && (
                              <ShortLinkDisplay shortUrl={message.shortUrl} />
                            )}
                          </div>
                        ) : (
                          message.content
                        )}
                        
                        {/* Message metadata */}
                        <div className="mt-1 flex items-center justify-between gap-2 opacity-70">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] md:text-xs">{formatTime(message.timestamp)}</span>
                            {message.edited && (
                              <span className="text-[10px] md:text-xs text-muted-foreground">(edited)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isMyMsg && (
                              <span className="text-[10px] md:text-xs">
                                {message.readBy.length > 1 ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message actions */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-border/40">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyToMessage(message)}
                            className="h-6 w-6 p-0"
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                          {isMyMsg && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMessage(message)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMessage(message.id)}
                                className="h-6 w-6 p-0 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
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
        <div className="p-2 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Replying to {replyToMessage.userDisplayName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm truncate mt-1">{replyToMessage.content}</p>
        </div>
      )}

      {/* File upload */}
      {selectedFile && (
        <div className="p-2 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({FileService.formatFileSize(selectedFile.size)})
              </span>
              {isUploading && (
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
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
        <div className="p-2 border-t border-border/40 bg-background/50 backdrop-blur-sm animate-slide-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm md:text-base">Attach</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachMenu(false)}
              className="h-6 w-6 md:h-8 md:w-8"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button 
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
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
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">Photo</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,.doc,.docx,.txt,.zip,audio/*,video/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleFileUpload(file)
                }
                input.click()
              }}
            >
              <File className="h-6 w-6" />
              <span className="text-xs">Document</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                setShowAttachMenu(false)
                shareLocation()
              }}
            >
              <MapPin className="h-6 w-6" />
              <span className="text-xs">Location</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => {
                setShowAttachMenu(false)
                if (isRecording) {
                  stopRecording()
                } else {
                  startRecording()
                }
              }}
            >
              {isRecording ? <Square className="h-6 w-6 text-red-500" /> : <Mic className="h-6 w-6" />}
              <span className="text-xs">{isRecording ? 'Stop' : 'Voice'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice recording indicator */}
      {isRecording && (
        <div className="p-2 border-t border-border/40 bg-red-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600">Recording... {formatRecordingTime(recordingTime)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={stopRecording}
                className="h-8 px-3"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voice note preview */}
      {audioBlob && !isRecording && (
        <div className="p-2 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <span className="text-sm">Voice note ready ({formatRecordingTime(recordingTime)})</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioBlob(null)}
                className="h-8 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={sendVoiceNote}
                className="h-8 px-3"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full hover:bg-primary/10 flex-shrink-0"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <div className="flex-1 relative min-w-0">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10 h-9 sm:h-10 md:h-11 text-sm sm:text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10"
            >
              <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
            className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full flex-shrink-0"
          >
            {isUploading ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        {showEmojiPicker && (
          <div className="mt-2">
            <EmojiPicker onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
    </div>
  )
}
