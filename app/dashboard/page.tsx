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
  Palette,
  HelpCircle,
  Star,
  Archive,
  Trash
} from "lucide-react"
import { toast } from "sonner"

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
  const [allUsers, setAllUsers] = useState<any[]>([])

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

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
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
      toast.error(result.error || "Failed to create group chat")
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

  const filteredUsers = allUsers.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chats" className="text-xs">Chats</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              <TabsTrigger value="help" className="text-xs">Help</TabsTrigger>
            </TabsList>
            <TabsContent value="chats" className="mt-0 h-full">
              {showChatList ? (
                <ChatList 
                  chats={chats} 
                  selectedChat={selectedChat} 
                  onSelectChat={handleSelectChat}
                  onCreateDirectChat={handleCreateDirectChat}
                  onCreateGroupChat={handleCreateGroupChat}
                  currentUser={userProfile}
                />
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
            <TabsContent value="contacts" className="mt-0 h-full">
              <div className="p-3 border-b border-border/40">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-3 space-y-2">
                  {filteredUsers.map((contact) => (
                    <div
                      key={contact.uid}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleCreateDirectChat(contact.uid)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.photoURL} />
                        <AvatarFallback>{contact.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{contact.displayName}</h3>
                        <p className="text-xs text-muted-foreground">{contact.email}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="settings" className="mt-0 h-full">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <UserPlus className="h-5 w-5" />
                        <span>Edit Profile</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Shield className="h-5 w-5" />
                        <span>Privacy & Security</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Palette className="h-5 w-5" />
                        <span>Appearance</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="help" className="mt-0 h-full">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Help & Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <HelpCircle className="h-5 w-5" />
                        <span>FAQ</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <MessageSquare className="h-5 w-5" />
                        <span>Contact Support</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Star className="h-5 w-5" />
                        <span>Rate App</span>
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
              <div className="p-4 border-b border-border/40">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1">
                <TabsContent value="chats" className="mt-0 h-full">
                  <ChatList 
                    chats={chats} 
                    selectedChat={selectedChat} 
                    onSelectChat={setSelectedChat}
                    onCreateDirectChat={handleCreateDirectChat}
                    onCreateGroupChat={handleCreateGroupChat}
                    currentUser={userProfile}
                  />
                </TabsContent>
                <TabsContent value="contacts" className="mt-0 h-full">
                  <div className="p-4 border-b border-border/40">
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
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="p-4 space-y-2">
                      {filteredUsers.map((contact) => (
                        <div
                          key={contact.uid}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleCreateDirectChat(contact.uid)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.photoURL} />
                            <AvatarFallback>{contact.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium">{contact.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Video className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="settings" className="mt-0 h-full">
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="p-4 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profile Settings</CardTitle>
                          <CardDescription>Manage your account and preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <UserPlus className="h-5 w-5" />
                            <span>Edit Profile</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Shield className="h-5 w-5" />
                            <span>Privacy & Security</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Bell className="h-5 w-5" />
                            <span>Notifications</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Palette className="h-5 w-5" />
                            <span>Appearance</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Chat Settings</CardTitle>
                          <CardDescription>Customize your chat experience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Archive className="h-5 w-5" />
                            <span>Archive Chats</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Trash className="h-5 w-5" />
                            <span>Clear All Chats</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="help" className="mt-0 h-full">
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="p-4 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Help & Support</CardTitle>
                          <CardDescription>Get help and contact support</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <HelpCircle className="h-5 w-5" />
                            <span>FAQ</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <MessageSquare className="h-5 w-5" />
                            <span>Contact Support</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Star className="h-5 w-5" />
                            <span>Rate App</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
            {/* Right Side - Chat Window or Welcome */}
            <div className="flex-1">
              {selectedChat ? (
                <ChatWindow
                  chat={selectedChat}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onShowProfile={() => setShowProfile(true)}
                  currentUser={userProfile}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome to InstaTalk</h2>
                    <p className="text-muted-foreground max-w-md">
                      Select a chat from the sidebar or start a new conversation to begin messaging.
                    </p>
                    <Button onClick={() => setActiveTab("contacts")}> 
                      <UserPlus className="mr-2 h-4 w-4" />
                      Start New Chat
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
