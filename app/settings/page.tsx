"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Bell, 
  LogOut, 
  Camera, 
  Save, 
  Settings,
  MessageSquare,
  Globe,
  HelpCircle,
  CreditCard,
  Smartphone,
  Key,
  Download,
  Trash2,
  Languages,
  Volume2,
  Eye,
  Users,
  Archive,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { ProfileEditor } from "@/components/profile-editor"
import { PrivacySettings } from "@/components/privacy-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { AccountSettings } from "@/components/account-settings"
import { ChatSettings } from "@/components/chat-settings"
import { LanguageSettings } from "@/components/language-settings"
import { HelpSettings } from "@/components/help-settings"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const { user, userProfile, logout } = useAuthContext()
  const [notifications, setNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [showChatSettings, setShowChatSettings] = useState(false)
  const [showLanguageSettings, setShowLanguageSettings] = useState(false)
  const [showHelpSettings, setShowHelpSettings] = useState(false)
  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("system")

  const handleLogout = async () => {
    setIsLoading(true)
    const result = await logout()
    
    if (result.success) {
      toast.success("Logged out successfully")
      router.push("/")
    } else {
      toast.error(result.error || "Failed to logout")
    }
    
    setIsLoading(false)
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    toast.success("Profile updated successfully")
  }

  const handlePrivacyUpdate = (settings: any) => {
    toast.success("Privacy settings updated successfully")
  }

  const handleNotificationUpdate = (enabled: boolean) => {
    setNotifications(enabled)
    toast.success("Notification settings updated successfully")
  }

  const settingsSections = [
    {
      id: "profile",
      title: "Edit Profile",
      icon: User,
      description: "Manage your personal information and profile picture",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20"
    },
    {
      id: "accounts",
      title: "Accounts",
      icon: CreditCard,
      description: "Manage your account settings and security",
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    {
      id: "privacy",
      title: "Privacy",
      icon: Shield,
      description: "Control your privacy and security settings",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20"
    },
    {
      id: "chats",
      title: "Chats",
      icon: MessageSquare,
      description: "Customize your chat experience",
      color: "text-orange-500",
      bgColor: "bg-orange-500/20"
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Manage your notification preferences",
      color: "text-red-500",
      bgColor: "bg-red-500/20"
    },
    {
      id: "language",
      title: "App Language",
      icon: Languages,
      description: "Change the app language and region",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/20"
    },
    {
      id: "help",
      title: "Help",
      icon: HelpCircle,
      description: "Get help and support",
      color: "text-gray-500",
      bgColor: "bg-gray-500/20"
    }
  ]

  const handleSectionClick = (sectionId: string) => {
    switch (sectionId) {
      case "profile":
        setShowProfileEditor(true)
        break
      case "accounts":
        setShowAccountSettings(true)
        break
      case "privacy":
        setShowPrivacySettings(true)
        break
      case "notifications":
        setShowNotificationSettings(true)
        break
      case "chats":
        setShowChatSettings(true)
        break
      case "language":
        setShowLanguageSettings(true)
        break
      case "help":
        setShowHelpSettings(true)
        break
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-pattern">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Settings Grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Information - Moved to top */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userProfile?.photoURL} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{userProfile?.displayName || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                      <Badge variant="secondary" className="mt-1">Active</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">User ID</Label>
                      <p className="text-sm text-muted-foreground font-mono">{user?.uid}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Type</Label>
                      <p className="text-sm text-muted-foreground">Free Account</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.metadata?.creationTime ? 
                          new Date(user.metadata.creationTime).toLocaleDateString() : 
                          "Unknown"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Sign In</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.metadata?.lastSignInTime ? 
                          new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                          "Unknown"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsSections.map((section) => (
                  <Card 
                    key={section.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full ${section.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <section.icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{section.title}</h3>
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Connected Devices
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoading ? "Logging out..." : "Logout"}
                  </Button>
                </CardContent>
              </Card>

              {/* App Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Nex Chat v1.0.0</p>
                  <p>Modern messaging for everyone</p>
                  <Separator className="my-2" />
                  <p>Built with Next.js & Firebase</p>
                  <p>Real-time messaging</p>
                  <p>File sharing</p>
                  <p>Group chats</p>
                  <p>End-to-end encryption</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showProfileEditor && (
          <ProfileEditor
            user={user}
            userProfile={userProfile}
            onClose={() => setShowProfileEditor(false)}
            onUpdate={handleProfileUpdate}
          />
        )}

        {showAccountSettings && (
          <AccountSettings
            onClose={() => setShowAccountSettings(false)}
          />
        )}

        {showPrivacySettings && (
          <PrivacySettings
            onClose={() => setShowPrivacySettings(false)}
            onUpdate={handlePrivacyUpdate}
            currentSettings={{
              showOnlineStatus: true,
              showLastSeen: true,
              allowReadReceipts: true,
              allowProfileView: true,
              allowMessageRequests: true,
            }}
          />
        )}

        {showNotificationSettings && (
          <NotificationSettings
            onClose={() => setShowNotificationSettings(false)}
            onUpdate={handleNotificationUpdate}
            currentSettings={{
              enabled: notifications,
              messageNotifications: true,
              callNotifications: true,
              groupNotifications: true,
              soundEnabled: true,
              soundVolume: 50,
            }}
          />
        )}

        {showChatSettings && (
          <ChatSettings
            onClose={() => setShowChatSettings(false)}
          />
        )}

        {showLanguageSettings && (
          <LanguageSettings
            onClose={() => setShowLanguageSettings(false)}
            onUpdate={(settings) => {
              toast.success("Language settings updated successfully")
              setShowLanguageSettings(false)
            }}
          />
        )}

        {showHelpSettings && (
          <HelpSettings
            onClose={() => setShowHelpSettings(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
} 