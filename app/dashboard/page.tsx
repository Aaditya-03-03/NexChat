"use client"

import { useState, useEffect } from "react"
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
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardPage() {
  const { user, userProfile } = useAuthContext()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [activeTab, setActiveTab] = useState("chats")
  const [searchQuery, setSearchQuery] = useState("")
  const [chatSearchQuery, setChatSearchQuery] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [userNames, setUserNames] = useState<{[key: string]: string}>({})
  
  // Settings states
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showClearChatsDialog, setShowClearChatsDialog] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    allowReadReceipts: true
  })

  // Add state for add contact modal
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [addContactInput, setAddContactInput] = useState("")
  const [addContactLoading, setAddContactLoading] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowChatList(!selectedChat)
      } else {
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
      
      // Don't automatically select first chat - let user choose
      // if (!selectedChat && userChats.length > 0) {
      //   setSelectedChat(userChats[0])
      // }
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

  // Fetch all users for contacts
  useEffect(() => {
    if (activeTab === "contacts" && user) {
      ChatService.getAllUsers(user.uid).then(result => {
        if (result.success) {
          setAllUsers(result.users)
        }
      })
    }
  }, [activeTab, user])

  // Fetch user names for direct chats
  useEffect(() => {
    const fetchUserNames = async () => {
      const names: {[key: string]: string} = {}
      
      for (const chat of chats) {
        if (chat.type === 'direct') {
          const otherUserId = chat.participants.find(p => p !== user?.uid)
          if (otherUserId && !names[otherUserId]) {
            try {
              const userDoc = await getDoc(doc(db, 'users', otherUserId))
              if (userDoc.exists()) {
                names[otherUserId] = userDoc.data().displayName || 'Unknown User'
              } else {
                names[otherUserId] = 'Unknown User'
              }
            } catch (error) {
              names[otherUserId] = 'Unknown User'
            }
          }
        }
      }
      
      setUserNames(names)
    }

    if (chats.length > 0 && user) {
      fetchUserNames()
    }
  }, [chats, user])

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

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' = 'text', fileUrl?: string) => {
    if (!selectedChat || !user || !userProfile) return

    const messageData = {
      chatId: selectedChat.id,
      userId: user.uid,
      userDisplayName: userProfile.displayName,
      userPhotoURL: userProfile.photoURL,
      content: fileUrl || content,
      type,
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
      setActiveTab("chats")
    } else {
      toast.error(result.error || "Failed to create chat")
    }
  }

  const handleCreateGroupChat = async (name: string, participants: string[]) => {
    if (!user) return

    const result = await ChatService.createGroupChat(name, participants, user.uid)
    
    if (result.success) {
      toast.success("Group chat created successfully!")
      setActiveTab("chats")
    } else {
      toast.error(result.error || "Failed to create group")
    }
  }

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)
    if (isMobileView) {
      setShowChatList(false)
    }
  }

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

  const filteredUsers = allUsers.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredChats = chats.filter(chat => {
    const searchLower = chatSearchQuery.toLowerCase()
    
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
  })

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat'
    } else {
      // For direct chats, show the other participant's name
      const otherUserId = chat.participants.find(p => p !== user?.uid)
      if (!otherUserId) return 'Unknown User'
      return userNames[otherUserId] || otherUserId || 'Unknown User'
    }
  }

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
  const handleDeleteChat = async (chat: Chat) => {
    if (!user) return
    
    if (!confirm(`Are you sure you want to delete this ${chat.type === 'direct' ? 'conversation' : 'group'}? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await ChatService.deleteChat(chat.id, user.uid)
      if (result.success) {
        toast.success("Chat deleted successfully")
        if (selectedChat?.id === chat.id) {
          setSelectedChat(null)
          setMessages([])
        }
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10"
                        onClick={() => setActiveTab("contacts")}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
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
                    <div className="space-y-1 p-2">
                      {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat)}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-muted/50 active:scale-95"
                          >
                            <div className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-background">
                                {chat.type === 'group' ? (
                                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 h-full w-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">{(chat.name || 'G').charAt(0)}</span>
                                  </div>
                                ) : (
                                  <>
                                    <AvatarImage src="/placeholder.svg" alt={getChatDisplayName(chat)} />
                                    <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50">
                                      {getChatDisplayName(chat).charAt(0)}
                                    </AvatarFallback>
                                  </>
                                )}
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate">{getChatDisplayName(chat)}</h3>
                                <span className="text-xs text-muted-foreground">
                                  {chat.lastMessage?.timestamp ? 
                                    new Date(chat.lastMessage.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                    : ''
                                  }
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-1">
                                {chat.lastMessage?.content || "No messages yet"}
                              </p>
                              {chat.type === 'group' && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                                    {chat.participants.length} members
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Empty state for mobile
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
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
              ) : (
                selectedChat && (
                  <ChatWindow
                    chat={selectedChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onShowProfile={() => setShowProfile(true)}
                    onBackToChatList={handleBackToChatList}
                    currentUser={userProfile}
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
                  <div className="p-3 space-y-2">
                    {filteredUsers.map((contact) => (
                      <div
                        key={contact.uid}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-all active:scale-95"
                        onClick={() => handleCreateDirectChat(contact.uid)}
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-background">
                          <AvatarImage src={contact.photoURL} />
                          <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50">
                            {contact.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{contact.displayName}</h3>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                          <MessageSquare className="h-4 w-4" />
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
            
            {/* Help Tab */}
            <TabsContent value="help" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        Help & Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">FAQ</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Contact Support</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <Star className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Rate App</span>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                          onClick={() => setActiveTab("contacts")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
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
                      <div className="p-2 space-y-1">
                        {filteredChats.length > 0 ? (
                          filteredChats.map((chat) => (
                            <div
                              key={chat.id}
                              onClick={() => setSelectedChat(chat)}
                              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-muted/50 active:scale-95"
                            >
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-background">
                                  {chat.type === 'group' ? (
                                    <div className="bg-gradient-to-br from-primary/20 to-primary/10 h-full w-full flex items-center justify-center">
                                      <span className="text-sm font-semibold text-primary">{(chat.name || 'G').charAt(0)}</span>
                                    </div>
                                  ) : (
                                    <>
                                      <AvatarImage src="/placeholder.svg" alt={getChatDisplayName(chat)} />
                                      <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50">
                                        {getChatDisplayName(chat).charAt(0)}
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-sm truncate">{getChatDisplayName(chat)}</h3>
                                  <span className="text-xs text-muted-foreground">
                                    {chat.lastMessage?.timestamp ? 
                                      new Date(chat.lastMessage.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                      : ''
                                    }
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mb-1">
                                  {chat.lastMessage?.content || "No messages yet"}
                                </p>
                                {chat.type === 'group' && (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                                      {chat.participants.length} members
                                    </Badge>
                                  </div>
                                )}
                              </div>
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
                      <div className="p-4 space-y-2">
                        {filteredUsers.map((contact) => (
                          <div
                            key={contact.uid}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-all active:scale-95"
                            onClick={() => handleCreateDirectChat(contact.uid)}
                          >
                            <Avatar className="h-12 w-12 ring-2 ring-background">
                              <AvatarImage src={contact.photoURL} />
                              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50">
                                {contact.displayName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{contact.displayName}</h3>
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                                <Video className="h-4 w-4" />
                              </Button>
                            </div>
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
                <ChatWindow
                  chat={selectedChat}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onShowProfile={() => setShowProfile(true)}
                  currentUser={userProfile}
                />
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
                className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
              >
                <Plus className="h-5 w-5 md:h-6 md:w-6" />
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
              handleDeleteChat(selectedChat)
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
    </ProtectedRoute>
  )
} 