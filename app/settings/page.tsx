"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Shield, Bell, Palette, LogOut, Camera, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { ProfileEditor } from "@/components/profile-editor"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const { user, userProfile, logout } = useAuthContext()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)

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
    // This would update the auth context
    toast.success("Profile updated successfully")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-pattern">
        <div className="max-w-4xl mx-auto p-4">
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
            {/* Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Profile</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userProfile?.photoURL} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{userProfile?.displayName || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={userProfile?.displayName || ""}
                      className="glass-input mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile?.email || ""}
                      className="glass-input mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="uid">User ID</Label>
                    <Input
                      id="uid"
                      value={user?.uid || ""}
                      className="glass-input mt-1"
                      readOnly
                    />
                  </div>

                  <Button 
                    onClick={() => setShowProfileEditor(true)}
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sound Alerts</p>
                      <p className="text-sm text-muted-foreground">Play sound for new messages</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Message Previews</p>
                      <p className="text-sm text-muted-foreground">Show message content in notifications</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-purple-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Appearance</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Privacy & Security</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Read Receipts</p>
                      <p className="text-sm text-muted-foreground">Show when messages are read</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Online Status</p>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start glass-button"
                    onClick={() => setShowProfileEditor(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start glass-button">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy & Security
                  </Button>
                  <Button variant="outline" className="w-full justify-start glass-button">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start glass-button">
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </Button>
                </div>
              </div>

              {/* Account */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Account</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start glass-button text-destructive hover:text-destructive"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoading ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>

              {/* App Info */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">About</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Nex Chat v1.0.0</p>
                  <p>Modern messaging for everyone</p>
                  <Separator className="my-2" />
                  <p>Built with Next.js & Firebase</p>
                  <p>Real-time messaging</p>
                  <p>File sharing</p>
                  <p>Group chats</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Editor Modal */}
        {showProfileEditor && (
          <ProfileEditor
            user={user}
            userProfile={userProfile}
            onClose={() => setShowProfileEditor(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
