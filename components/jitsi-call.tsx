"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

// Declare Jitsi API types
declare global {
    interface Window {
        JitsiMeetExternalAPI: any
    }
}

interface JitsiCallProps {
    isOpen: boolean
    onClose: () => void
    roomName: string
    callType: 'audio' | 'video'
    userName: string
    userEmail?: string
    otherUserName?: string
}

export function JitsiCall({
    isOpen,
    onClose,
    roomName,
    callType,
    userName,
    userEmail,
    otherUserName,
}: JitsiCallProps) {
    const jitsiContainerRef = useRef<HTMLDivElement>(null)
    const apiRef = useRef<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [scriptLoaded, setScriptLoaded] = useState(false)

    // Load Jitsi External API script
    useEffect(() => {
        if (typeof window === 'undefined') return

        // Check if script is already loaded
        if (window.JitsiMeetExternalAPI) {
            setScriptLoaded(true)
            return
        }

        // Check if script element already exists
        const existingScript = document.getElementById('jitsi-api-script')
        if (existingScript) {
            existingScript.addEventListener('load', () => setScriptLoaded(true))
            return
        }

        // Load the Jitsi Meet External API script
        const script = document.createElement('script')
        script.id = 'jitsi-api-script'
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = () => {
            console.log('Jitsi API script loaded')
            setScriptLoaded(true)
        }
        script.onerror = () => {
            console.error('Failed to load Jitsi API script')
            toast.error('Failed to load video call service')
            setScriptLoaded(false)
        }
        document.body.appendChild(script)

        return () => {
            // Don't remove script on unmount as it can be reused
        }
    }, [])

    // Initialize Jitsi when modal opens and script is loaded
    useEffect(() => {
        if (!isOpen || !scriptLoaded || !jitsiContainerRef.current) return

        const initializeJitsi = () => {
            try {
                console.log('Initializing Jitsi with room:', roomName)

                const domain = 'meet.jit.si'
                const options = {
                    roomName: roomName,
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: callType === 'audio', // Mute video for audio-only calls
                        prejoinPageEnabled: false, // Skip the lobby page
                        disableDeepLinking: true,
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: [
                            'microphone',
                            'camera',
                            'hangup',
                            'chat',
                            'desktop',
                            'fullscreen',
                            'settings',
                            'tileview',
                        ],
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_POWERED_BY: false,
                        DEFAULT_REMOTE_DISPLAY_NAME: otherUserName || 'Guest',
                    },
                    userInfo: {
                        displayName: userName,
                        email: userEmail,
                    },
                }

                // Create Jitsi API instance
                const api = new window.JitsiMeetExternalAPI(domain, options)
                apiRef.current = api

                // Event listeners
                api.addEventListener('videoConferenceJoined', () => {
                    console.log('Joined video conference')
                    setIsLoading(false)
                    toast.success('Call connected!')
                })

                api.addEventListener('readyToClose', () => {
                    console.log('Jitsi ready to close')
                    handleCleanup()
                    onClose()
                })

                api.addEventListener('videoConferenceLeft', () => {
                    console.log('Left video conference')
                    handleCleanup()
                    onClose()
                })

                api.addEventListener('errorOccurred', (error: any) => {
                    console.error('Jitsi error:', error)
                    toast.error('Call error occurred')
                })

            } catch (error) {
                console.error('Error initializing Jitsi:', error)
                toast.error('Failed to initialize call')
                setIsLoading(false)
            }
        }

        // Small delay to ensure DOM is ready
        const timer = setTimeout(initializeJitsi, 100)

        return () => {
            clearTimeout(timer)
            handleCleanup()
        }
    }, [isOpen, scriptLoaded, roomName, callType, userName, userEmail, otherUserName, onClose])

    const handleCleanup = () => {
        if (apiRef.current) {
            try {
                apiRef.current.dispose()
                apiRef.current = null
            } catch (error) {
                console.error('Error disposing Jitsi API:', error)
            }
        }
        setIsLoading(true)
    }

    const handleClose = () => {
        handleCleanup()
        onClose()
    }

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-black border-0">
                <DialogTitle className="sr-only">
                    {callType === 'video' ? 'Video Call' : 'Audio Call'} with {otherUserName || 'User'}
                </DialogTitle>

                <div className="relative w-full h-full">
                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                            <div className="text-center">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                                <p className="text-white text-lg">Connecting to call...</p>
                                <p className="text-white/60 text-sm mt-2">
                                    {callType === 'video' ? 'Please grant camera and microphone permissions' : 'Please grant microphone permission'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Jitsi container */}
                    <div
                        ref={jitsiContainerRef}
                        className="w-full h-full"
                        style={{ minHeight: '500px' }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
