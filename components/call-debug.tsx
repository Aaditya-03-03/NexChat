"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { callService } from '@/lib/call-service'
import { useAuthContext } from '@/components/auth-provider'

export function CallDebug() {
  const { user } = useAuthContext()
  const [targetUserId, setTargetUserId] = useState('')
  const [callType, setCallType] = useState<'audio' | 'video'>('audio')
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [connectedUsers, setConnectedUsers] = useState<string[]>([])

  useEffect(() => {
    // Check server health
    const checkServerHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/health')
        const data = await response.json()
        console.log('Server health:', data)
        setConnectionStatus(`Connected (${data.connectedUsers} users)`)
      } catch (error) {
        console.error('Server health check failed:', error)
        setConnectionStatus('Server not reachable')
      }
    }

    checkServerHealth()
    const interval = setInterval(checkServerHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRegister = () => {
    if (user?.uid) {
      callService.registerUser(user.uid)
      console.log('Registered user:', user.uid)
    }
  }

  const handleTestCall = () => {
    if (!targetUserId) {
      alert('Please enter a target user ID')
      return
    }
    
    console.log('Testing call to:', targetUserId, callType)
    // This will trigger the call initiation
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Call Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Current User ID</Label>
          <Input value={user?.uid || 'Not logged in'} readOnly />
        </div>
        
        <div>
          <Label>Server Status</Label>
          <Input value={connectionStatus} readOnly />
        </div>

        <div>
          <Label>Target User ID</Label>
          <Input 
            value={targetUserId} 
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Enter user ID to call"
          />
        </div>

        <div>
          <Label>Call Type</Label>
          <div className="flex gap-2">
            <Button
              variant={callType === 'audio' ? 'default' : 'outline'}
              onClick={() => setCallType('audio')}
              size="sm"
            >
              Audio
            </Button>
            <Button
              variant={callType === 'video' ? 'default' : 'outline'}
              onClick={() => setCallType('video')}
              size="sm"
            >
              Video
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRegister} variant="outline">
            Register User
          </Button>
          <Button onClick={handleTestCall} disabled={!targetUserId}>
            Test Call
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Check browser console for detailed logs</p>
          <p>Make sure signaling server is running on port 3001</p>
        </div>
      </CardContent>
    </Card>
  )
} 