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
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuthContext } from "@/components/auth-provider"

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

  return (
    <>
      <div className="w-full md:w-80 lg:w-96 border-r border-border/40 glass-card rounded-none md:rounded-r-2xl overflow-hidden flex flex-col animate-slide-from-left">
        <div className="p-3 md:p-4 border-b border-border/40">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-bold">Chats</h2>
            <div className="flex gap-1">
              <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-primary/10"
                  >
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="sr-only">New Chat</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Start a new chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Direct Messages</Label>
                      <ScrollArea className="h-32 mt-2">
                        {allUsers.map((user) => (
                          <div
                            key={user.uid}
                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer min-h-[48px]"
                            onClick={() => handleCreateDirectChat(user.uid)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{user.displayName}</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    <div className="border-t pt-4">
                      <Label>Create Group Chat</Label>
                      <Input
                        placeholder="Group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="mt-2"
                      />
                      <ScrollArea className="h-32 mt-2">
                        {allUsers.map((user) => (
                          <div
                            key={user.uid}
                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer min-h-[48px]"
                            onClick={() => {
                              setSelectedUsers(prev => 
                                prev.includes(user.uid) 
                                  ? prev.filter(id => id !== user.uid)
                                  : [...prev, user.uid]
                              )
                            }}
                          >
                            <Checkbox 
                              checked={selectedUsers.includes(user.uid)}
                              className="mr-2"
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{user.displayName}</span>
                          </div>
                        ))}
                      </ScrollArea>
                      <Button 
                        onClick={handleCreateGroupChat}
                        className="w-full mt-3"
                        disabled={!groupName.trim() || selectedUsers.length === 0}
                      >
                        Create Group
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogoutConfirm(true)}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-destructive/10 text-destructive hover:text-destructive"
                title="Logout"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 md:h-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors min-h-[64px]",
                  selectedChat?.id === chat.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    {chat.type === 'group' ? (
                      <div className="bg-muted h-full w-full flex items-center justify-center">
                        <span className="text-sm font-medium">{getChatDisplayName(chat).charAt(0)}</span>
                      </div>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg" alt={getChatDisplayName(chat)} />
                        <AvatarFallback>{getChatDisplayName(chat).charAt(0)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm md:text-base truncate">{getChatDisplayName(chat)}</h3>
                    <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessage?.timestamp)}</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {chat.lastMessage?.content || "No messages yet"}
                  </p>
                  {chat.type === 'group' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {chat.participants.length} members
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <CreateGroupModal open={showCreateGroup} onClose={() => setShowCreateGroup(false)} />

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
