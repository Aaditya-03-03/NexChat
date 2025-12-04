"use client"

import { Phone, PhoneOff, Video } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface IncomingCallNotificationProps {
    callerName: string
    callerPhoto?: string
    callType: 'audio' | 'video'
    onAccept: () => void
    onReject: () => void
}

export function IncomingCallNotification({
    callerName,
    callerPhoto,
    callType,
    onAccept,
    onReject
}: IncomingCallNotificationProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-background/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center min-w-[320px] max-w-sm border border-border/20">
                {/* Avatar with pulse animation */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <Avatar className="h-24 w-24 border-4 border-primary/30 relative">
                        <AvatarImage src={callerPhoto} alt={callerName} />
                        <AvatarFallback className="text-2xl">{callerName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Caller info */}
                <div className="text-center mb-6">
                    <h3 className="font-semibold text-xl mb-1">{callerName}</h3>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        {callType === 'video' ? (
                            <>
                                <Video className="h-4 w-4" />
                                <span>Incoming Video Call</span>
                            </>
                        ) : (
                            <>
                                <Phone className="h-4 w-4" />
                                <span>Incoming Audio Call</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-6">
                    {/* Reject button */}
                    <button
                        onClick={onReject}
                        className="flex flex-col items-center gap-2 group"
                        aria-label="Decline call"
                    >
                        <div className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                            <PhoneOff className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground">Decline</span>
                    </button>

                    {/* Accept button */}
                    <button
                        onClick={onAccept}
                        className="flex flex-col items-center gap-2 group"
                        aria-label="Accept call"
                    >
                        <div className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg animate-pulse">
                            {callType === 'video' ? (
                                <Video className="h-7 w-7 text-white" />
                            ) : (
                                <Phone className="h-7 w-7 text-white" />
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground">Accept</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
