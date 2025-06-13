"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Settings, Users, UserPlus, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatService, Chat, Message } from "@/lib/chat-service"
import { cn } from "@/lib/utils"
import { CreateGroupModal } from "@/components/create-group-modal"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [userNames, setUserNames] = useState<{[key: string]: string}>({})

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

  const directChats = filteredChats.filter(chat => chat.type === 'direct')
  const groupChats = filteredChats.filter(chat => chat.type === 'group')

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

  return (
    <>
      <div className="w-full md:w-80 lg:w-96 border-r border-border/40 glass-card rounded-none md:rounded-r-2xl overflow-hidden flex flex-col animate-slide-from-left">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Chats</h2>
            <div className="flex gap-1">
              <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="sr-only">New Chat</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
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
                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
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
                          <div key={user.uid} className="flex items-center gap-3 p-2">
                            <Checkbox
                              checked={selectedUsers.includes(user.uid)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.uid])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.uid))
                                }
                              }}
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
                        className="w-full mt-2"
                        disabled={!groupName.trim() || selectedUsers.length === 0}
                      >
                        Create Group
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="glass-input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 gap-2 px-4 pt-2">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary/20">
              All
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-xl data-[state=active]:bg-primary/20">
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 mt-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      selectedChat?.id === chat.id ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50",
                    )}
                    onClick={() => onSelectChat(chat)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        {chat.type === 'group' ? (
                          <div className="bg-muted h-full w-full flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                        ) : (
                          <>
                            <AvatarImage src="/placeholder.svg" alt={getChatDisplayName(chat)} />
                            <AvatarFallback>{getChatDisplayName(chat).charAt(0)}</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{getChatDisplayName(chat)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessage?.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredChats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No chats found</p>
                    <p className="text-sm">Start a conversation to see it here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="flex-1 mt-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-2 space-y-1">
                {groupChats.map((chat) => (
                  <button
                    key={chat.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      selectedChat?.id === chat.id ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50",
                    )}
                    onClick={() => onSelectChat(chat)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <div className="bg-muted h-full w-full flex items-center justify-center">
                          <Users className="h-6 w-6" />
                        </div>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{chat.name || 'Group Chat'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessage?.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                  onClick={() => setShowCreateGroup(true)}
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Group</span>
                </button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupModal open={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
    </>
  )
}
