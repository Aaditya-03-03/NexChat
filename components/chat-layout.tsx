"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MessageSquare, Settings, LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/components/auth-provider"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface ChatLayoutProps {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter()
  const { user, userProfile, logout } = useAuthContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const result = await logout()
    
    if (result.success) {
      toast.success("Logged out successfully")
      router.push("/")
    } else {
      toast.error(result.error || "Failed to logout")
    }
    
    setIsLoggingOut(false)
    setShowLogoutConfirm(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 left-0 right-0 z-50 flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 backdrop-blur-md bg-background/80 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold">Nex Chat</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 sm:h-10 px-2 sm:px-3 rounded-xl hover:bg-primary/10">
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 mr-2">
                  <AvatarImage src={userProfile?.photoURL} alt={userProfile?.displayName} />
                  <AvatarFallback className="text-xs">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium truncate max-w-24">
                  {userProfile?.displayName || user?.email?.split('@')[0] || "User"}
                </span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-card">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userProfile?.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile & Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowLogoutConfirm(true)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex">{children}</div>
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your chats.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
