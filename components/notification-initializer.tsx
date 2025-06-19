"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function NotificationInitializer() {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return
    }

    // Set initial permission state
    setPermissionState(Notification.permission)

    // Initialize notification service
    if (typeof window !== 'undefined') {
      import('@/lib/notification-service').then(({ notificationService }) => {
        // Load saved settings
        const settings = notificationService.getSettings()
        
        // If notifications are enabled but permission not granted, request it
        if (settings.enabled && Notification.permission === 'default') {
          requestPermission()
        }
      })
    }
  }, [])

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermissionState(result)
      
      if (result === 'granted') {
        toast.success('Notifications enabled')
        // Initialize notification service with new permission
        const { notificationService } = await import('@/lib/notification-service')
        notificationService.updateSettings({ enabled: true })
      } else if (result === 'denied') {
        toast.error('Please enable notifications in your browser settings to receive message alerts')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to enable notifications')
    }
  }

  // Show enable notifications prompt if permission is default
  if (permissionState === 'default') {
    return (
      <div className="fixed bottom-4 right-4 z-50 p-4 bg-background border rounded-lg shadow-lg max-w-sm">
        <h4 className="font-medium mb-2">Enable Notifications</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Get notified when you receive new messages, even when the app is in the background.
        </p>
        <Button onClick={requestPermission} size="sm">
          Enable Notifications
        </Button>
      </div>
    )
  }

  return null
} 