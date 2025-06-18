"use client"

import { useState } from "react"
import { 
  Palette, 
  Type, 
  Download, 
  History, 
  X, 
  Check,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Archive,
  Clock,
  FileText,
  Settings,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuthContext } from "@/components/auth-provider"
import { ChatService } from "@/lib/chat-service"
import { toast } from "sonner"

interface ChatSettingsProps {
  onClose: () => void
}

interface ChatHistoryItem {
  id: string
  chatName: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

export function ChatSettings({ onClose }: ChatSettingsProps) {
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  
  // Theme settings
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  
  // Font size settings
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")
  
  // Chat settings
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [keepHistory, setKeepHistory] = useState(true)
  const [historyRetention, setHistoryRetention] = useState<"30days" | "90days" | "1year" | "forever">("90days")
  
  // Mock chat history data
  const [chatHistory] = useState<ChatHistoryItem[]>([
    {
      id: "1",
      chatName: "John Doe",
      lastMessage: "Hey, how are you doing?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messageCount: 45
    },
    {
      id: "2",
      chatName: "Work Team",
      lastMessage: "Meeting at 3 PM today",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messageCount: 128
    },
    {
      id: "3",
      chatName: "Family Group",
      lastMessage: "Dinner plans for this weekend",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      messageCount: 67
    }
  ])

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    // Apply theme to the app
    if (newTheme === "system") {
      // Remove any existing theme classes and let system decide
      document.documentElement.classList.remove("light", "dark")
    } else {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(newTheme)
    }
    toast.success(`Theme changed to ${newTheme}`)
  }

  const handleFontSizeChange = (newSize: "small" | "medium" | "large") => {
    setFontSize(newSize)
    // Apply font size to the app
    const root = document.documentElement
    root.style.fontSize = newSize === "small" ? "14px" : newSize === "medium" ? "16px" : "18px"
    toast.success(`Font size changed to ${newSize}`)
  }

  const handleBackupFrequencyChange = (frequency: "daily" | "weekly" | "monthly") => {
    setBackupFrequency(frequency)
    toast.success(`Backup frequency set to ${frequency}`)
  }

  const handleHistoryRetentionChange = (retention: "30days" | "90days" | "1year" | "forever") => {
    setHistoryRetention(retention)
    toast.success(`History retention set to ${retention}`)
  }

  const handleManualBackup = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    
    try {
      // Simulate backup process
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Here you would typically call a backup service
      // const result = await ChatService.backupChats(user?.uid)
      
      toast.success("Chat backup completed successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to backup chats")
    } finally {
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  const handleRestoreBackup = async () => {
    setIsLoading(true)
    try {
      // Here you would typically call a restore service
      // const result = await ChatService.restoreChats(user?.uid)
      
      toast.success("Chat backup restored successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to restore backup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = async () => {
    setIsLoading(true)
    try {
      // Here you would typically call a service to clear chat history
      // const result = await ChatService.clearChatHistory(user?.uid)
      
      toast.success("Chat history cleared successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to clear chat history")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportHistory = async () => {
    setIsLoading(true)
    try {
      // Here you would typically call a service to export chat history
      // const result = await ChatService.exportChatHistory(user?.uid)
      
      // Simulate file download
      const blob = new Blob(["Chat history export data"], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Chat history exported successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to export chat history")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}m ago`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h2 className="text-lg font-semibold">Chat Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>
                Choose your preferred theme for the chat interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Font Size Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Font Size
              </CardTitle>
              <CardDescription>
                Adjust the text size for better readability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={fontSize} onValueChange={(value) => handleFontSizeChange(value as "small" | "medium" | "large")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="cursor-pointer">
                    <span className="text-sm">Small (14px)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer">
                    <span className="text-base">Medium (16px)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="cursor-pointer">
                    <span className="text-lg">Large (18px)</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Chat Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Chat Backup
              </CardTitle>
              <CardDescription>
                Manage automatic and manual chat backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup your chats</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              {autoBackup && (
                <div>
                  <Label className="text-sm font-medium">Backup Frequency</Label>
                  <RadioGroup value={backupFrequency} onValueChange={(value) => handleBackupFrequencyChange(value as "daily" | "weekly" | "monthly")} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="cursor-pointer">Daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Button 
                  onClick={handleManualBackup} 
                  disabled={isBackingUp}
                  className="w-full"
                >
                  {isBackingUp ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Backing up...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Manual Backup
                    </>
                  )}
                </Button>

                {isBackingUp && (
                  <div className="space-y-2">
                    <Progress value={backupProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      {backupProgress}% complete
                    </p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={handleRestoreBackup}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {isLoading ? "Restoring..." : "Restore from Backup"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat History Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Chat History
              </CardTitle>
              <CardDescription>
                Manage your chat history and retention settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Keep Chat History</Label>
                  <p className="text-sm text-muted-foreground">Store your chat messages</p>
                </div>
                <Switch checked={keepHistory} onCheckedChange={setKeepHistory} />
              </div>

              {keepHistory && (
                <div>
                  <Label className="text-sm font-medium">History Retention</Label>
                  <RadioGroup value={historyRetention} onValueChange={(value) => handleHistoryRetentionChange(value as "30days" | "90days" | "1year" | "forever")} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30days" id="30days" />
                      <Label htmlFor="30days" className="cursor-pointer">30 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="90days" id="90days" />
                      <Label htmlFor="90days" className="cursor-pointer">90 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1year" id="1year" />
                      <Label htmlFor="1year" className="cursor-pointer">1 year</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="forever" id="forever" />
                      <Label htmlFor="forever" className="cursor-pointer">Forever</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportHistory}
                  disabled={isLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? "Exporting..." : "Export Chat History"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive hover:text-destructive"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your chat messages. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearHistory}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Recent Chat History Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Chats
              </CardTitle>
              <CardDescription>
                Preview of your recent chat history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{chat.chatName}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {chat.messageCount} messages
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      {formatTimeAgo(chat.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
} 