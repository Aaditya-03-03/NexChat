import SimplePeer from 'simple-peer'
import { io, Socket } from 'socket.io-client'

export interface CallState {
  isInCall: boolean
  isIncomingCall: boolean
  isOutgoingCall: boolean
  callType: 'audio' | 'video' | null
  remoteUserId: string | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peer: SimplePeer.Instance | null
  socket: Socket | null
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate'
  data: any
  from: string
  to: string
}

class CallService {
  private state: CallState = {
    isInCall: false,
    isIncomingCall: false,
    isOutgoingCall: false,
    callType: null,
    remoteUserId: null,
    localStream: null,
    remoteStream: null,
    peer: null,
    socket: null
  }

  private listeners: Map<string, Function[]> = new Map()
  private currentUserId: string | null = null

  constructor() {
    this.initializeSocket()
  }

  private initializeSocket() {
    // Connect to your socket server
    this.state.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
    
    this.state.socket.on('connect', () => {
      console.log('Connected to call server')
    })

    this.state.socket.on('incoming-call', (data: { from: string; type: 'audio' | 'video'; to?: string }) => {
      // Only handle if the current user is the recipient
      if (data.to && data.to !== this.currentUserId) {
        console.log(`Ignoring incoming call intended for ${data.to}, as current user is ${this.currentUserId}`)
        return
      }
      console.log('Incoming call received from server:', data)
      this.handleIncomingCall(data.from, data.type)
    })

    this.state.socket.on('call-accepted', (data: { from: string }) => {
      this.handleCallAccepted(data.from)
    })

    this.state.socket.on('call-rejected', (data: { from: string }) => {
      this.handleCallRejected(data.from)
    })

    this.state.socket.on('call-ended', (data: { from: string }) => {
      this.handleCallEnded(data.from)
    })

    this.state.socket.on('signal', (signal: CallSignal) => {
      this.handleSignal(signal)
    })
  }

  private emit(event: string, data?: any) {
    this.state.socket?.emit(event, data)
  }

  private notifyListeners(event: string, data?: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data))
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  public async initiateCall(userId: string, type: 'audio' | 'video'): Promise<boolean> {
    try {
      console.log('Initiating call to:', userId, 'type:', type)
      
      // Get user media
      const constraints = {
        audio: true,
        video: type === 'video'
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      this.state.localStream = stream
      this.state.isOutgoingCall = true
      this.state.callType = type
      this.state.remoteUserId = userId

      // Create peer connection
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream
      })

      this.state.peer = peer

      peer.on('signal', (data) => {
        this.emit('signal', {
          type: 'offer',
          data,
          from: this.currentUserId,
          to: userId
        })
      })

      peer.on('stream', (remoteStream) => {
        this.state.remoteStream = remoteStream
        this.notifyListeners('remote-stream', remoteStream)
      })

      // Send call request
      this.emit('call-request', { to: userId, type })

      this.notifyListeners('call-state-changed', this.state)
      return true
    } catch (error) {
      console.error('Failed to initiate call:', error)
      this.notifyListeners('call-error', error)
      return false
    }
  }

  public async acceptCall(): Promise<boolean> {
    try {
      if (!this.state.isIncomingCall || !this.state.remoteUserId) {
        console.log('Cannot accept call - no incoming call or remote user')
        return false
      }

      console.log('Accepting call from:', this.state.remoteUserId)

      const constraints = {
        audio: true,
        video: this.state.callType === 'video'
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      this.state.localStream = stream
      this.state.isIncomingCall = false
      this.state.isInCall = true

      // Create peer connection
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream
      })

      this.state.peer = peer

      peer.on('signal', (data) => {
        this.emit('signal', {
          type: 'answer',
          data,
          from: this.currentUserId,
          to: this.state.remoteUserId
        })
      })

      peer.on('stream', (remoteStream) => {
        this.state.remoteStream = remoteStream
        this.notifyListeners('remote-stream', remoteStream)
      })

      // Accept the call
      this.emit('call-accept', { to: this.state.remoteUserId })

      this.notifyListeners('call-state-changed', this.state)
      return true
    } catch (error) {
      console.error('Failed to accept call:', error)
      this.notifyListeners('call-error', error)
      return false
    }
  }

  public rejectCall(): void {
    if (this.state.isIncomingCall && this.state.remoteUserId) {
      console.log('Rejecting call from:', this.state.remoteUserId)
      this.emit('call-reject', { to: this.state.remoteUserId })
      this.resetCallState()
    }
  }

  public endCall(): void {
    if (this.state.peer) {
      this.state.peer.destroy()
    }
    
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop())
    }

    if (this.state.remoteUserId) {
      console.log('Ending call with:', this.state.remoteUserId)
      this.emit('call-end', { to: this.state.remoteUserId })
    }

    this.resetCallState()
  }

  private handleIncomingCall(from: string, type: 'audio' | 'video'): void {
    console.log('Incoming call received:', from, type)
    this.state.isIncomingCall = true
    this.state.callType = type
    this.state.remoteUserId = from
    
    this.notifyListeners('incoming-call', { from, type })
    this.notifyListeners('call-state-changed', this.state)
  }

  private handleCallAccepted(from: string): void {
    console.log('Call accepted by:', from)
    this.state.isOutgoingCall = false
    this.state.isInCall = true
    
    this.notifyListeners('call-accepted', { from })
    this.notifyListeners('call-state-changed', this.state)
  }

  private handleCallRejected(from: string): void {
    console.log('Call rejected by:', from)
    this.resetCallState()
    this.notifyListeners('call-rejected', { from })
  }

  private handleCallEnded(from: string): void {
    console.log('Call ended by:', from)
    this.resetCallState()
    this.notifyListeners('call-ended', { from })
  }

  private handleSignal(signal: CallSignal): void {
    console.log('Received signal:', signal.type, 'from:', signal.from)
    if (this.state.peer) {
      this.state.peer.signal(signal.data)
    }
  }

  private resetCallState(): void {
    this.state = {
      isInCall: false,
      isIncomingCall: false,
      isOutgoingCall: false,
      callType: null,
      remoteUserId: null,
      localStream: null,
      remoteStream: null,
      peer: null,
      socket: this.state.socket
    }
    
    this.notifyListeners('call-state-changed', this.state)
  }

  public getCallState(): CallState {
    return { ...this.state }
  }

  public getSocket(): Socket | null {
    return this.state.socket
  }

  public toggleMute(): boolean {
    if (this.state.localStream) {
      const audioTrack = this.state.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.notifyListeners('mute-toggled', !audioTrack.enabled)
        return !audioTrack.enabled
      }
    }
    return false
  }

  public toggleVideo(): boolean {
    if (this.state.localStream) {
      const videoTrack = this.state.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        this.notifyListeners('video-toggled', !videoTrack.enabled)
        return !videoTrack.enabled
      }
    }
    return false
  }

  public disconnect(): void {
    if (this.state.socket) {
      this.state.socket.disconnect()
    }
    this.resetCallState()
    this.listeners.clear()
  }

  public registerUser(userId: string) {
    this.currentUserId = userId
    if (this.state.socket) {
      this.state.socket.emit('register', userId)
      console.log('User registered for calls:', userId)
    }
  }
}

// Export singleton instance
export const callService = new CallService() 