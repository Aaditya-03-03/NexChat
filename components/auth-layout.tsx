import type { ReactNode } from "react"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-4 backdrop-blur-md bg-background/80 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">InstaTalk</span>
        </Link>
        <ModeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="relative w-full max-w-md mx-auto">
          {/* Decorative elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />

          {/* Auth card */}
          <div className="glass-card p-8 z-10 relative animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  )
}
