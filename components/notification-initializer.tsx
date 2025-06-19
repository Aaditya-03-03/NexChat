"use client"

import { useEffect, useCallback } from "react"
import { notificationService } from "@/lib/notification-service"
import { toast } from "sonner"

export function NotificationInitializer() {
  const initializeNotifications = useCallback(async () => {
    try {
      // Check if browser supports notifications
      if (!("Notification" in window)) {
        console.warn("This browser does not support notifications")
        return
      }

      // Request permission if not already granted
      if (Notification.permission !== "granted") {
        const granted = await notificationService.requestPermission()
        if (granted) {
          console.log("Notification permission granted")
          // Show a welcome notification
          await notificationService.showNotification("Notifications Enabled", {
            body: "You will now receive notifications for new messages.",
            requireInteraction: false
          })
        } else {
          console.log("Notification permission denied")
          // Show a toast to inform the user
          toast.error(
            "Notifications are disabled. You won't receive alerts for new messages.",
            {
              duration: 5000,
              action: {
                label: "Enable",
                onClick: () => notificationService.requestPermission()
              }
            }
          )
        }
      }
    } catch (error) {
      console.error("Failed to initialize notifications:", error)
    }
  }, [])

  useEffect(() => {
    // Initialize notifications when the component mounts
    initializeNotifications()

    // Re-initialize when the window gains focus
    const handleFocus = () => {
      if (Notification.permission === "default") {
        initializeNotifications()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [initializeNotifications])

  return null
} 