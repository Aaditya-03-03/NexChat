import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-4 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">InstaTalk</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-xl">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero section */}
        <section className="relative py-20 md:py-32 px-4">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">Modern Messaging for Everyone</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
              InstaTalk brings a fresh, futuristic approach to messaging with a beautiful glassmorphism UI and powerful
              features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass-button rounded-xl px-8">
                <Link href="/dashboard">Try Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 px-4 bg-muted/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-6 animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Messaging</h3>
                <p className="text-muted-foreground">
                  Send and receive messages instantly with read receipts and typing indicators.
                </p>
              </div>
              <div className="glass-card p-6 animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Group Chats</h3>
                <p className="text-muted-foreground">
                  Create and manage group conversations with friends, family, or colleagues.
                </p>
              </div>
              <div className="glass-card p-6 animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                <p className="text-muted-foreground">
                  Control who sees your information with customizable privacy settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto glass-card p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of users already enjoying InstaTalk's modern messaging experience.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 px-4 backdrop-blur-md bg-background/80">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">InstaTalk</span>
          </div>
          <div className="flex gap-6">
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
