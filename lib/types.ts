export interface User {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  about?: string
}

export interface Chat {
  id: string
  user: User
  lastMessage?: string
  time: string
  unread: number
  typing?: boolean
  isGroup?: boolean
}

export interface Message {
  id: string
  content: string
  timestamp: string
  sender: "me" | "other"
  status: "sent" | "delivered" | "read"
}
