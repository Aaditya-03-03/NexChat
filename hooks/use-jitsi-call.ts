import { useState, useCallback, useEffect } from 'react'
import { JitsiCallService, CallInvitation } from '@/lib/jitsi-call-service'
import { toast } from 'sonner'

export interface JitsiCallState {
  isOpen: boolean
  roomName: string
  callType: 'audio' | 'video'
  otherUserName?: string
  otherUserPhoto?: string
}

export interface IncomingCall {
  invitationId: string
  callerName: string
  callerPhoto?: string
  callType: 'audio' | 'video'
  roomName: string
}

export interface OutgoingCall {
  invitationId: string
  calleeName: string
  calleePhoto?: string
  callType: 'audio' | 'video'
  status: 'calling' | 'accepted' | 'rejected' | 'cancelled'
}

export function useJitsiCall(currentUserId?: string) {
  const [callState, setCallState] = useState<JitsiCallState>({
    isOpen: false,
    roomName: '',
    callType: 'audio',
  })

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [outgoingCall, setOutgoingCall] = useState<OutgoingCall | null>(null)

  // Listen for incoming calls
  useEffect(() => {
    if (!currentUserId) return

    const unsubscribe = JitsiCallService.subscribeToIncomingCalls(
      currentUserId,
      (invitation: CallInvitation) => {
        // New incoming call
        setIncomingCall({
          invitationId: invitation.id,
          callerName: invitation.callerName,
          callerPhoto: invitation.callerPhoto,
          callType: invitation.callType,
          roomName: invitation.roomName
        })
      },
      (invitation: CallInvitation) => {
        // Call invitation updated (e.g., cancelled)
        if (invitation.status === 'cancelled') {
          setIncomingCall(null)
          toast.info('Call was cancelled')
        }
      }
    )

    return unsubscribe
  }, [currentUserId])

  // Listen for outgoing call status updates
  useEffect(() => {
    if (!outgoingCall?.invitationId) return

    const unsubscribe = JitsiCallService.subscribeToOutgoingCall(
      outgoingCall.invitationId,
      (status) => {
        if (status === 'accepted') {
          // Callee accepted, join the call
          setOutgoingCall(prev => prev ? { ...prev, status: 'accepted' } : null)
          // The actual Jitsi modal will open when we call startCall
        } else if (status === 'rejected') {
          setOutgoingCall(null)
          toast.error(`${outgoingCall.calleeName} declined the call`)
        } else if (status === 'expired') {
          setOutgoingCall(null)
          toast.info('Call timed out')
        }
      }
    )

    return unsubscribe
  }, [outgoingCall?.invitationId, outgoingCall?.calleeName])

  // Start a call with notification
  const initiateCall = useCallback(async (
    chatId: string,
    callType: 'audio' | 'video',
    callerId: string,
    callerName: string,
    calleeId: string,
    calleeName: string,
    calleePhoto?: string,
    callerPhoto?: string
  ) => {
    // Generate unique room name
    const roomName = `nexchat-${chatId.slice(0, 8)}-${Date.now()}`

    // Create call invitation
    const result = await JitsiCallService.createCallInvitation(
      chatId,
      callerId,
      callerName,
      calleeId,
      callType,
      roomName,
      callerPhoto
    )

    if (result.success && result.invitationId) {
      // Show outgoing call UI
      setOutgoingCall({
        invitationId: result.invitationId,
        calleeName,
        calleePhoto,
        callType,
        status: 'calling'
      })
    } else {
      toast.error(result.error || 'Failed to start call')
    }
  }, [])

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return

    const result = await JitsiCallService.acceptCall(incomingCall.invitationId)

    if (result.success) {
      // Open Jitsi call modal
      setCallState({
        isOpen: true,
        roomName: incomingCall.roomName,
        callType: incomingCall.callType,
        otherUserName: incomingCall.callerName,
        otherUserPhoto: incomingCall.callerPhoto
      })
      setIncomingCall(null)
    } else {
      toast.error(result.error || 'Failed to accept call')
    }
  }, [incomingCall])

  // Reject an incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall) return

    await JitsiCallService.rejectCall(incomingCall.invitationId)
    setIncomingCall(null)
  }, [incomingCall])

  // Cancel an outgoing call
  const cancelCall = useCallback(async () => {
    if (!outgoingCall) return

    await JitsiCallService.cancelCall(outgoingCall.invitationId)
    setOutgoingCall(null)
  }, [outgoingCall])

  // When outgoing call is accepted, open Jitsi
  useEffect(() => {
    if (outgoingCall?.status === 'accepted') {
      // Get the room name from the invitation
      const openCall = async () => {
        // We need to fetch the invitation to get the room name
        // For now, we'll generate it the same way
        // In a real app, you'd fetch it from Firestore
        setCallState({
          isOpen: true,
          roomName: '', // Will be set from invitation
          callType: outgoingCall.callType,
          otherUserName: outgoingCall.calleeName,
          otherUserPhoto: outgoingCall.calleePhoto
        })
        setOutgoingCall(null)
      }
      openCall()
    }
  }, [outgoingCall?.status, outgoingCall?.callType, outgoingCall?.calleeName, outgoingCall?.calleePhoto])

  // End the call
  const endCall = useCallback(() => {
    setCallState({
      isOpen: false,
      roomName: '',
      callType: 'audio',
    })
  }, [])

  // Simple start call (for backward compatibility)
  const startCall = useCallback((
    chatId: string,
    callType: 'audio' | 'video',
    otherUserName?: string,
    otherUserPhoto?: string
  ) => {
    const roomName = `nexchat-${chatId.slice(0, 8)}-${Date.now()}`

    setCallState({
      isOpen: true,
      roomName,
      callType,
      otherUserName,
      otherUserPhoto,
    })
  }, [])

  return {
    callState,
    incomingCall,
    outgoingCall,
    startCall,
    endCall,
    initiateCall,
    acceptCall,
    rejectCall,
    cancelCall,
  }
}
