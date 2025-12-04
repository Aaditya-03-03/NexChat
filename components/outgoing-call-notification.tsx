"use client"

import { Phone, Video, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface OutgoingCallNotificationProps {
    calleeName: string
    calleePhoto?: string
    callType: 'audio' | 'video'
    onCancel: () => void
}

export function OutgoingCallNotification({
    calleeName,
    calleePhoto,
    callType,
    onCancel
}: OutgoingCallNotificationProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-background/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center min-w-[320px] max-w-sm border border-border/20">
                {/* Avatar */}
                <Avatar className="h-24 w-24 border-4 border-primary/20 mb-6">
                    <AvatarImage src={calleePhoto} alt={calleeName} />
                    <AvatarFallback className="text-2xl">{calleeName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* Callee info */}
                <div className="text-center mb-6">
                    <h3 className="font-semibold text-xl mb-1">{calleeName}</h3>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        {callType === 'video' ? (
                            <>
                                <Video className="h-4 w-4" />
                                <span>Calling...</span>
                            </>
                        ) : (
                            <>
                                <Phone className="h-4 w-4" />
                                <span>Calling...</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Loading animation */}
                <div className="flex gap-2 mb-6">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>

                {/* Cancel button */}
                <button
                    onClick={onCancel}
                    className="flex flex-col items-center gap-2 group"
                    aria-label="Cancel call"
                >
                    <div className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                        <X className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Cancel</span>
                </button>
            </div>
        </div>
    )
}
