"use client"

import { useState, useEffect } from "react"
import { Search, X, ArrowUp, ArrowDown, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, ChatService } from "@/lib/chat-service"
import { cn } from "@/lib/utils"

interface MessageSearchProps {
  chatId: string
  onMessageSelect: (message: Message) => void
  onClose: () => void
  className?: string
}

export function MessageSearch({ chatId, onMessageSelect, onClose, className }: MessageSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setSelectedIndex(-1)
      return
    }

    const searchMessages = async () => {
      setLoading(true)
      const result = await ChatService.searchMessages(chatId, query.trim())
      
      if (result.success) {
        setResults(result.messages)
        setSelectedIndex(-1)
      } else {
        setResults([])
      }
      setLoading(false)
    }

    const debounceTimer = setTimeout(searchMessages, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, chatId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          onMessageSelect(results[selectedIndex])
        }
        break
      case "Escape":
        onClose()
        break
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
      )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/40">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : results.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {results.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedIndex === index 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => onMessageSelect(message)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">
                          {message.userDisplayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {highlightText(message.content, query)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : query.length >= 2 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No messages found</p>
            <p className="text-xs text-muted-foreground">
              Try different keywords
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Search messages</p>
            <p className="text-xs text-muted-foreground">
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </div>

      {/* Search Tips */}
      {results.length > 0 && (
        <div className="p-3 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" />
                Navigate
              </span>
              <span>Enter to select</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 