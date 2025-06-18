"use client"

import { useState } from "react"
import { Shield, Eye, EyeOff, Users, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface PrivacySettingsProps {
  onClose: () => void
  onUpdate: (settings: any) => void
  currentSettings?: {
    showOnlineStatus: boolean
    showLastSeen: boolean
    allowReadReceipts: boolean
    allowProfileView: boolean
    allowMessageRequests: boolean
  }
}

export function PrivacySettings({ onClose, onUpdate, currentSettings }: PrivacySettingsProps) {
  const [settings, setSettings] = useState({
    showOnlineStatus: currentSettings?.showOnlineStatus ?? true,
    showLastSeen: currentSettings?.showLastSeen ?? true,
    allowReadReceipts: currentSettings?.allowReadReceipts ?? true,
    allowProfileView: currentSettings?.allowProfileView ?? true,
    allowMessageRequests: currentSettings?.allowMessageRequests ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onUpdate(settings)
      toast.success("Privacy settings updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update privacy settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Privacy & Security</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Online Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Online Status
              </CardTitle>
              <CardDescription>
                Control who can see when you're online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Online Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Let others see when you're active
                  </p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={() => handleToggle('showOnlineStatus')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Last Seen</Label>
                  <p className="text-xs text-muted-foreground">
                    Show when you were last active
                  </p>
                </div>
                <Switch
                  checked={settings.showLastSeen}
                  onCheckedChange={() => handleToggle('showLastSeen')}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Message Privacy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Message Privacy
              </CardTitle>
              <CardDescription>
                Control message-related privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Read Receipts</Label>
                  <p className="text-xs text-muted-foreground">
                    Show when you've read messages
                  </p>
                </div>
                <Switch
                  checked={settings.allowReadReceipts}
                  onCheckedChange={() => handleToggle('allowReadReceipts')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Allow Profile View</Label>
                  <p className="text-xs text-muted-foreground">
                    Let others view your profile
                  </p>
                </div>
                <Switch
                  checked={settings.allowProfileView}
                  onCheckedChange={() => handleToggle('allowProfileView')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Message Requests</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow messages from unknown users
                  </p>
                </div>
                <Switch
                  checked={settings.allowMessageRequests}
                  onCheckedChange={() => handleToggle('allowMessageRequests')}
                />
              </div>
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