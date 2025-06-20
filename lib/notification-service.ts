export interface NotificationSettings {
  enabled: boolean
  messageNotifications: boolean
  callNotifications: boolean
  groupNotifications: boolean
  soundEnabled: boolean
  soundVolume: number
}

class NotificationService {
  private audioContext: AudioContext | null = null
  private notificationSound: AudioBuffer | null = null
  private settings: NotificationSettings = {
    enabled: true,
    messageNotifications: true,
    callNotifications: true,
    groupNotifications: true,
    soundEnabled: true,
    soundVolume: 50,
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudio()
      this.loadSettings()
      this.requestPermission() // Request permission on initialization
    }
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a simple notification sound
      const sampleRate = this.audioContext.sampleRate
      const duration = 0.2 // Duration in seconds
      const frequency = 440 // Frequency in Hz
      
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
      const channelData = buffer.getChannelData(0)
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate
        const envelope = Math.exp(-t * 3) // Exponential decay
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
      }
      
      this.notificationSound = buffer
    } catch (error) {
      console.warn('Failed to load notification sound:', error)
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('notificationSettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error)
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save notification settings:', error)
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.warn('Failed to request notification permission:', error)
      return false
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }

  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  async playNotificationSound() {
    if (!this.settings.soundEnabled || !this.audioContext || !this.notificationSound) {
      return
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = this.notificationSound
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Set volume based on settings
      const volume = this.settings.soundVolume / 100
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      
      source.start()
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    if (!this.settings.enabled) {
      return
    }

    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      return
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.png',
        requireInteraction: false,
        silent: !this.settings.soundEnabled, // Use system sound if enabled
        ...options
      }

      const notification = new Notification(title, defaultOptions)
      
      // Play custom sound if enabled and system sound is disabled
      if (this.settings.soundEnabled && defaultOptions.silent) {
        await this.playNotificationSound()
      }

      // Auto-close after 5 seconds for non-interactive notifications
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => notification.close(), 5000)
      }

      return notification
    } catch (error) {
      console.warn('Failed to show notification:', error)
    }
  }

  async notifyNewMessage(senderName: string, message: string, isGroup: boolean = false) {
    if (!this.settings.messageNotifications) {
      return
    }

    if (isGroup && !this.settings.groupNotifications) {
      return
    }

    const title = isGroup ? `New group message from ${senderName}` : `New message from ${senderName}`
    const body = message.length > 100 ? message.substring(0, 100) + '...' : message

    await this.showNotification(title, {
      body,
      tag: 'new-message',
      data: {
        type: 'message',
        sender: senderName,
        isGroup
      }
    })
  }

  async notifyIncomingCall(callerName: string, isVideo: boolean = false) {
    if (!this.settings.callNotifications) {
      return
    }

    const callType = isVideo ? 'video call' : 'voice call'
    const title = `Incoming ${callType} from ${callerName}`

    await this.showNotification(title, {
      body: `Tap to answer the ${callType}`,
      tag: 'incoming-call',
      requireInteraction: true,
      data: {
        type: 'call',
        caller: callerName,
        isVideo
      }
    })
  }

  async notifyMention(senderName: string, message: string, groupName: string) {
    if (!this.settings.groupNotifications) {
      return
    }

    const title = `You were mentioned in ${groupName}`
    const body = `${senderName}: ${message}`

    await this.showNotification(title, {
      body,
      tag: 'mention',
      data: {
        type: 'mention',
        sender: senderName,
        group: groupName
      }
    })
  }

  // Test notification function
  async testNotification() {
    await this.showNotification('Test Notification', {
      body: 'This is a test notification to verify your settings are working correctly.',
      tag: 'test'
    })
  }

  // Manual notification trigger for testing
  async triggerTestMessageNotification() {
    await this.notifyNewMessage('Test User', 'This is a test message to verify notifications are working!', false)
  }

  async triggerTestGroupNotification() {
    await this.notifyNewMessage('Test User', 'This is a test group message!', true)
  }

  async triggerTestCallNotification() {
    await this.notifyIncomingCall('Test User', false)
  }

  async triggerTestVideoCallNotification() {
    await this.notifyIncomingCall('Test User', true)
  }

  async triggerTestMentionNotification() {
    await this.notifyMention('Test User', 'Hey @you, check this out!', 'Test Group')
  }

  // Clear all notifications
  clearAllNotifications() {
    if ('Notification' in window) {
      // Close all notifications
      // Note: This is a workaround as there's no direct API to close all notifications
      // In a real app, you'd track notification instances and close them
    }
  }
}

// Create a singleton instance
export const notificationService = new NotificationService()

// Export the class for testing
export { NotificationService } 