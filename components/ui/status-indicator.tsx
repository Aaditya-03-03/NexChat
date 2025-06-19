import { cn } from "@/lib/utils"

export type UserStatus = "online" | "offline" | "away"

interface StatusIndicatorProps {
  status: UserStatus
  className?: string
  showDot?: boolean
  showLabel?: boolean
}

export function StatusIndicator({ 
  status, 
  className,
  showDot = true,
  showLabel = false
}: StatusIndicatorProps) {
  return (
    <div className={cn("status-badge", className)}>
      {showDot && (
        <span 
          className={cn(
            "status-badge-dot",
            status === "online" && "bg-green-500",
            status === "offline" && "bg-red-500",
            status === "away" && "bg-yellow-500"
          )} 
        />
      )}
      {showLabel && (
        <span 
          className={cn(
            "status-badge-text",
            status === "online" && "status-badge-online",
            status === "offline" && "status-badge-offline",
            status === "away" && "status-badge-away"
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
    </div>
  )
}

interface AvatarStatusProps {
  status: UserStatus
  className?: string
}

export function AvatarStatus({ status, className }: AvatarStatusProps) {
  return (
    <span 
      className={cn(
        "status-indicator",
        status === "online" && "status-indicator-online",
        status === "offline" && "status-indicator-offline",
        status === "away" && "status-indicator-away",
        className
      )} 
    />
  )
} 