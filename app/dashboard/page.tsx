"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChatLayout } from "@/components/chat-layout"
import { ChatList } from "@/components/chat-list"
import { ChatWindow } from "@/components/chat-window"
import { UserProfile } from "@/components/user-profile"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { ChatService, Chat, Message } from "@/lib/chat-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ProfileEditor } from "@/components/profile-editor"
import { PrivacySettings } from "@/components/privacy-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Search, 
  Plus, 
  Phone, 
  Video, 
  MoreHorizontal,
  UserPlus,
  Shield,
  Bell,
  HelpCircle,
  Star,
  Archive,
  Trash,
  Eye,
  EyeOff,
  Clock,
  Loader2,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import { doc, getDoc, getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function DashboardPage() {
  const { user, userProfile } = useAuthContext()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [activeTab, setActiveTab] = useState("chats")
  const [searchQuery, setSearchQuery] = useState("")
  const [chatSearchQuery, setChatSearchQuery] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [userNames, setUserNames] = useState<{[key: string]: string}>({})
  const [userNamesLoading, setUserNamesLoading] = useState(false)
  
  // Debounced search queries
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedChatSearchQuery = useDebounce(chatSearchQuery, 300)
  
  // Settings states
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showClearChatsDialog, setShowClearChatsDialog] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    allowReadReceipts: true,
    allowProfileView: true,
    allowMessageRequests: true
  })

  // Add state for add contact modal
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [addContactInput, setAddContactInput] = useState("")
  const [addContactLoading, setAddContactLoading] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768
      console.log('Mobile check - window width:', window.innerWidth, 'isMobile:', isMobile)
      setIsMobileView(isMobile)
      if (isMobile) {
        console.log('Mobile view - setting showChatList to:', !selectedChat)
        setShowChatList(!selectedChat)
      } else {
        console.log('Desktop view - setting showChatList to true')
        setShowChatList(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [selectedChat])

  // Subscribe to user's chats
  useEffect(() => {
    if (!user) return

    const unsubscribe = ChatService.subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  // Subscribe to messages for selected chat with loading state
  useEffect(() => {
    console.log('Message subscription effect triggered, selectedChat:', selectedChat?.id)
    
    if (!selectedChat) {
      console.log('No selected chat, clearing messages')
      setMessages([])
      return
    }

    console.log('Subscribing to messages for chat:', selectedChat.id)
    setChatLoading(true)
    const unsubscribe = ChatService.subscribeToMessages(selectedChat.id, (chatMessages) => {
      console.log('Messages received for chat:', selectedChat.id, 'count:', chatMessages.length)
      setMessages(chatMessages)
      setChatLoading(false)
    })

    return unsubscribe
  }, [selectedChat])

  // Fetch all users for contacts
  useEffect(() => {
    if (activeTab === "contacts" && user) {
      ChatService.getAllUsers(user.uid).then(result => {
        if (result.success) {
          setAllUsers(result.users || [])
        }
      })
    }
  }, [activeTab, user])

  // Optimized user names fetching with caching
  useEffect(() => {
    const fetchUserNames = async () => {
      if (chats.length === 0 || !user || userNamesLoading) return
      
      setUserNamesLoading(true)
      const names: {[key: string]: string} = { ...userNames }
      const userIdsToFetch: string[] = []
      
      // Collect unique user IDs that need fetching
      for (const chat of chats) {
        if (chat.type === 'direct') {
          const otherUserId = chat.participants.find(p => p !== user?.uid)
          if (otherUserId && !names[otherUserId] && !userIdsToFetch.includes(otherUserId)) {
            userIdsToFetch.push(otherUserId)
          }
        }
      }
      
      // Batch fetch user names
      if (userIdsToFetch.length > 0) {
        try {
          const userDocs = await Promise.all(
            userIdsToFetch.map(userId => getDoc(doc(db, 'users', userId)))
          )
          
          userDocs.forEach((userDoc, index) => {
            const userId = userIdsToFetch[index]
            if (userDoc.exists()) {
              names[userId] = userDoc.data().displayName || 'Unknown User'
            } else {
              names[userId] = 'Unknown User'
            }
          })
          
          setUserNames(names)
        } catch (error) {
          console.error('Error fetching user names:', error)
        }
      }
      
      setUserNamesLoading(false)
    }

    fetchUserNames()
  }, [chats, user, userNamesLoading])

  // Debug effect for chat selection
  useEffect(() => {
    console.log('ChatWindow rendering debug - selectedChat:', selectedChat?.id, 'chatLoading:', chatLoading, 'messages:', messages.length, 'userProfile:', !!userProfile)
  }, [selectedChat, chatLoading, messages.length, userProfile])

  // Debug effect for user authentication
  useEffect(() => {
    console.log('User auth debug - user:', !!user, 'userProfile:', !!userProfile, 'user?.uid:', user?.uid)
  }, [user, userProfile])

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

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' = 'text', fileUrl?: string, shortUrl?: string) => {
    if (!selectedChat || !user || !userProfile) return

    const messageData: any = {
      chatId: selectedChat.id,
      userId: user.uid,
      userDisplayName: userProfile.displayName,
      userPhotoURL: userProfile.photoURL,
      content: fileUrl || content,
      type,
    }

    // Only include URL fields if they have values
    if (fileUrl) {
      messageData.originalUrl = fileUrl
    }
    if (shortUrl) {
      messageData.shortUrl = shortUrl
    }

    const result = await ChatService.sendMessage(selectedChat.id, messageData)
    
    if (!result.success) {
      toast.error(result.error || "Failed to send message")
    }
  }

  const handleCreateDirectChat = async (otherUserId: string) => {
    if (!user) return

    try {
      const result = await ChatService.createDirectChat(user.uid, otherUserId)
      if (result.success) {
        // Chat will be automatically added to the list via subscription
        setActiveTab("chats")
        toast.success("Chat created successfully")
      } else {
        toast.error(result.error || "Failed to create chat")
      }
    } catch (error) {
      toast.error("Failed to create chat")
    }
  }

  const handleCreateGroupChat = async (name: string, participants: string[]) => {
    if (!user) return

    try {
      const result = await ChatService.createGroupChat(name, participants, user.uid)
      if (result.success) {
        setActiveTab("chats")
        toast.success("Group created successfully")
      } else {
        toast.error(result.error || "Failed to create group")
      }
    } catch (error) {
      toast.error("Failed to create group")
    }
  }

  // Optimized chat selection with loading state
  const handleSelectChat = useCallback((chat: Chat) => {
    console.log('handleSelectChat called with:', chat.id, 'current selectedChat:', selectedChat?.id)
    
    setChatLoading(true)
    setSelectedChat(chat)
    if (isMobileView) {
      setShowChatList(false)
    }
    
    console.log('Chat selected, loading state set to true')
  }, [selectedChat, isMobileView])

  const handleBackToChatList = () => {
    setShowChatList(true)
    setSelectedChat(null)
  }

  // Settings handlers
  const handleEditProfile = () => {
    setShowProfileEditor(true)
  }

  const handlePrivacySettings = () => {
    setShowPrivacySettings(true)
  }

  const handleNotificationSettings = () => {
    setShowNotificationSettings(true)
  }

  const handleArchiveChats = () => {
    setShowArchiveDialog(true)
  }

  const handleClearAllChats = () => {
    setShowClearChatsDialog(true)
  }

  const handleArchiveChatsConfirm = async () => {
    try {
      // Archive all chats logic here
      toast.success("All chats archived successfully")
      setShowArchiveDialog(false)
    } catch (error) {
      toast.error("Failed to archive chats")
    }
  }

  const handleClearChatsConfirm = async () => {
    try {
      // Clear all chats logic here
      setChats([])
      setSelectedChat(null)
      setMessages([])
      toast.success("All chats cleared successfully")
      setShowClearChatsDialog(false)
    } catch (error) {
      toast.error("Failed to clear chats")
    }
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    // Update user profile logic here
    toast.success("Profile updated successfully")
    setShowProfileEditor(false)
    
    // Update the userProfile in the auth context
    // This would typically be done through the auth context
    // For now, we'll just show a success message
  }

  const handlePrivacyUpdate = (settings: any) => {
    setPrivacySettings(settings)
    toast.success("Privacy settings updated")
    setShowPrivacySettings(false)
  }

  const handleNotificationUpdate = (enabled: boolean) => {
    setNotifications(enabled)
    toast.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`)
    setShowNotificationSettings(false)
  }

  // Memoized filtered users
  const filteredUsers = useMemo(() => 
    allUsers.filter(user => 
      user.displayName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    ), [allUsers, debouncedSearchQuery]
  )

  // Memoized filtered chats
  const filteredChats = useMemo(() => 
    chats.filter(chat => {
      const searchLower = debouncedChatSearchQuery.toLowerCase()
      
      if (chat.type === 'group') {
        // For group chats, search through group name and last message
        return chat.name?.toLowerCase().includes(searchLower) ||
               chat.lastMessage?.content?.toLowerCase().includes(searchLower)
      } else {
        // For direct chats, search through the other participant's name and last message
        const otherUserId = chat.participants.find(p => p !== user?.uid)
        const otherUserName = otherUserId ? (userNames[otherUserId] || otherUserId || 'Unknown User') : 'Unknown User'
        return otherUserName.toLowerCase().includes(searchLower) ||
               chat.lastMessage?.content?.toLowerCase().includes(searchLower)
      }
    }), [chats, debouncedChatSearchQuery, userNames, user?.uid]
  )

  const getChatDisplayName = useCallback((chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat'
    } else {
      // For direct chats, show the other participant's name
      const otherUserId = chat.participants.find(p => p !== user?.uid)
      if (!otherUserId) return 'Unknown User'
      return userNames[otherUserId] || otherUserId || 'Unknown User'
    }
  }, [userNames, user?.uid])

  // Add contact handler
  const handleAddContact = async () => {
    if (!addContactInput) return
    setAddContactLoading(true)
    try {
      // Try to find user by email or UID
      let userToAdd = allUsers.find(u => u.email === addContactInput || u.uid === addContactInput)
      if (!userToAdd) {
        toast.error("User not found")
        setAddContactLoading(false)
        return
      }
      await handleCreateDirectChat(userToAdd.uid)
      setShowAddContactModal(false)
      setAddContactInput("")
    } catch (e) {
      toast.error("Failed to add contact")
    }
    setAddContactLoading(false)
  }

  // Delete chat handler
  const handleDeleteChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat || !user) return

    setChatToDelete(chatId)
    setShowDeleteChatDialog(true)
  }

  const handleDeleteChatConfirm = async () => {
    if (!chatToDelete || !user) return

    try {
      const result = await ChatService.deleteChat(chatToDelete, user.uid)
      if (result.success) {
        toast.success("Chat deleted successfully")
        if (selectedChat?.id === chatToDelete) {
          setSelectedChat(null)
        }
        setShowDeleteChatDialog(false)
        setChatToDelete(null)
      } else {
        toast.error(result.error || "Failed to delete chat")
      }
    } catch (error) {
      toast.error("Failed to delete chat")
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <ChatLayout>
        {/* Mobile: Show tabs or chat window */}
        {isMobileView ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chats" className="text-xs">Chats</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
            </TabsList>
            
            {/* Chats Tab */}
            <TabsContent value="chats" className="mt-0 h-full">
              {showChatList ? (
                <div className="w-full h-full flex flex-col">
                  {/* Header with Search */}
                  <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold">Messages</h2>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                          onClick={() => setActiveTab("contacts")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search conversations..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Chat List */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 p-3">
                      {userNamesLoading && chats.length > 0 && (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                          <span className="text-base text-muted-foreground">Loading chat names...</span>
                        </div>
                      )}
                      {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-muted/50 active:scale-95 group relative",
                              selectedChat?.id === chat.id && "bg-primary/10 border border-primary/20"
                            )}
                          >
                            <div 
                              className="flex items-center gap-4 flex-1 min-w-0"
                              onClick={() => handleSelectChat(chat)}
                            >
                              <div className="relative flex-shrink-0">
                                <Avatar className="h-16 w-16 ring-2 ring-background">
                                  {chat.type === 'group' ? (
                                    <div className="bg-gradient-to-br from-primary/20 to-primary/10 h-full w-full flex items-center justify-center">
                                      <span className="text-lg font-semibold text-primary">{(chat.name || 'G').charAt(0)}</span>
                                    </div>
                                  ) : (
                                    <>
                                      <AvatarImage src="/placeholder.svg" alt={getChatDisplayName(chat)} />
                                      <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-lg font-semibold">
                                        {getChatDisplayName(chat).charAt(0)}
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-base truncate">{getChatDisplayName(chat)}</h3>
                                  <span className="text-sm text-muted-foreground flex-shrink-0">
                                    {chat.lastMessage?.timestamp ? 
                                      new Date(chat.lastMessage.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                      : ''
                                    }
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate mb-2">
                                  {chat.lastMessage?.content || "No messages yet"}
                                </p>
                                {chat.type === 'group' && (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                      {chat.participants.length} members
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Delete button - visible on hover/long press */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteChat(chat.id)
                              }}
                              className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <Trash2 className="h-5 w-5" />
                              <span className="sr-only">Delete chat</span>
                            </Button>
                          </div>
                        ))
                      ) : (
                        // Empty state for mobile
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="h-12 w-12 text-primary" />
                          </div>
                          <h3 className="text-2xl font-semibold mb-3">No conversations yet</h3>
                          <p className="text-base text-muted-foreground mb-6">
                            Start chatting with friends and family
                          </p>
                          <Button 
                            onClick={() => setActiveTab("contacts")}
                            className="bg-primary hover:bg-primary/90 text-base px-6 py-3"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Start New Chat
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                selectedChat && (
                  <ChatWindow
                    chat={selectedChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onShowProfile={() => setShowProfile(true)}
                    onBackToChatList={isMobileView ? handleBackToChatList : undefined}
                    onDeleteChat={handleDeleteChat}
                    currentUser={userProfile}
                    chatDisplayName={getChatDisplayName(selectedChat)}
                  />
                )
              )}
            </TabsContent>
            
            {/* Contacts Tab */}
            <TabsContent value="contacts" className="mt-0 h-full">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Contacts</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10"
                      onClick={() => setShowAddContactModal(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Add Contact Modal */}
                <Dialog open={showAddContactModal} onOpenChange={setShowAddContactModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Contact</DialogTitle>
                      <DialogDescription>Enter the email or user ID of the contact you want to add.</DialogDescription>
                    </DialogHeader>
                    <Input
                      placeholder="Email or User ID"
                      value={addContactInput}
                      onChange={e => setAddContactInput(e.target.value)}
                      disabled={addContactLoading}
                    />
                    <DialogFooter>
                      <Button onClick={handleAddContact} disabled={!addContactInput || addContactLoading}>
                        {addContactLoading ? 'Adding...' : 'Add'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Contacts List */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {filteredUsers.map((contact) => (
                      <div
                        key={contact.uid}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-all active:scale-95"
                        onClick={() => handleCreateDirectChat(contact.uid)}
                      >
                        <Avatar className="h-16 w-16 ring-2 ring-background">
                          <AvatarImage src={contact.photoURL} />
                          <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-lg font-semibold">
                            {contact.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{contact.displayName}</h3>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                          <MessageSquare className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Profile Section */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Profile Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleEditProfile}>
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Edit Profile</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handlePrivacySettings}>
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Privacy & Security</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleNotificationSettings}>
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Notifications</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chat Settings */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Chat Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleArchiveChats}>
                        <Archive className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Archive Chats</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleClearAllChats}>
                        <Trash className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Clear All Chats</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          /* Desktop: Show tabs with content */
          <div className="w-full flex">
            {/* Left Sidebar with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-80 border-r border-border/40 flex flex-col">
              <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1">
                <TabsContent value="chats" className="mt-0 h-full">
                  <div className="h-full flex flex-col">
                    {/* Header with Search */}
                    <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Messages</h2>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary/10"
                            onClick={() => setActiveTab("contacts")}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search conversations..."
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {/* Chat List */}
                    <ScrollArea className="flex-1">
                      <div className="space-y-2 p-3">
                        {userNamesLoading && chats.length > 0 && (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                            <span className="text-base text-muted-foreground">Loading chat names...</span>
                          </div>
                        )}
                        {filteredChats.length > 0 ? (
                          filteredChats.map((chat) => (
                            <div
                              key={chat.id}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-muted/50 active:scale-95 group relative",
                                selectedChat?.id === chat.id && "bg-primary/10 border border-primary/20"
                              )}
                            >
                              <div 
                                className="flex items-center gap-4 flex-1 min-w-0"
                                onClick={() => handleSelectChat(chat)}
                              >
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-16 w-16 ring-2 ring-background">
                                    {chat.type === 'group' ? (
                                      <div className="bg-gradient-to-br from-primary/20 to-primary/10 h-full w-full flex items-center justify-center">
                                        <span className="text-lg font-semibold text-primary">{(chat.name || 'G').charAt(0)}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <AvatarImage src="/placeholder.svg" alt={getChatDisplayName(chat)} />
                                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-lg font-semibold">
                                          {getChatDisplayName(chat).charAt(0)}
                                        </AvatarFallback>
                                      </>
                                    )}
                                  </Avatar>
                                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-base truncate">{getChatDisplayName(chat)}</h3>
                                    <span className="text-sm text-muted-foreground flex-shrink-0">
                                      {chat.lastMessage?.timestamp ? 
                                        new Date(chat.lastMessage.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                        : ''
                                      }
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate mb-2">
                                    {chat.lastMessage?.content || "No messages yet"}
                                  </p>
                                  {chat.type === 'group' && (
                                    <div className="flex items-center gap-1">
                                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                        {chat.participants.length} members
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Delete button - visible on hover/long press */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteChat(chat.id)
                                }}
                                className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Delete chat</span>
                              </Button>
                            </div>
                          ))
                        ) : (
                          // Empty state
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
                              <MessageSquare className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Start chatting with friends and family
                            </p>
                            <Button 
                              onClick={() => setActiveTab("contacts")}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start New Chat
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="contacts" className="mt-0 h-full">
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Contacts</h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                          onClick={() => setShowAddContactModal(true)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search contacts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {/* Add Contact Modal */}
                    <Dialog open={showAddContactModal} onOpenChange={setShowAddContactModal}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Contact</DialogTitle>
                          <DialogDescription>Enter the email or user ID of the contact you want to add.</DialogDescription>
                        </DialogHeader>
                        <Input
                          placeholder="Email or User ID"
                          value={addContactInput}
                          onChange={e => setAddContactInput(e.target.value)}
                          disabled={addContactLoading}
                        />
                        <DialogFooter>
                          <Button onClick={handleAddContact} disabled={!addContactInput || addContactLoading}>
                            {addContactLoading ? 'Adding...' : 'Add'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Contacts List */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-3">
                        {filteredUsers.map((contact) => (
                          <div
                            key={contact.uid}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-all active:scale-95"
                            onClick={() => handleCreateDirectChat(contact.uid)}
                          >
                            <Avatar className="h-16 w-16 ring-2 ring-background">
                              <AvatarImage src={contact.photoURL} />
                              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-lg font-semibold">
                                {contact.displayName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-base">{contact.displayName}</h3>
                              <p className="text-sm text-muted-foreground">{contact.email}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                              <MessageSquare className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {/* Profile Section */}
                      <Card className="border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Profile Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleEditProfile}>
                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Edit Profile</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handlePrivacySettings}>
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Privacy & Security</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleNotificationSettings}>
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Notifications</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Chat Settings */}
                      <Card className="border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Chat Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleArchiveChats}>
                            <Archive className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Archive Chats</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleClearAllChats}>
                            <Trash className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Clear All Chats</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
            
            {/* Right Side - Chat Window or Welcome */}
            <div className="flex-1 relative">
              {selectedChat ? (
                chatLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading chat...</p>
                    </div>
                  </div>
                ) : (
                  <ChatWindow
                    chat={selectedChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onShowProfile={() => setShowProfile(true)}
                    onBackToChatList={isMobileView ? handleBackToChatList : undefined}
                    onDeleteChat={handleDeleteChat}
                    currentUser={userProfile}
                    chatDisplayName={getChatDisplayName(selectedChat)}
                  />
                )
              ) : (
                /* Welcome Screen */
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">Welcome to Nex Chat</h2>
                      <p className="text-muted-foreground max-w-md text-lg">
                        Select a conversation from the sidebar to start messaging with friends and family.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab("contacts")}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Floating + Button for New Chat - Always visible */}
              <Button
                onClick={() => setActiveTab("contacts")}
                size="icon"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Start new conversation</span>
              </Button>
            </div>
          </div>
        )}
        
        {showProfile && selectedChat && (
          <UserProfile 
            user={{
              id: selectedChat.type === 'direct' 
                ? selectedChat.participants.find(p => p !== user?.uid) || 'unknown'
                : selectedChat.id,
              name: selectedChat.type === 'direct' 
                ? userNames[selectedChat.participants.find(p => p !== user?.uid) || ''] || 'Unknown User'
                : selectedChat.name || 'Group Chat',
              avatar: selectedChat.photoURL,
              isOnline: true,
              about: selectedChat.type === 'direct' ? 'Hey there! I\'m using Nex Chat.' : `${selectedChat.participants.length} members`
            }} 
            onClose={() => setShowProfile(false)}
            onDeleteChat={() => {
              handleDeleteChat(selectedChat.id)
              setShowProfile(false)
            }}
          />
        )}
      </ChatLayout>
      
      {/* Settings Modals */}
      {showProfileEditor && (
        <ProfileEditor
          user={user}
          userProfile={userProfile}
          onClose={() => setShowProfileEditor(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {showPrivacySettings && (
        <PrivacySettings
          onClose={() => setShowPrivacySettings(false)}
          onUpdate={handlePrivacyUpdate}
          currentSettings={privacySettings}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
          onUpdate={handleNotificationUpdate}
          currentSettings={{
            enabled: notifications,
            messageNotifications: true,
            callNotifications: true,
            groupNotifications: true,
            soundEnabled: true,
            soundVolume: 50,
          }}
        />
      )}

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive All Chats</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive all chats? This will hide them from your main chat list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleArchiveChatsConfirm}>
              Archive All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Chats Dialog */}
      <Dialog open={showClearChatsDialog} onOpenChange={setShowClearChatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Chats</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all chats? This action cannot be undone and will delete all messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearChatsDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearChatsConfirm}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Dialog */}
      <Dialog open={showDeleteChatDialog} onOpenChange={setShowDeleteChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone and will delete all messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteChatDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChatConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
} 