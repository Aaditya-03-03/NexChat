import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 left-0 right-0 z-50 flex h-14 md:h-16 items-center justify-between px-3 md:px-4 backdrop-blur-md bg-background/80 border-b border-border/40 mobile-safe-area">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary">
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold">Nex Chat</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 md:h-10 rounded-xl text-xs md:text-sm">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-8 md:h-10 text-xs md:text-sm">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* Hero section */}
        <section className="relative py-12 md:py-20 lg:py-32 px-3 md:px-4">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">Modern Messaging for Everyone</h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto animate-fade-in px-2">
              Nex Chat brings a fresh, futuristic approach to messaging with a beautiful glassmorphism UI and powerful
              features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in px-2">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 md:px-8 h-11 md:h-12">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass-button rounded-xl px-6 md:px-8 h-11 md:h-12">
                <Link href="/dashboard">Try Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-12 md:py-16 px-3 md:px-4 bg-muted/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="glass-card p-4 md:p-6 animate-fade-in">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 md:mb-4">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Real-time Messaging</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Send and receive messages instantly with read receipts and typing indicators.
                </p>
              </div>
              <div className="glass-card p-4 md:p-6 animate-fade-in">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Group Chats</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Create and manage group conversations with friends, family, or colleagues.
                </p>
              </div>
              <div className="glass-card p-4 md:p-6 animate-fade-in">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Privacy First</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Control who sees your information with customizable privacy settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-12 md:py-16 px-3 md:px-4">
          <div className="max-w-3xl mx-auto glass-card p-6 md:p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to get started?</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              Join thousands of users already enjoying Nex Chat's modern messaging experience.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 md:px-8 h-11 md:h-12">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-4 md:py-6 px-3 md:px-4 backdrop-blur-md bg-background/80">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold">Nex Chat</span>
          </div>
          <div className="flex gap-4 md:gap-6 text-sm md:text-base">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
