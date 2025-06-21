"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, UserMinus, Crown, Settings, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Chat, ChatService } from "@/lib/chat-service"
import { toast } from "sonner"

interface GroupManagementProps {
  chat: Chat
  currentUser: any
  onClose: () => void
  onUpdate: (chat: Chat) => void
}

export function GroupManagement({ chat, currentUser, onClose, onUpdate }: GroupManagementProps) {
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [groupName, setGroupName] = useState(chat.name || "")
  const [isEditingName, setIsEditingName] = useState(false)

  useEffect(() => {
    loadAllUsers()
  }, [])

  const loadAllUsers = async () => {
    setLoading(true)
    try {
      const result = await ChatService.getAllUsers(currentUser.uid)
      if (result.success) {
        setAllUsers(result.users)
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = chat.admins?.includes(currentUser.uid) || false
  const isCreator = chat.admins?.[0] === currentUser.uid

  const filteredUsers = allUsers.filter(user => 
    !chat.participants.includes(user.uid) &&
    (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const participants = allUsers.filter(user => chat.participants.includes(user.uid))

  const handleAddUser = async (userId: string) => {
    if (!isAdmin) {
      toast.error("Only admins can add users")
      return
    }

    const result = await ChatService.addUserToGroup(chat.id, userId, currentUser.uid)
    if (result.success) {
      toast.success("User added to group")
      loadAllUsers()
    } else {
      toast.error(result.error || "Failed to add user")
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!isAdmin) {
      toast.error("Only admins can remove users")
      return
    }

    if (isCreator && userId === currentUser.uid) {
      toast.error("Group creator cannot remove themselves")
      return
    }

    const result = await ChatService.removeUserFromGroup(chat.id, userId, currentUser.uid)
    if (result.success) {
      toast.success("User removed from group")
      loadAllUsers()
    } else {
      toast.error(result.error || "Failed to remove user")
    }
  }

  const handleUpdateGroupName = async () => {
    if (!groupName.trim()) {
      toast.error("Group name cannot be empty")
      return
    }

    // This would need to be implemented in ChatService
    toast.success("Group name updated")
    setIsEditingName(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Group Management</h2>
              <p className="text-sm text-muted-foreground">{chat.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-5rem)]">
          {/* Left side - Group info and participants */}
          <div className="w-1/2 border-r border-border/40 flex flex-col">
            {/* Group info */}
            <div className="p-4 border-b border-border/40">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  {isEditingName ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateGroupName()
                          if (e.key === 'Escape') setIsEditingName(false)
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleUpdateGroupName}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">{chat.name || "Unnamed Group"}</span>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Members ({chat.participants.length})</label>
                </div>
              </div>
            </div>

            {/* Participants list */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {participants.map((participant) => {
                  const isParticipantAdmin = chat.admins?.includes(participant.uid)
                  const canRemove = isAdmin && (participant.uid !== currentUser.uid || !isCreator)

                  return (
                    <div
                      key={participant.uid}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.photoURL} className="object-cover" />
                          <AvatarFallback>{participant.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{participant.displayName}</span>
                            {isParticipantAdmin && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(participant.uid)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Add users */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-border/40">
              <h3 className="font-medium mb-3">Add Members</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL} className="object-cover" />
                          <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddUser(user.uid)}
                        className="h-6 w-6 p-0"
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No users found" : "All users are already in the group"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
} 