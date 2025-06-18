"use client"

import { useState, useEffect } from "react"
import { Bell, MessageSquare, Phone, Video, X, Save, Volume2, VolumeX, Play, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { notificationService, NotificationSettings as NotificationSettingsType } from "@/lib/notification-service"
import { demoService } from "@/lib/demo-service"
import { toast } from "sonner"

interface NotificationSettingsProps {
  onClose: () => void
  onUpdate: (enabled: boolean) => void
  currentSettings?: NotificationSettingsType
}

export function NotificationSettings({ onClose, onUpdate, currentSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    enabled: currentSettings?.enabled ?? true,
    messageNotifications: currentSettings?.messageNotifications ?? true,
    callNotifications: currentSettings?.callNotifications ?? true,
    groupNotifications: currentSettings?.groupNotifications ?? true,
    soundEnabled: currentSettings?.soundEnabled ?? true,
    soundVolume: currentSettings?.soundVolume ?? 50,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default')
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    // Load current settings from the service
    const currentServiceSettings = notificationService.getSettings()
    setSettings(currentServiceSettings)
    
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Update the notification service settings
      notificationService.updateSettings(settings)
      
      // Request permission if not already granted
      if (settings.enabled && permissionStatus !== 'granted') {
        const granted = await notificationService.requestPermission()
        if (granted) {
          setPermissionStatus('granted')
          toast.success("Notification permission granted!")
        } else {
          toast.error("Notification permission denied. Please enable notifications in your browser settings.")
        }
      }
      
      onUpdate(settings.enabled)
      toast.success("Notification settings updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update notification settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (key: keyof NotificationSettingsType) => {
    if (key === 'soundVolume') return
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleVolumeChange = (value: number[]) => {
    setSettings(prev => ({
      ...prev,
      soundVolume: value[0]
    }))
  }

  const handleTestNotification = async () => {
    setIsTesting(true)
    try {
      // Try Firebase notification first, fallback to demo
      try {
        await notificationService.testNotification()
        toast.success("Test notification sent!")
      } catch (error) {
        console.log('Firebase notification failed, using demo mode')
        await demoService.triggerDemoNotification()
        toast.success("Demo notification sent!")
      }
    } catch (error) {
      toast.error("Failed to send test notification")
    } finally {
      setIsTesting(false)
    }
  }

  const handleTestSound = async () => {
    try {
      await notificationService.playNotificationSound()
      toast.success("Test sound played!")
    } catch (error) {
      toast.error("Failed to play test sound")
    }
  }

  const handleDemoNotification = async () => {
    try {
      await demoService.triggerDemoNotification()
      toast.success("Demo notification sent!")
    } catch (error) {
      toast.error("Failed to send demo notification")
    }
  }

  const getPermissionStatusBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Granted</Badge>
      case 'denied':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Denied</Badge>
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Not Set</Badge>
    }
  }

  const getNotificationStatusText = () => {
    if (!settings.enabled) {
      return "Notifications are disabled"
    }
    if (permissionStatus !== 'granted') {
      return "Browser permission required"
    }
    return "Notifications are active and working"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Permission Status */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Browser Permission</span>
                {getPermissionStatusBadge()}
              </div>
              <p className="text-xs text-muted-foreground">
                {getNotificationStatusText()}
              </p>
            </AlertDescription>
          </Alert>

          {/* General Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                General Notifications
              </CardTitle>
              <CardDescription>
                Control overall notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications for new messages and calls
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={() => handleToggle('enabled')}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Message Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Notifications
              </CardTitle>
              <CardDescription>
                Control notifications for different message types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Direct Messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify for new direct messages
                  </p>
                </div>
                <Switch
                  checked={settings.messageNotifications && settings.enabled}
                  onCheckedChange={() => handleToggle('messageNotifications')}
                  disabled={!settings.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Group Messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify for new group messages
                  </p>
                </div>
                <Switch
                  checked={settings.groupNotifications && settings.enabled}
                  onCheckedChange={() => handleToggle('groupNotifications')}
                  disabled={!settings.enabled}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Call Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Notifications
              </CardTitle>
              <CardDescription>
                Control notifications for incoming calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Voice & Video Calls</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify for incoming calls
                  </p>
                </div>
                <Switch
                  checked={settings.callNotifications && settings.enabled}
                  onCheckedChange={() => handleToggle('callNotifications')}
                  disabled={!settings.enabled}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Sound Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sound Settings
              </CardTitle>
              <CardDescription>
                Control notification sounds and volume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notification Sounds</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled && settings.enabled}
                  onCheckedChange={() => handleToggle('soundEnabled')}
                  disabled={!settings.enabled}
                />
              </div>
              {settings.soundEnabled && settings.enabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Sound Volume</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestSound}
                      disabled={!settings.soundEnabled}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                  <Slider
                    value={[settings.soundVolume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Volume: {settings.soundVolume}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Test Notifications</CardTitle>
              <CardDescription>
                Test your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleTestNotification}
                disabled={isTesting || !settings.enabled || permissionStatus !== 'granted'}
                className="w-full"
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Send Test Notification
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                  onClick={() => notificationService.triggerTestMessageNotification()}
                  disabled={!settings.enabled || permissionStatus !== 'granted'}
                  size="sm"
                  variant="outline"
                >
                  Test Message
                </Button>
                <Button
                  onClick={() => notificationService.triggerTestGroupNotification()}
                  disabled={!settings.enabled || permissionStatus !== 'granted'}
                  size="sm"
                  variant="outline"
                >
                  Test Group
                </Button>
                <Button
                  onClick={() => notificationService.triggerTestCallNotification()}
                  disabled={!settings.enabled || permissionStatus !== 'granted'}
                  size="sm"
                  variant="outline"
                >
                  Test Call
                </Button>
                <Button
                  onClick={() => notificationService.triggerTestMentionNotification()}
                  disabled={!settings.enabled || permissionStatus !== 'granted'}
                  size="sm"
                  variant="outline"
                >
                  Test Mention
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                These will send test notifications to verify your settings
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 