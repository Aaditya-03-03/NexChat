"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, ImageIcon, File, MapPin, X, LogOut, Search, Edit, Trash2, Reply } from "lucide-react"
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

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', fileUrl?: string) => void
  onShowProfile: () => void
  onBackToChatList?: () => void
  currentUser: any
}

export function ChatWindow({ chat, messages, onSendMessage, onShowProfile, onBackToChatList, currentUser }: ChatWindowProps) {
  const router = useRouter()
  const { logout } = useAuthContext()
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatDisplayName, setChatDisplayName] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch chat display name
  useEffect(() => {
    const fetchChatDisplayName = async () => {
      if (chat.type === 'group') {
        setChatDisplayName(chat.name || 'Group Chat')
      } else {
        // For direct chats, fetch the other user's name
        const otherUserId = chat.participants.find(p => p !== currentUser?.uid)
        if (otherUserId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId))
            if (userDoc.exists()) {
              setChatDisplayName(userDoc.data().displayName || 'Unknown User')
            } else {
              setChatDisplayName('Unknown User')
            }
          } catch (error) {
            setChatDisplayName('Unknown User')
          }
        }
      }
    }

    fetchChatDisplayName()
  }, [chat, currentUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return

    if (selectedFile) {
      // Handle file upload
      const reader = new FileReader()
      reader.onload = () => {
        const fileUrl = reader.result as string
        const type = selectedFile.type.startsWith('image/') ? 'image' : 'file'
        onSendMessage(newMessage.trim() || selectedFile.name, type, fileUrl)
        setSelectedFile(null)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      onSendMessage(newMessage.trim())
    }
    
    setNewMessage("")
    setShowEmojiPicker(false)
    setReplyToMessage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isMyMessage = (message: Message) => {
    return message.userId === currentUser?.uid
  }

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

  const handleAddReaction = async (messageId: string, emoji: string) => {
    const result = await ChatService.addReaction(chat.id, messageId, currentUser.uid, emoji)
    if (!result.success) {
      toast.error(result.error || "Failed to add reaction")
    }
  }

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    const result = await ChatService.removeReaction(chat.id, messageId, currentUser.uid, emoji)
    if (!result.success) {
      toast.error(result.error || "Failed to remove reaction")
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const result = await ChatService.editMessage(chat.id, messageId, newContent, currentUser.uid)
    if (result.success) {
      setEditingMessage(null)
      toast.success("Message updated")
    } else {
      toast.error(result.error || "Failed to edit message")
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    const result = await ChatService.deleteMessage(chat.id, messageId, currentUser.uid)
    if (result.success) {
      toast.success("Message deleted")
    } else {
      toast.error(result.error || "Failed to delete message")
    }
  }

  const handleFileUpload = (file: File) => {
    setSelectedFile(file)
    setShowAttachMenu(false)
  }

  const handleFileUploadComplete = (url: string, type: 'image' | 'file') => {
    onSendMessage(selectedFile?.name || '', type, url)
    setSelectedFile(null)
  }

  const handleFileUploadError = (error: string) => {
    toast.error(error)
  }

  const handleMessageSelect = (message: Message) => {
    // Scroll to message
    const messageElement = document.getElementById(`message-${message.id}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      messageElement.classList.add('bg-yellow-100', 'dark:bg-yellow-900')
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100', 'dark:bg-yellow-900')
      }, 2000)
    }
    setShowSearch(false)
  }

  return (
    <div className="flex-1 flex flex-col glass-card rounded-none md:rounded-l-2xl overflow-hidden animate-slide-from-right">
      {/* Chat header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border/40">
        <div
          className="flex items-center gap-3 cursor-pointer"
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
              className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10 -ml-1"
            >
              <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="sr-only">Back to chats</span>
            </Button>
          )}
          <div className="relative">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              {chat.type === 'group' ? (
                <div className="bg-muted h-full w-full flex items-center justify-center">
                  <span className="text-sm font-medium">{chatDisplayName.charAt(0)}</span>
                </div>
              ) : (
                <>
                  <AvatarImage src="/placeholder.svg" alt={chatDisplayName} />
                  <AvatarFallback>{chatDisplayName.charAt(0)}</AvatarFallback>
                </>
              )}
            </Avatar>
          </div>
          <div className="text-left">
            <p className="font-medium text-sm md:text-base">{chatDisplayName}</p>
            <p className="text-xs text-muted-foreground">
              {chat.type === 'group' ? `${chat.participants.length} members` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSearch(!showSearch)}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Search messages</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10">
            <Phone className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Voice call</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10">
            <Video className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Video call</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10">
                <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={onShowProfile}>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSearch(true)}>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete chat</DropdownMenuItem>
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
                          <img 
                            src={message.content} 
                            alt="Shared image" 
                            className="max-w-full rounded-lg cursor-pointer"
                            onClick={() => window.open(message.content, '_blank')}
                          />
                        ) : message.type === 'file' ? (
                          <div className="flex items-center gap-2 p-2 bg-background/20 rounded-lg">
                            <File className="h-4 w-4" />
                            <span className="text-sm">{message.content}</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(message.content, '_blank')}
                            >
                              Download
                            </Button>
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
                input.accept = '.pdf,.doc,.docx,.txt,.zip'
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
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <MapPin className="h-6 w-6" />
              <span className="text-xs">Location</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Mic className="h-6 w-6" />
              <span className="text-xs">Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-3 md:p-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
          >
            <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10 h-9 md:h-10"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-primary/10"
            >
              <Smile className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedFile}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
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
