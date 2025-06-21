"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { callService } from '@/lib/call-service'

interface OnlineStatusContextType {
  onlineUsers: string[]
  isOnline: (userId: string) => boolean
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined)

export const OnlineStatusProvider = ({ children }: { children: ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    const socket = callService.getSocket()
    if (!socket) return

    const handleOnlineUsers = (users: string[]) => {
      console.log("Received online users:", users)
      setOnlineUsers(users)
    }

    // Immediately request the list upon connection
    const requestOnlineUsers = () => {
      if (socket.connected) {
        console.log("Requesting online users list...")
        socket.emit('get-online-users')
      }
    }

    socket.on('connect', requestOnlineUsers)
    socket.on('online-users', handleOnlineUsers)

    // Also request if already connected
    requestOnlineUsers()

    return () => {
      socket.off('connect', requestOnlineUsers)
      socket.off('online-users', handleOnlineUsers)
    }
  }, [])

  const isOnline = (userId: string) => onlineUsers.includes(userId)

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers, isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  )
}

export const useOnlineStatus = (): OnlineStatusContextType => {
  const context = useContext(OnlineStatusContext)
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider')
  }
  return context
} 