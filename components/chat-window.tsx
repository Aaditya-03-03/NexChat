"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, ImageIcon, File, MapPin, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Chat, Message } from "@/lib/chat-service"
import { cn } from "@/lib/utils"
import { EmojiPicker } from "@/components/emoji-picker"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  onSendMessage: (content: string) => void
  onShowProfile: () => void
  currentUser: any
}

export function ChatWindow({ chat, messages, onSendMessage, onShowProfile, currentUser }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatDisplayName, setChatDisplayName] = useState("")

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
    if (!newMessage.trim()) return

    onSendMessage(newMessage.trim())
    setNewMessage("")
    setShowEmojiPicker(false)
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

  return (
    <div className="flex-1 flex flex-col glass-card rounded-none md:rounded-l-2xl overflow-hidden animate-slide-from-right">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <button className="flex items-center gap-3" onClick={onShowProfile}>
          <div className="relative">
            <Avatar className="h-10 w-10">
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
            <p className="font-medium">{chatDisplayName}</p>
            <p className="text-xs text-muted-foreground">
              {chat.type === 'group' ? `${chat.participants.length} members` : 'Online'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <Phone className="h-5 w-5" />
            <span className="sr-only">Voice call</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <Video className="h-5 w-5" />
            <span className="sr-only">Video call</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={onShowProfile}>View profile</DropdownMenuItem>
              <DropdownMenuItem>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isFirstInGroup = index === 0 || messages[index - 1].userId !== message.userId
            const isLastInGroup =
              index === messages.length - 1 || messages[index + 1].userId !== message.userId
            const isMyMsg = isMyMessage(message)

            return (
              <div key={message.id} className={cn("flex", isMyMsg ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%]", isLastInGroup && "mb-2")}>
                  <div
                    className={cn(
                      "group relative",
                      isMyMsg ? "chat-bubble-sent" : "chat-bubble-received",
                      !isFirstInGroup && isMyMsg && "rounded-tr-xl",
                      !isFirstInGroup && !isMyMsg && "rounded-tl-xl",
                    )}
                  >
                    {message.content}
                    <div className="mt-1 flex items-center justify-end gap-1 opacity-70">
                      <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                      {isMyMsg && (
                        <span className="text-[10px]">
                          {message.readBy.length > 1 ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>

                    {/* Reaction button that appears on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-border/40">
                      <button className="p-1 hover:bg-muted rounded-full">👍</button>
                      <button className="p-1 hover:bg-muted rounded-full">❤️</button>
                      <button className="p-1 hover:bg-muted rounded-full">😂</button>
                      <button className="p-1 hover:bg-muted rounded-full">😮</button>
                      <button className="p-1 hover:bg-muted rounded-full">😢</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Attachment menu */}
      {showAttachMenu && (
        <div className="p-2 border-t border-border/40 bg-background/50 backdrop-blur-sm animate-slide-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Attach</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => setShowAttachMenu(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary/10">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs">Photo</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary/10">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <File className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs">Document</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary/10">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs">Location</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary/10">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Mic className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs">Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="glass-input pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-primary/10"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
                <span className="sr-only">Add emoji</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-primary/10"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-2"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="mt-2">
            <EmojiPicker onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
    </div>
  )
}
