"use client"

import { useEffect } from "react"

export function NotificationInitializer() {
  useEffect(() => {
    // Initialize notification service
    if (typeof window !== 'undefined') {
      import('@/lib/notification-service').then(({ notificationService }) => {
        // Request notification permission on app start
        notificationService.requestPermission().then(granted => {
          if (granted) {
            console.log('Notification permission granted')
          } else {
            console.log('Notification permission denied')
          }
        })
      })
    }
  }, [])

  return null
} 