"use client"

import { useState } from "react"
import { Bell, MessageSquare, Phone, Video, X, Save, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

interface NotificationSettingsProps {
  onClose: () => void
  onUpdate: (enabled: boolean) => void
  currentSettings?: {
    enabled: boolean
    messageNotifications: boolean
    callNotifications: boolean
    groupNotifications: boolean
    soundEnabled: boolean
    soundVolume: number
  }
}

export function NotificationSettings({ onClose, onUpdate, currentSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    enabled: currentSettings?.enabled ?? true,
    messageNotifications: currentSettings?.messageNotifications ?? true,
    callNotifications: currentSettings?.callNotifications ?? true,
    groupNotifications: currentSettings?.groupNotifications ?? true,
    soundEnabled: currentSettings?.soundEnabled ?? true,
    soundVolume: currentSettings?.soundVolume ?? 50,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onUpdate(settings.enabled)
      toast.success("Notification settings updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update notification settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (key: keyof typeof settings) => {
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
                  <Label className="text-sm font-medium">Sound Volume</Label>
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