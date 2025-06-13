"use client"

import { useState, useEffect } from "react"
import { ChatLayout } from "@/components/chat-layout"
import { ChatList } from "@/components/chat-list"
import { ChatWindow } from "@/components/chat-window"
import { UserProfile } from "@/components/user-profile"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { ChatService, Chat, Message } from "@/lib/chat-service"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user, userProfile } = useAuthContext()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  // Subscribe to user's chats
  useEffect(() => {
    if (!user) return

    const unsubscribe = ChatService.subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats)
      setLoading(false)
      
      // Select first chat if none selected
      if (!selectedChat && userChats.length > 0) {
        setSelectedChat(userChats[0])
      }
    })

    return unsubscribe
  }, [user, selectedChat])

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (!selectedChat) return

    const unsubscribe = ChatService.subscribeToMessages(selectedChat.id, (chatMessages) => {
      setMessages(chatMessages)
    })

    return unsubscribe
  }, [selectedChat])

  // Update user status when component mounts/unmounts
  useEffect(() => {
    if (!user) return

    // Set user as online
    ChatService.updateUserStatus(user.uid, 'online')

    // Set user as offline when component unmounts
    return () => {
      ChatService.updateUserStatus(user.uid, 'offline')
    }
  }, [user])

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !user || !userProfile) return

    const messageData = {
      chatId: selectedChat.id,
      userId: user.uid,
      userDisplayName: userProfile.displayName,
      userPhotoURL: userProfile.photoURL,
      content,
      type: 'text' as const,
    }

    const result = await ChatService.sendMessage(selectedChat.id, messageData)
    
    if (!result.success) {
      toast.error(result.error || "Failed to send message")
    }
  }

  const handleCreateDirectChat = async (otherUserId: string) => {
    if (!user) return

    const result = await ChatService.createDirectChat(user.uid, otherUserId)
    
    if (result.success) {
      toast.success("Chat created successfully!")
    } else {
      toast.error(result.error || "Failed to create chat")
    }
  }

  const handleCreateGroupChat = async (name: string, participants: string[]) => {
    if (!user) return

    const result = await ChatService.createGroupChat(name, participants, user.uid)
    
    if (result.success) {
      toast.success("Group chat created successfully!")
    } else {
      toast.error(result.error || "Failed to create group chat")
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading chats...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <ChatLayout>
        <ChatList 
          chats={chats} 
          selectedChat={selectedChat} 
          onSelectChat={setSelectedChat}
          onCreateDirectChat={handleCreateDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
          currentUser={userProfile}
        />
        {selectedChat && (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onShowProfile={() => setShowProfile(true)}
            currentUser={userProfile}
          />
        )}
        {showProfile && selectedChat && (
          <UserProfile 
            user={selectedChat.participants.find(p => p !== user?.uid) || selectedChat} 
            onClose={() => setShowProfile(false)} 
          />
        )}
      </ChatLayout>
    </ProtectedRoute>
  )
}
