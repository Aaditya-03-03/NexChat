"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Settings, Users, UserPlus, MessageSquare, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatService, Chat, Message } from "@/lib/chat-service"
import { cn } from "@/lib/utils"
import { CreateGroupModal } from "@/components/create-group-modal"
import { StatusIndicator, AvatarStatus, UserStatus } from "@/components/ui/status-indicator"
import { toast } from "sonner"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuthContext } from "@/components/auth-provider"
import { UserProfileModal } from "@/components/user-profile-modal"

interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
  onCreateDirectChat: (otherUserId: string) => void
  onCreateGroupChat: (name: string, participants: string[]) => void
  currentUser: any
}

export function ChatList({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  onCreateDirectChat,
  onCreateGroupChat,
  currentUser 
}: ChatListProps) {
  const router = useRouter()
  const { logout } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [userNames, setUserNames] = useState<{[key: string]: string}>({})
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [userStatuses, setUserStatuses] = useState<{[key: string]: UserStatus}>({})
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)

  // Fetch all users for new chat creation
  useEffect(() => {
    if (showNewChat && currentUser) {
      ChatService.getAllUsers(currentUser.uid).then(result => {
        if (result.success) {
          setAllUsers(result.users)
        }
      })
    }
  }, [showNewChat, currentUser])

  // Fetch user names for chat display
  useEffect(() => {
    const fetchUserNames = async () => {
      const names: {[key: string]: string} = {}
      
      for (const chat of chats) {
        if (chat.type === 'direct') {
          const otherUserId = chat.participants.find(p => p !== currentUser?.uid)
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

    if (chats.length > 0 && currentUser) {
      fetchUserNames()
    }
  }, [chats, currentUser])

  // Subscribe to user statuses
  useEffect(() => {
    if (!currentUser) return

    const statusSubscriptions = new Map()

    const subscribeToUserStatus = (userId: string) => {
      if (statusSubscriptions.has(userId)) return

      const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          const lastSeen = data.lastSeen?.toDate() || new Date()
          const now = new Date()
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
          
          let status: UserStatus = "offline"
          if (data.isOnline) {
            status = "online"
          } else if (lastSeen > fiveMinutesAgo) {
            status = "away"
          }
          
          setUserStatuses(prev => ({
            ...prev,
            [userId]: status
          }))
        }
      })

      statusSubscriptions.set(userId, unsubscribe)
    }

    // Subscribe to status for all users in chats
    chats.forEach(chat => {
      if (chat.type === 'direct') {
        const otherUserId = chat.participants.find(p => p !== currentUser.uid)
        if (otherUserId) {
          subscribeToUserStatus(otherUserId)
        }
      }
    })

    // Subscribe to status for all users in contacts
    allUsers.forEach(user => {
      if (user.uid !== currentUser.uid) {
        subscribeToUserStatus(user.uid)
      }
    })

    return () => {
      statusSubscriptions.forEach(unsubscribe => unsubscribe())
    }
  }, [chats, allUsers, currentUser])

  const filteredChats = chats.filter((chat) => {
    const searchLower = searchQuery.toLowerCase()
    
    if (chat.type === 'direct') {
      // For direct chats, show the other participant's name
      const otherParticipant = chat.participants.find(p => p !== currentUser?.uid)
      const otherUserName = userNames[otherParticipant] || otherParticipant || 'Unknown User'
      return otherUserName.toLowerCase().includes(searchLower) ||
             (chat.lastMessage?.content.toLowerCase().includes(searchLower))
    } else {
      // For group chats, show the group name
      return chat.name?.toLowerCase().includes(searchLower) ||
             (chat.lastMessage?.content.toLowerCase().includes(searchLower))
    }
  })

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat'
    } else {
      // For direct chats, show the other participant's name
      const otherUserId = chat.participants.find(p => p !== currentUser?.uid)
      return userNames[otherUserId] || otherUserId || 'Unknown User'
    }
  }

  const handleCreateDirectChat = (userId: string) => {
    onCreateDirectChat(userId)
    setShowNewChat(false)
    setSelectedUsers([])
  }

  const handleCreateGroupChat = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name")
      return
    }
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user")
      return
    }
    
    onCreateGroupChat(groupName, selectedUsers)
    setShowNewChat(false)
    setSelectedUsers([])
    setGroupName("")
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

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation() // Prevent chat selection when clicking profile
    setSelectedProfileUserId(userId)
  }

  return (
    <>
      <div className="chat-sidebar">
        <div className="chat-sidebar-content">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <Tabs defaultValue="chats" className="w-full">
              <TabsList className="w-full mb-2 bg-background/50">
                <TabsTrigger value="chats" className="w-1/2 data-[state=active]:bg-primary/20">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chats
                </TabsTrigger>
                <TabsTrigger value="contacts" className="w-1/2 data-[state=active]:bg-primary/20">
                  <Users className="h-4 w-4 mr-2" />
                  Contacts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chats" className="m-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="scroll-area">
                  <div className="chat-list-container">
                    {filteredChats.map((chat) => {
                      const otherUserId = chat.type === 'direct' 
                        ? chat.participants.find(p => p !== currentUser?.uid)
                        : null
                      const userStatus = otherUserId ? userStatuses[otherUserId] : undefined

                      return (
                        <div
                          key={chat.id}
                          className={cn(
                            "contact-item",
                            selectedChat?.id === chat.id && "bg-accent"
                          )}
                          onClick={() => onSelectChat(chat)}
                        >
                          <div 
                            className="avatar-with-status cursor-pointer"
                            onClick={(e) => otherUserId && handleProfileClick(e, otherUserId)}
                          >
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={chat.avatar || ""} />
                              <AvatarFallback>
                                {chat.type === "group" ? chat.name?.[0] : getChatDisplayName(chat)[0]}
                              </AvatarFallback>
                            </Avatar>
                            {chat.type === 'direct' && userStatus && (
                              <AvatarStatus status={userStatus} />
                            )}
                          </div>
                          <div 
                            className="contact-info cursor-pointer"
                            onClick={(e) => otherUserId && handleProfileClick(e, otherUserId)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{getChatDisplayName(chat)}</p>
                              {chat.lastMessage && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatTime(chat.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                            {chat.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                          {chat.unreadCount > 0 && (
                            <Badge variant="default" className="shrink-0">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="contacts" className="m-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShowNewChat(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="scroll-area">
                  <div className="contact-list-container">
                    {allUsers
                      .filter(user => 
                        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user) => {
                        const userStatus = userStatuses[user.uid] || "offline"
                        
                        return (
                          <div
                            key={user.uid}
                            className="contact-item group"
                            onClick={() => handleCreateDirectChat(user.uid)}
                          >
                            <div 
                              className="avatar-with-status cursor-pointer"
                              onClick={(e) => handleProfileClick(e, user.uid)}
                            >
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={user.photoURL || ""} />
                                <AvatarFallback>
                                  {user.displayName?.[0] || user.email?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <AvatarStatus status={userStatus} />
                            </div>
                            <div 
                              className="contact-info cursor-pointer"
                              onClick={(e) => handleProfileClick(e, user.uid)}
                            >
                              <p className="font-medium truncate">
                                {user.displayName || user.email}
                              </p>
                              <StatusIndicator 
                                status={userStatus}
                                showDot={true}
                                showLabel={true}
                                className="mt-1"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="contact-action"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <CreateGroupModal open={showCreateGroup} onClose={() => setShowCreateGroup(false)} />

      {/* Profile Modal */}
      <UserProfileModal
        userId={selectedProfileUserId || ""}
        isOpen={!!selectedProfileUserId}
        onClose={() => setSelectedProfileUserId(null)}
        userStatus={selectedProfileUserId ? userStatuses[selectedProfileUserId] : undefined}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your chats.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
