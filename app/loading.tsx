import { MessageSquare } from "lucide-react"

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />

      <div className="glass-card p-6 md:p-8 text-center max-w-sm md:max-w-md mx-auto z-10 animate-fade-in">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Loading...</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Please wait while we prepare your experience.</p>
        <div className="flex justify-center">
          <div className="h-2 w-32 md:w-48 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
} 