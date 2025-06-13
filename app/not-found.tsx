import Link from "next/link"
import { MessageSquare, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 md:p-4">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />

      <div className="glass-card p-6 md:p-8 text-center max-w-sm md:max-w-md mx-auto z-10 animate-fade-in">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Page Not Found</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">The page you are looking for doesn't exist or has been moved.</p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white animate-pulse-glow h-10 md:h-11">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
