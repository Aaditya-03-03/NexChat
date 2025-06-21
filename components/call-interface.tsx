"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Phone, Video, Mic, MicOff, VideoOff, X, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { callService, CallState } from '@/lib/call-service'
import { toast } from 'sonner'

interface CallInterfaceProps {
  isOpen: boolean
  onClose: () => void
  remoteUserId: string
  remoteUserName?: string
  remoteUserPhoto?: string
  callType: 'audio' | 'video'
  isIncoming?: boolean
}

export function CallInterface({
  isOpen,
  onClose,
  remoteUserId,
  remoteUserName = 'Unknown',
  remoteUserPhoto,
  callType,
  isIncoming = false
}: CallInterfaceProps) {
  const [callState, setCallState] = useState<CallState>(callService.getCallState())
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleCallStateChanged = (state: CallState) => {
      setCallState(state)
    }

    const handleRemoteStream = (stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    }

    const handleCallError = (error: any) => {
      toast.error('Call failed: ' + error.message)
      onClose()
    }

    const handleCallAccepted = () => {
      setIsConnecting(false)
      toast.success('Call connected!')
    }

    const handleCallRejected = () => {
      setIsConnecting(false)
      toast.error('Call was rejected')
      onClose()
    }

    const handleCallEnded = () => {
      setIsConnecting(false)
      toast.info('Call ended')
      onClose()
    }

    const handleMuteToggled = (muted: boolean) => {
      setIsMuted(muted)
    }

    const handleVideoToggled = (videoOff: boolean) => {
      setIsVideoOff(videoOff)
    }

    // Subscribe to call service events
    callService.on('call-state-changed', handleCallStateChanged)
    callService.on('remote-stream', handleRemoteStream)
    callService.on('call-error', handleCallError)
    callService.on('call-accepted', handleCallAccepted)
    callService.on('call-rejected', handleCallRejected)
    callService.on('call-ended', handleCallEnded)
    callService.on('mute-toggled', handleMuteToggled)
    callService.on('video-toggled', handleVideoToggled)

    // Set up local video stream
    if (callState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream
    }

    return () => {
      callService.off('call-state-changed', handleCallStateChanged)
      callService.off('remote-stream', handleRemoteStream)
      callService.off('call-error', handleCallError)
      callService.off('call-accepted', handleCallAccepted)
      callService.off('call-rejected', handleCallRejected)
      callService.off('call-ended', handleCallEnded)
      callService.off('mute-toggled', handleMuteToggled)
      callService.off('video-toggled', handleVideoToggled)
    }
  }, [callState.localStream, onClose])

  const handleAcceptCall = async () => {
    setIsConnecting(true)
    const success = await callService.acceptCall()
    if (!success) {
      setIsConnecting(false)
      toast.error('Failed to accept call')
    }
  }

  const handleRejectCall = () => {
    callService.rejectCall()
    onClose()
  }

  const handleEndCall = () => {
    callService.endCall()
    onClose()
  }

  const handleToggleMute = () => {
    const muted = callService.toggleMute()
    setIsMuted(muted)
  }

  const handleToggleVideo = () => {
    const videoOff = callService.toggleVideo()
    setIsVideoOff(videoOff)
  }

  const isVideoCall = callType === 'video'
  const isInCall = callState.isInCall
  const isOutgoingCall = callState.isOutgoingCall

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[600px] h-[80vh] p-0 bg-black/95 border-0 rounded-lg overflow-hidden">
        <DialogTitle className="sr-only">
          {isIncoming ? 'Incoming Call' : isOutgoingCall ? 'Outgoing Call' : 'Call'} - {remoteUserName}
        </DialogTitle>
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={remoteUserPhoto} alt={remoteUserName} />
                <AvatarFallback>{remoteUserName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-medium">{remoteUserName}</h3>
                <p className="text-white/60 text-sm">
                  {isConnecting ? 'Connecting...' : 
                   isIncoming ? 'Incoming call' :
                   isOutgoingCall ? 'Calling...' :
                   isInCall ? 'Connected' : 'Call'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative bg-gray-900">
            {isVideoCall && (
              <>
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-white/20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            )}

            {/* Audio Call Interface */}
            {!isVideoCall && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={remoteUserPhoto} alt={remoteUserName} />
                    <AvatarFallback className="text-2xl">{remoteUserName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-white text-xl font-medium mb-2">{remoteUserName}</h2>
                  <p className="text-white/60">
                    {isConnecting ? 'Connecting...' : 
                     isIncoming ? 'Incoming call' :
                     isOutgoingCall ? 'Calling...' :
                     isInCall ? 'Connected' : 'Call'}
                  </p>
                </div>
              </div>
            )}

            {/* Connection Status */}
            {isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto mb-2" />
                  <p className="text-white">Connecting...</p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 p-6 bg-black/50 backdrop-blur-sm border-t border-white/10">
            {isIncoming ? (
              <>
                <Button
                  onClick={handleAcceptCall}
                  className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
                  disabled={isConnecting}
                >
                  <Phone className="h-6 w-6" />
                </Button>
                <Button
                  onClick={handleRejectCall}
                  className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
                  disabled={isConnecting}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                {/* Mute Button */}
                <Button
                  onClick={handleToggleMute}
                  variant={isMuted ? "destructive" : "secondary"}
                  className="h-12 w-12 rounded-full"
                  disabled={!isInCall}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                {/* End Call Button */}
                <Button
                  onClick={handleEndCall}
                  className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>

                {/* Video Toggle Button (only for video calls) */}
                {isVideoCall && (
                  <Button
                    onClick={handleToggleVideo}
                    variant={isVideoOff ? "destructive" : "secondary"}
                    className="h-12 w-12 rounded-full"
                    disabled={!isInCall}
                  >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 