"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

// Sample emoji categories
const emojis = {
  recent: ["😀", "😂", "❤️", "👍", "🙏", "🔥", "✨", "🎉"],
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  people: ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳‍♂️", "🧕", "👮‍♀️", "👮‍♂️"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"],
  food: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅"],
  activities: ["⚽️", "🏀", "🏈", "⚾️", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑"],
  travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖"],
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEmojis = searchQuery
    ? Object.values(emojis)
        .flat()
        .filter((emoji) => emoji.includes(searchQuery))
    : null

  return (
    <div className="glass-card rounded-xl">
      <div className="flex items-center justify-between p-2 border-b border-border/40">
        <h3 className="text-sm font-medium">Emojis</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emojis..."
            className="glass-input pl-9 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredEmojis ? (
        <ScrollArea className="h-[200px]">
          <div className="p-2">
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-lg"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      ) : (
        <Tabs defaultValue="recent">
          <TabsList className="grid grid-cols-8 h-auto p-0 bg-transparent">
            {Object.keys(emojis).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-8 w-8 p-0 data-[state=active]:bg-primary/10 rounded-lg"
              >
                {category === "recent" && "🕒"}
                {category === "smileys" && "😀"}
                {category === "people" && "👨‍👩‍👧‍👦"}
                {category === "animals" && "🐱"}
                {category === "food" && "🍔"}
                {category === "activities" && "⚽️"}
                {category === "travel" && "✈️"}
                {category === "symbols" && "❤️"}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(emojis).map(([category, categoryEmojis]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <ScrollArea className="h-[200px]">
                <div className="p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {categoryEmojis.map((emoji, index) => (
                      <button
                        key={`${emoji}-${index}`}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-lg"
                        onClick={() => onEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
