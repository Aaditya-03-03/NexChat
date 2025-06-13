"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, Search, Plus, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockUsers } from "@/lib/mock-data"

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupImage, setGroupImage] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  if (!open) return null

  const filteredUsers = mockUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setGroupImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateGroup = () => {
    // Here you would create the group with the selected users
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h2 className="text-xl font-bold">{step === 1 ? "Create Group" : "Group Info"}</h2>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {step === 1 ? (
          <>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="glass-input pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">Selected ({selectedUsers.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map((userId) => {
                      const user = mockUsers.find((u) => u.id === userId)
                      if (!user) return null

                      return (
                        <div
                          key={user.id}
                          className="flex items-center gap-1 bg-primary/10 rounded-full pl-1 pr-2 py-1"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{user.name}</span>
                          <button
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            onClick={() => handleSelectUser(user.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {selectedUsers.includes(user.id) && (
                        <div className="absolute -right-1 -bottom-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.about || "Hey there! I'm using Nex Chat."}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/40 flex justify-end">
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={selectedUsers.length === 0}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 space-y-4">
              <div className="flex justify-center">
                <div className="relative group">
                  <div
                    className={`h-24 w-24 rounded-full overflow-hidden border-2 ${groupImage ? "border-primary" : "border-dashed border-muted-foreground"} flex items-center justify-center bg-muted/30 backdrop-blur-sm`}
                  >
                    {groupImage ? (
                      <img
                        src={groupImage || "/placeholder.svg"}
                        alt="Group preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="group-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name"
                  className="glass-input"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Participants ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((userId) => {
                    const user = mockUsers.find((u) => u.id === userId)
                    if (!user) return null

                    return (
                      <div key={user.id} className="flex items-center gap-1 bg-primary/10 rounded-full pl-1 pr-2 py-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{user.name}</span>
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleSelectUser(user.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border/40 flex justify-between">
              <Button variant="outline" className="glass-button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={!groupName.trim()}
                onClick={handleCreateGroup}
              >
                Create Group
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
