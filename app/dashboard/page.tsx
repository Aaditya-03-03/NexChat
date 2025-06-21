"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChatLayout } from "@/components/chat-layout"
import { ChatList } from "@/components/chat-list"
import { ChatWindow } from "@/components/chat-window"
import { UserProfile } from "@/components/user-profile"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { useLanguage } from "@/components/language-provider"
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
import { LanguageSettings } from "@/components/language-settings"
import { HelpSettings } from "@/components/help-settings"
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
  Trash2,
  User,
  Edit2,
  Languages,
  Database
} from "lucide-react"
import { toast } from "sonner"
import { doc, getDoc, getDocs, collection, Firestore, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { CreateGroupModal } from "@/components/create-group-modal"
import { UserProfileModal } from "@/components/user-profile-modal"
import { ProfilePhotoViewer } from "@/components/profile-photo-viewer"
import { useProfilePhotoViewer } from "@/hooks/use-profile-photo-viewer"

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
  const { user, userProfile, loading } = useAuthContext()
  const { isOpen, photoURL, userName, userId, openViewer, closeViewer } = useProfilePhotoViewer()
  const { t } = useLanguage()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [activeTab, setActiveTab] = useState("chats")
  const [searchQuery, setSearchQuery] = useState("")
  const [chatSearchQuery, setChatSearchQuery] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [userNames, setUserNames] = useState<{[key: string]: string}>({})
  const [userProfiles, setUserProfiles] = useState<{[key: string]: {displayName: string, photoURL?: string}}>({})
  const [userNamesLoading, setUserNamesLoading] = useState(false)
  
  // Debounced search queries
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedChatSearchQuery = useDebounce(chatSearchQuery, 300)
  
  // Settings states
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showLanguageSettings, setShowLanguageSettings] = useState(false)
  const [showHelpSettings, setShowHelpSettings] = useState(false)
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

  // Add state for create group modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)

  // Add a state for the selected profile userId
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

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
    }, user?.uid)

    return unsubscribe
  }, [selectedChat, user])

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
      const profiles: {[key: string]: any} = { ...userProfiles }
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
      
      // Batch fetch user names and profiles
      if (userIdsToFetch.length > 0) {
        try {
          const userDocs = await Promise.all(
            userIdsToFetch.map(userId => getDoc(doc(db as Firestore, 'users', userId)))
          )
          
          userDocs.forEach((userDoc, index) => {
            const userId = userIdsToFetch[index]
            if (userDoc.exists()) {
              const userData = userDoc.data()
              names[userId] = userData.displayName || 'Unknown User'
              profiles[userId] = userData
            } else {
              names[userId] = 'Unknown User'
              profiles[userId] = { displayName: 'Unknown User', photoURL: '' }
            }
          })
          
          setUserNames(names)
          setUserProfiles(profiles)
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

  // Debug effect for database connection
  useEffect(() => {
    if (user) {
      console.log('Testing database connection...');
      // Test a simple database operation
      const testConnection = async () => {
        try {
          const result = await ChatService.getAllUsers(user.uid);
          console.log('Database connection test result:', result);
        } catch (error) {
          console.error('Database connection test failed:', error);
        }
      };
      testConnection();
    }
  }, [user]);

  // Test function for debugging
  const testDatabaseConnection = async () => {
    console.log('=== COMPREHENSIVE DEBUG TEST ===');
    console.log('1. User Authentication Check:');
    console.log('   - User object:', !!user);
    console.log('   - User UID:', user?.uid);
    console.log('   - User email:', user?.email);
    console.log('   - UserProfile:', !!userProfile);
    console.log('   - UserProfile data:', userProfile);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      toast.error('No authenticated user found');
      return;
    }
    
    console.log('2. Firebase Services Check:');
    try {
      const firebaseModule = await import('@/lib/firebase');
      const db = firebaseModule.db as import('firebase/firestore').Firestore | undefined;
      const auth = firebaseModule.auth as import('firebase/auth').Auth | undefined;
      console.log('   - Database object:', !!db);
      console.log('   - Auth object:', !!auth);
      console.log('   - Current auth user:', auth?.currentUser);
    } catch (error) {
      console.error('❌ Firebase services not available:', error);
      toast.error('Firebase services not available');
      return;
    }
    
    console.log('3. Database Read Test:');
    try {
      const result = await ChatService.getAllUsers(user.uid);
      console.log('   - getAllUsers result:', result);
      if (result.success) {
        console.log('   - Found users:', result.users?.length || 0);
      } else {
        console.error('❌ getAllUsers failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Database read test failed:', error);
      toast.error('Database read test failed');
      return;
    }
    
    console.log('4. Chat Creation Test:');
    try {
      // Try to create a test chat with the first available user
      const usersResult = await ChatService.getAllUsers(user.uid);
      if (usersResult.success && usersResult.users && usersResult.users.length > 0) {
        const testUser = usersResult.users[0];
        console.log('   - Testing with user:', testUser);
        
        const chatResult = await ChatService.createDirectChat(user.uid, testUser.id);
        console.log('   - createDirectChat result:', chatResult);
        
        if (chatResult.success) {
          console.log('✅ Chat creation successful!');
          toast.success('Chat creation test successful!');
        } else {
          console.error('❌ Chat creation failed:', chatResult.error);
          toast.error(`Chat creation failed: ${chatResult.error}`);
        }
      } else {
        console.log('   - No other users found for testing');
        toast.info('No other users found for testing');
      }
    } catch (error) {
      console.error('❌ Chat creation test failed:', error);
      toast.error('Chat creation test failed');
    }
    
    console.log('=== END DEBUG TEST ===');
  };

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

  const handleSendMessage = async (
    content: string, 
    type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' = 'text', 
    fileUrl?: string, 
    shortUrl?: string,
    messageData?: Partial<Message>
  ) => {
    if (!selectedChat || !user) return

    const finalMessageData = {
      userId: user.uid,
      userDisplayName: user.displayName || "Anonymous",
      userPhotoURL: user.photoURL || "",
      content: fileUrl || content,
      type,
      originalUrl: fileUrl || null,
      shortUrl: shortUrl || null,
      replyTo: messageData?.replyTo || null,
      reactions: messageData?.reactions || [],
    };

    const result = await ChatService.sendMessage(selectedChat.id, finalMessageData as Omit<Message, 'id' | 'timestamp' | 'readBy' | 'deliveredTo' | 'status'>);

    if (!result.success) {
      toast.error(result.error || "Failed to send message");
    }
  };

  const handleCreateDirectChat = async (otherUserId: string) => {
    console.log('Dashboard: handleCreateDirectChat called with otherUserId:', otherUserId, 'current user:', user?.uid);
    if (!user) {
      console.error('Dashboard: No user found, cannot create chat');
      return;
    }

    try {
      console.log('Dashboard: Calling ChatService.createDirectChat...');
      const result = await ChatService.createDirectChat(user.uid, otherUserId)
      console.log('Dashboard: ChatService.createDirectChat result:', result);
      if (result.success) {
        // Chat will be automatically added to the list via subscription
        setActiveTab("chats")
        toast.success("Chat created successfully")
        console.log('Dashboard: Chat created successfully, switching to chats tab');
      } else {
        console.error('Dashboard: Failed to create chat:', result.error);
        toast.error(result.error || "Failed to create chat")
      }
    } catch (error) {
      console.error('Dashboard: Exception in handleCreateDirectChat:', error);
      toast.error("Failed to create chat")
    }
  }

  const handleCreateGroupChat = async (name: string, participants: string[]) => {
    console.log('Dashboard: handleCreateGroupChat called with name:', name, 'participants:', participants, 'current user:', user?.uid);
    if (!user) {
      console.error('Dashboard: No user found, cannot create group');
      return;
    }

    try {
      console.log('Dashboard: Calling ChatService.createGroupChat...');
      const result = await ChatService.createGroupChat(name, participants, user.uid)
      console.log('Dashboard: ChatService.createGroupChat result:', result);
      if (result.success) {
        setActiveTab("chats")
        toast.success("Group created successfully")
        console.log('Dashboard: Group created successfully, switching to chats tab');
      } else {
        console.error('Dashboard: Failed to create group:', result.error);
        toast.error(result.error || "Failed to create group")
      }
    } catch (error) {
      console.error('Dashboard: Exception in handleCreateGroupChat:', error);
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

  const handleLanguageSettings = () => {
    setShowLanguageSettings(true)
  }

  const handleHelpSettings = () => {
    setShowHelpSettings(true)
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
    // Update the current user's profile in the cache
    if (user) {
      setUserProfiles(prev => ({
        ...prev,
        [user.uid]: updatedProfile
      }))
    }
    toast.success("Profile updated successfully")
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
  const filteredChats: Chat[] = useMemo(() => 
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

  // Replace the sidebar UserProfile with the modal
  // Find the userId for the selected chat (for direct chat, it's the other participant)
  const getProfileUserId = () => {
    if (!selectedChat) return null
    if (selectedChat.type === 'direct') {
      return selectedChat.participants.find(p => p !== user?.uid) || null
    }
    return selectedChat.id // For group, use chat id
  }

  const getOtherUserPhotoURL = (chat: Chat): string | null => {
    if (!chat || !user) return null
    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find(p => p !== user?.uid)
      if (otherUserId) {
        // Try to get from userProfiles cache
        const cachedUser = userProfiles[otherUserId]
        if (cachedUser && cachedUser.photoURL) {
          return cachedUser.photoURL
        }
        // If not in cache, return null and let the component handle it
        return null
      }
    }
    return null
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
              <TabsTrigger value="chats" className="text-xs">{t('nav.chats')}</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">{t('nav.contacts')}</TabsTrigger>
            </TabsList>
            
            {/* Chats Tab */}
            <TabsContent value="chats" className="mt-0 h-full">
              {showChatList ? (
                <div className="w-full h-full flex flex-col">
                  {/* Header with Search */}
                  <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold">{t('nav.chats')}</h2>
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
                        placeholder={t('chat.search')}
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
                        filteredChats.map((chat: Chat) => (
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
                                      <AvatarImage 
                                        src={getOtherUserPhotoURL(chat) || "/placeholder.svg"} 
                                        alt={getChatDisplayName(chat)} 
                                        className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const photoURL = getOtherUserPhotoURL(chat)
                                          if (photoURL && chat.type === 'direct') {
                                            const otherUserId = chat.participants.find(p => p !== user?.uid)
                                            openViewer(photoURL, getChatDisplayName(chat), otherUserId || undefined)
                                          }
                                        }}
                                      />
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
                          <h3 className="text-2xl font-semibold mb-3">{t('chat.noConversations')}</h3>
                          <p className="text-base text-muted-foreground mb-6">
                            {t('chat.startChat')}
                          </p>
                          <Button 
                            onClick={() => setActiveTab("contacts")}
                            className="bg-primary hover:bg-primary/90 text-base px-6 py-3"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            {t('chat.new')}
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
                    onBackToChatList={undefined}
                    onDeleteChat={handleDeleteChat}
                    currentUser={userProfile}
                    chatDisplayName={getChatDisplayName(selectedChat)}
                    otherUserPhotoURL={getOtherUserPhotoURL(selectedChat)}
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
                    <h2 className="text-lg font-semibold">{t('nav.contacts')}</h2>
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
                      placeholder={t('chat.search')}
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

                {/* Create Group Modal */}
                <CreateGroupModal 
                  open={showCreateGroupModal} 
                  onClose={() => setShowCreateGroupModal(false)}
                  onCreateGroup={handleCreateGroupChat}
                  currentUser={user}
                  allUsers={allUsers}
                />
                
                {/* Contacts List */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {/* Create Group Section */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">Create New Group</h3>
                          <p className="text-sm text-muted-foreground">Start a group conversation with multiple contacts</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowCreateGroupModal(true)}
                          className="border-primary text-primary hover:bg-primary/10"
                        >
                          Create
                        </Button>
                      </div>
                    </div>

                    {/* Contacts */}
                    {filteredUsers.map((contact) => (
                      <div
                        key={contact.uid}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-all active:scale-95"
                        onClick={() => handleCreateDirectChat(contact.uid)}
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-background">
                          <AvatarImage src={contact.photoURL} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-sm font-semibold">
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
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleLanguageSettings}>
                        <Languages className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">App Language</span>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleHelpSettings}
                        >
                          <HelpCircle className="h-4 w-4 mr-3" />
                          Help & Support
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={testDatabaseConnection}
                        >
                          <Database className="h-4 w-4 mr-3" />
                          Test Database
                        </Button>
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
          <div className="w-full flex h-full">
            {/* Left Sidebar with Tabs - Always visible on desktop */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-96 border-r border-border/40 flex flex-col h-full">
              <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chats">{t('nav.chats')}</TabsTrigger>
                  <TabsTrigger value="contacts">{t('nav.contacts')}</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 h-full">
                <TabsContent value="chats" className="mt-0 h-full">
                  <div className="h-full flex flex-col">
                    {/* Header with Search */}
                    <div className="p-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">{t('nav.chats')}</h2>
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
                          placeholder={t('chat.search')}
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {/* Chat List */}
                    <ScrollArea className="flex-1 h-full">
                      <div className="space-y-2 p-3">
                        {userNamesLoading && chats.length > 0 && (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                            <span className="text-base text-muted-foreground">Loading chat names...</span>
                          </div>
                        )}
                        {filteredChats.length > 0 ? (
                          filteredChats.map((chat: Chat) => (
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
                                        <AvatarImage 
                                          src={getOtherUserPhotoURL(chat) || "/placeholder.svg"} 
                                          alt={getChatDisplayName(chat)} 
                                          className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const photoURL = getOtherUserPhotoURL(chat)
                                            if (photoURL && chat.type === 'direct') {
                                              const otherUserId = chat.participants.find(p => p !== user?.uid)
                                              openViewer(photoURL, getChatDisplayName(chat), otherUserId || undefined)
                                            }
                                          }}
                                        />
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
                        <h2 className="text-lg font-semibold">{t('nav.contacts')}</h2>
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
                          placeholder={t('chat.search')}
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
                    
                    {/* Create Group Modal */}
                    <CreateGroupModal 
                      open={showCreateGroupModal} 
                      onClose={() => setShowCreateGroupModal(false)}
                      onCreateGroup={handleCreateGroupChat}
                      currentUser={user}
                      allUsers={allUsers}
                    />
                    
                    {/* Contacts List */}
                    <ScrollArea className="flex-1 h-full">
                      <div className="p-4 space-y-3">
                        {/* Create Group Section */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-base">Create New Group</h3>
                              <p className="text-sm text-muted-foreground">Start a group conversation with multiple contacts</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowCreateGroupModal(true)}
                              className="border-primary text-primary hover:bg-primary/10"
                            >
                              Create
                            </Button>
                          </div>
                        </div>

                        {/* Contacts */}
                        {filteredUsers.map((contact) => (
                          <div
                            key={contact.uid}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-all active:scale-95"
                            onClick={() => handleCreateDirectChat(contact.uid)}
                          >
                            <Avatar className="h-12 w-12 ring-2 ring-background">
                              <AvatarImage src={contact.photoURL} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-sm font-semibold">
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
                    <div className="p-4 space-y-6">
                      {/* Profile Card */}
                      <Card className="border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Profile Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleEditProfile}>
                            <Edit2 className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Edit Profile</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handlePrivacySettings}>
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Privacy Settings</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleNotificationSettings}>
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Notification Settings</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={handleLanguageSettings}>
                            <Languages className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">App Language</span>
                          </div>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleHelpSettings}
                            >
                              <HelpCircle className="h-4 w-4 mr-3" />
                              Help & Support
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={testDatabaseConnection}
                            >
                              <Database className="h-4 w-4 mr-3" />
                              Test Database
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Chat Settings Card */}
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
            
            {/* Right Side - Chat Window or Welcome - Takes remaining space */}
            <div className="flex-1 relative h-full">
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
                    onBackToChatList={undefined}
                    onDeleteChat={handleDeleteChat}
                    currentUser={userProfile}
                    chatDisplayName={getChatDisplayName(selectedChat)}
                    otherUserPhotoURL={getOtherUserPhotoURL(selectedChat)}
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
                      <h2 className="text-3xl font-bold">{t('welcome.title')}</h2>
                      <p className="text-muted-foreground max-w-md text-lg">
                        {t('welcome.subtitle')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab("contacts")}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t('chat.new')}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Floating + Button for New Chat - Only visible when no chat is selected */}
              {!selectedChat && (
                <Button
                  onClick={() => setActiveTab("contacts")}
                  size="icon"
                  className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Start new conversation</span>
                </Button>
              )}
            </div>
          </div>
        )}
        
        {showProfile && selectedChat && (
          <UserProfileModal
            userId={getProfileUserId() || ''}
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            userStatus={undefined} // Optionally pass user status if available
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

      {showLanguageSettings && (
        <LanguageSettings
          onClose={() => setShowLanguageSettings(false)}
          onUpdate={(settings) => {
            toast.success("Language settings updated successfully")
            setShowLanguageSettings(false)
          }}
        />
      )}

      {showHelpSettings && (
        <HelpSettings
          onClose={() => setShowHelpSettings(false)}
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

      {/* Profile Photo Viewer */}
      <ProfilePhotoViewer
        isOpen={isOpen}
        onClose={closeViewer}
        photoURL={photoURL}
        userName={userName}
        userId={userId}
        onMessage={() => {
          closeViewer()
          // Find the chat with this user and select it
          if (userId) {
            const chat = chats.find(c => c.type === 'direct' && c.participants.includes(userId))
            if (chat) {
              setSelectedChat(chat)
            } else {
              // Create a new chat if it doesn't exist
              handleCreateDirectChat(userId)
            }
          }
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
          if (userId) {
            // Show user profile modal
            // You could implement this by setting a state to show the profile modal
            toast.info("Profile info feature coming soon!")
          }
        }}
      />
    </ProtectedRoute>
  )
} 