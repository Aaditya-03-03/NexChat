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
      <header className="sticky top-0 left-0 right-0 z-50 flex h-14 md:h-16 items-center justify-between px-3 md:px-4 backdrop-blur-md bg-background/80 border-b border-border/40 mobile-safe-area">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary">
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold">Nex Chat</span>
        </Link>
        <ModeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center p-3 md:p-4 mobile-safe-area">
        <div className="relative w-full max-w-sm md:max-w-md mx-auto">
          {/* Decorative elements */}
          <div className="absolute -top-16 -left-16 md:-top-20 md:-left-20 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
          <div className="absolute -bottom-16 -right-16 md:-bottom-20 md:-right-20 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />

          {/* Auth card */}
          <div className="glass-card p-4 md:p-8 z-10 relative animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  )
}
