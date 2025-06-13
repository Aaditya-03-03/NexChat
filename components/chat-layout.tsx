import type { ReactNode } from "react"
import Link from "next/link"
import { MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

interface ChatLayoutProps {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-4 backdrop-blur-md bg-background/80 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">InstaTalk</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-4rem)] flex">{children}</div>
      </main>
    </div>
  )
}
