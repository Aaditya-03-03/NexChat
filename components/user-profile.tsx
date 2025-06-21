"use client"

import { useState } from "react"
import { X, Camera, Edit2, Bell, BellOff, Trash2, BlocksIcon as Block } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { User } from "@/lib/types"

interface UserProfileProps {
  user: User
  onClose: () => void
  onDeleteChat?: () => void
}

export function UserProfile({ user, onClose, onDeleteChat }: UserProfileProps) {
  const [muted, setMuted] = useState(false)

  return (
    <div className="w-full md:w-80 lg:w-96 border-l border-border/40 glass-card rounded-none md:rounded-l-2xl overflow-hidden flex flex-col animate-slide-from-right">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <h2 className="text-xl font-bold">Profile</h2>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Profile header */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-xl font-bold mt-4">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.isOnline ? "Online" : "Last seen recently"}</p>
          </div>

          <Separator className="my-4" />

          {/* About section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">About</h4>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{user.about || "Hey there! I'm using Nex Chat."}</p>
          </div>

          <Separator className="my-4" />

          {/* Media section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Media, links and docs</h4>
              <Button variant="link" size="sm" className="h-8 p-0">
                <span className="text-xs text-primary">See all</span>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                <img
                  src="/placeholder.svg?height=100&width=100"
                  alt="Media preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                <img
                  src="/placeholder.svg?height=100&width=100"
                  alt="Media preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                <img
                  src="/placeholder.svg?height=100&width=100"
                  alt="Media preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Actions section */}
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              onClick={() => setMuted(!muted)}
            >
              {muted ? (
                <>
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                  <span>Unmute notifications</span>
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span>Mute notifications</span>
                </>
              )}
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <Block className="h-5 w-5 text-muted-foreground" />
              <span>Block {user.name}</span>
            </button>
            <button 
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              onClick={onDeleteChat}
            >
              <Trash2 className="h-5 w-5 text-destructive" />
              <span className="text-destructive">Delete chat</span>
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
