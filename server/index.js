const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Store connected users: userId -> socketId
const connectedUsers = new Map()
// Store socket to user mapping: socketId -> userId
const socketToUser = new Map()

// Function to broadcast the list of online users to everyone
const broadcastOnlineUsers = () => {
  const onlineUserIds = Array.from(connectedUsers.keys())
  io.emit('online-users', onlineUserIds)
  console.log('Broadcasted online users:', onlineUserIds)
}

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    userList: Array.from(connectedUsers.keys())
  })
})

io.on('connection', (socket) => {
  console.log('=== NEW SOCKET CONNECTION ===')
  console.log('Socket ID:', socket.id)
  console.log('Current connected users:', Array.from(connectedUsers.entries()))

  // Handle user registration
  socket.on('register', (userId) => {
    console.log('=== USER REGISTRATION ===')
    console.log('User ID:', userId)
    console.log('Socket ID:', socket.id)
    
    // Remove any existing registration for this user
    const existingSocketId = connectedUsers.get(userId)
    if (existingSocketId && existingSocketId !== socket.id) {
      console.log('Removing existing registration for user:', userId)
      socketToUser.delete(existingSocketId)
    }
    
    connectedUsers.set(userId, socket.id)
    socketToUser.set(socket.id, userId)
    socket.userId = userId
    
    console.log('User registered successfully:', userId, '->', socket.id)
    console.log('Total connected users:', connectedUsers.size)
    console.log('Connected users:', Array.from(connectedUsers.entries()))

    // Broadcast the updated list of online users
    broadcastOnlineUsers()
  })

  // Add a listener for clients who want the current list
  socket.on('get-online-users', () => {
    const onlineUserIds = Array.from(connectedUsers.keys())
    socket.emit('online-users', onlineUserIds)
    console.log(`Sent online users list to ${socket.userId}:`, onlineUserIds)
  })

  // Handle call requests
  socket.on('call-request', (data) => {
    const { to, type } = data
    const targetSocketId = connectedUsers.get(to)
    
    console.log('=== CALL REQUEST ===')
    console.log('From user:', socket.userId)
    console.log('To user:', to)
    console.log('Call type:', type)
    console.log('Target socket ID:', targetSocketId)
    console.log('All connected users:', Array.from(connectedUsers.entries()))
    
    if (targetSocketId) {
      console.log('Sending call request to socket:', targetSocketId)
      io.to(targetSocketId).emit('incoming-call', {
        from: socket.userId,
        to,
        type
      })
      console.log('Call request sent successfully')
    } else {
      console.log('ERROR: User not found:', to)
      console.log('Available users:', Array.from(connectedUsers.keys()))
      socket.emit('call-error', { message: 'User not online' })
    }
  })

  // Handle call acceptance
  socket.on('call-accept', (data) => {
    const { to } = data
    const targetSocketId = connectedUsers.get(to)
    
    console.log('=== CALL ACCEPT ===')
    console.log('From user:', socket.userId)
    console.log('To user:', to)
    console.log('Target socket ID:', targetSocketId)
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-accepted', {
        from: socket.userId
      })
      console.log('Call accepted notification sent')
    } else {
      console.log('ERROR: Target user not found for call accept')
    }
  })

  // Handle call rejection
  socket.on('call-reject', (data) => {
    const { to } = data
    const targetSocketId = connectedUsers.get(to)
    
    console.log('=== CALL REJECT ===')
    console.log('From user:', socket.userId)
    console.log('To user:', to)
    console.log('Target socket ID:', targetSocketId)
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-rejected', {
        from: socket.userId
      })
      console.log('Call rejected notification sent')
    } else {
      console.log('ERROR: Target user not found for call reject')
    }
  })

  // Handle call ending
  socket.on('call-end', (data) => {
    const { to } = data
    const targetSocketId = connectedUsers.get(to)
    
    console.log('=== CALL END ===')
    console.log('From user:', socket.userId)
    console.log('To user:', to)
    console.log('Target socket ID:', targetSocketId)
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended', {
        from: socket.userId
      })
      console.log('Call ended notification sent')
    } else {
      console.log('ERROR: Target user not found for call end')
    }
  })

  // Handle WebRTC signaling
  socket.on('signal', (signal) => {
    const { to, type, data } = signal
    const targetSocketId = connectedUsers.get(to)
    
    console.log('=== SIGNAL ===')
    console.log('From user:', socket.userId)
    console.log('To user:', to)
    console.log('Signal type:', type)
    console.log('Target socket ID:', targetSocketId)
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('signal', {
        type,
        data,
        from: socket.userId,
        to
      })
      console.log('Signal sent successfully')
    } else {
      console.log('ERROR: Target user not found for signal')
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('=== SOCKET DISCONNECT ===')
    console.log('Socket ID:', socket.id)
    console.log('User ID:', socket.userId)
    
    if (socket.userId) {
      connectedUsers.delete(socket.userId)
      socketToUser.delete(socket.id)
      console.log('User disconnected:', socket.userId)
      console.log('Remaining connected users:', connectedUsers.size)
      console.log('Remaining users:', Array.from(connectedUsers.keys()))

      // Broadcast the updated list of online users
      broadcastOnlineUsers()
    }
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`=== WEBRTC SIGNALING SERVER STARTED ===`)
  console.log(`Server running on port ${PORT}`)
  console.log(`CORS origin: ${process.env.CLIENT_URL || "http://localhost:3000"}`)
}) 