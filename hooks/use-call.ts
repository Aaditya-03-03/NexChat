import { useState, useEffect, useCallback } from 'react'
import { callService, CallState } from '@/lib/call-service'
import { toast } from 'sonner'

export function useCall() {
  const [callState, setCallState] = useState<CallState>(callService.getCallState())
  const [isCallInterfaceOpen, setIsCallInterfaceOpen] = useState(false)
  const [incomingCall, setIncomingCall] = useState<{
    from: string
    type: 'audio' | 'video'
    userName?: string
    userPhoto?: string
  } | null>(null)

  useEffect(() => {
    console.log('=== USE_CALL HOOK INITIALIZED ===')
    
    const handleCallStateChanged = (state: CallState) => {
      console.log('Call state changed:', state)
      setCallState(state)
    }

    const handleIncomingCall = (data: { from: string; type: 'audio' | 'video' }) => {
      console.log('=== INCOMING CALL RECEIVED IN HOOK ===')
      console.log('Call data:', data)
      
      setIncomingCall(data)
      setIsCallInterfaceOpen(true)
      
      // Show notification with longer duration
      toast.info(`Incoming ${data.type} call from ${data.from}`, {
        action: {
          label: 'Answer',
          onClick: () => {
            console.log('Answer button clicked')
            handleAcceptCall()
          }
        },
        cancel: {
          label: 'Decline',
          onClick: () => {
            console.log('Decline button clicked')
            handleRejectCall()
          }
        },
        duration: 30000, // 30 seconds
        important: true
      })
      
      // Also show a regular toast for immediate feedback
      toast.info(`Incoming ${data.type} call!`, {
        duration: 5000
      })
    }

    const handleCallAccepted = () => {
      console.log('Call accepted')
      toast.success('Call connected!')
    }

    const handleCallRejected = () => {
      console.log('Call rejected')
      toast.error('Call was rejected')
      setIsCallInterfaceOpen(false)
      setIncomingCall(null)
    }

    const handleCallEnded = () => {
      console.log('Call ended')
      toast.info('Call ended')
      setIsCallInterfaceOpen(false)
      setIncomingCall(null)
    }

    const handleCallError = (error: any) => {
      console.error('Call error:', error)
      toast.error('Call failed: ' + (error.message || error))
      setIsCallInterfaceOpen(false)
      setIncomingCall(null)
    }

    // Subscribe to call service events
    console.log('Subscribing to call service events')
    callService.on('call-state-changed', handleCallStateChanged)
    callService.on('incoming-call', handleIncomingCall)
    callService.on('call-accepted', handleCallAccepted)
    callService.on('call-rejected', handleCallRejected)
    callService.on('call-ended', handleCallEnded)
    callService.on('call-error', handleCallError)

    return () => {
      console.log('Cleaning up call service event listeners')
      callService.off('call-state-changed', handleCallStateChanged)
      callService.off('incoming-call', handleIncomingCall)
      callService.off('call-accepted', handleCallAccepted)
      callService.off('call-rejected', handleCallRejected)
      callService.off('call-ended', handleCallEnded)
      callService.off('call-error', handleCallError)
    }
  }, [])

  const initiateCall = useCallback(async (userId: string, type: 'audio' | 'video', userName?: string, userPhoto?: string) => {
    console.log('=== INITIATING CALL ===')
    console.log('Target user ID:', userId)
    console.log('Call type:', type)
    console.log('User name:', userName)
    
    try {
      const success = await callService.initiateCall(userId, type)
      if (success) {
        setIsCallInterfaceOpen(true)
        setIncomingCall({
          from: userId,
          type,
          userName,
          userPhoto
        })
        toast.info(`Calling ${userName || 'user'}...`)
      } else {
        toast.error('Failed to initiate call')
      }
      return success
    } catch (error) {
      console.error('Call initiation error:', error)
      toast.error('Failed to initiate call')
      return false
    }
  }, [])

  const handleAcceptCall = useCallback(async () => {
    console.log('=== HANDLING ACCEPT CALL ===')
    console.log('Incoming call data:', incomingCall)
    
    if (!incomingCall) {
      console.log('No incoming call to accept')
      return false
    }
    
    try {
      const success = await callService.acceptCall()
      if (!success) {
        toast.error('Failed to accept call')
        setIsCallInterfaceOpen(false)
        setIncomingCall(null)
      } else {
        console.log('Call accepted successfully')
      }
      return success
    } catch (error) {
      console.error('Accept call error:', error)
      toast.error('Failed to accept call')
      setIsCallInterfaceOpen(false)
      setIncomingCall(null)
      return false
    }
  }, [incomingCall])

  const handleRejectCall = useCallback(() => {
    console.log('=== HANDLING REJECT CALL ===')
    callService.rejectCall()
    setIsCallInterfaceOpen(false)
    setIncomingCall(null)
  }, [])

  const handleEndCall = useCallback(() => {
    console.log('=== HANDLING END CALL ===')
    callService.endCall()
    setIsCallInterfaceOpen(false)
    setIncomingCall(null)
  }, [])

  const closeCallInterface = useCallback(() => {
    console.log('=== CLOSING CALL INTERFACE ===')
    setIsCallInterfaceOpen(false)
    setIncomingCall(null)
  }, [])

  return {
    callState,
    isCallInterfaceOpen,
    incomingCall,
    initiateCall,
    handleAcceptCall,
    handleRejectCall,
    handleEndCall,
    closeCallInterface
  }
} 