"use client"

import { useState } from "react"
import { Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EmojiPicker } from "@/components/emoji-picker"
import { cn } from "@/lib/utils"

interface MessageReactionsProps {
  reactions?: { [emoji: string]: string[] }
  currentUserId: string
  onAddReaction: (emoji: string) => void
  onRemoveReaction: (emoji: string) => void
  className?: string
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉', '🫶', '🩷', '🩵', '🫡', '🔥', '✨', '🙏', '🥰', '😍', '🤔', '😎', '🤯']

export function MessageReactions({ 
  reactions, 
  currentUserId, 
  onAddReaction, 
  onRemoveReaction,
  className 
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleEmojiSelect = (emoji: string) => {
    const hasReacted = reactions?.[emoji]?.includes(currentUserId)
    
    if (hasReacted) {
      onRemoveReaction(emoji)
    } else {
      onAddReaction(emoji)
    }
    
    setShowEmojiPicker(false)
  }

  const getReactionCount = (emoji: string) => {
    return reactions?.[emoji]?.length || 0
  }

  const hasUserReacted = (emoji: string) => {
    return reactions?.[emoji]?.includes(currentUserId) || false
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Existing reactions */}
      {reactions && Object.keys(reactions).length > 0 && (
        <div className="flex items-center gap-1">
          {Object.entries(reactions).map(([emoji, users]) => {
            const count = users.length
            const hasReacted = users.includes(currentUserId)
            
            return (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs rounded-full transition-colors",
                  hasReacted 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-muted/50 hover:bg-muted"
                )}
                onClick={() => handleEmojiSelect(emoji)}
              >
                <span className="mr-1">{emoji}</span>
                <span>{count}</span>
              </Button>
            )
          })}
        </div>
      )}

      {/* Add reaction button */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-muted/50"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-col gap-2">
            {/* Quick reactions */}
            <div className="flex gap-1">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 rounded-full hover:bg-muted/50",
                    hasUserReacted(emoji) && "bg-primary/20"
                  )}
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
            
            {/* Custom emoji picker */}
            <div className="border-t pt-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 