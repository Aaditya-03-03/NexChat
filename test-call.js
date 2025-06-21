// Simple test script to verify call functionality
// Run this with Node.js to test the signaling server

const io = require('socket.io-client')

// Test configuration
const SERVER_URL = 'http://localhost:3001'
const USER_A = 'user_a_123'
const USER_B = 'user_b_456'

console.log('=== CALL FUNCTIONALITY TEST ===')
console.log('Server URL:', SERVER_URL)

// Create two socket connections to simulate two users
const socketA = io(SERVER_URL)
const socketB = io(SERVER_URL)

let testPassed = 0
let testFailed = 0

// Test 1: User Registration
console.log('\n--- Test 1: User Registration ---')

socketA.on('connect', () => {
  console.log('✅ Socket A connected:', socketA.id)
  socketA.emit('register', USER_A)
})

socketB.on('connect', () => {
  console.log('✅ Socket B connected:', socketB.id)
  socketB.emit('register', USER_B)
})

// Test 2: Call Request
console.log('\n--- Test 2: Call Request ---')

socketA.on('connect', () => {
  setTimeout(() => {
    console.log('📞 User A initiating call to User B...')
    socketA.emit('call-request', { to: USER_B, type: 'audio' })
  }, 1000)
})

// Test 3: Incoming Call Reception
socketB.on('incoming-call', (data) => {
  console.log('✅ User B received incoming call:', data)
  testPassed++
  
  // Test 4: Call Acceptance
  console.log('\n--- Test 4: Call Acceptance ---')
  setTimeout(() => {
    console.log('📞 User B accepting call...')
    socketB.emit('call-accept', { to: USER_A })
  }, 500)
})

// Test 5: Call Accepted Notification
socketA.on('call-accepted', (data) => {
  console.log('✅ User A received call accepted:', data)
  testPassed++
  
  // Test 6: Call End
  console.log('\n--- Test 6: Call End ---')
  setTimeout(() => {
    console.log('📞 User A ending call...')
    socketA.emit('call-end', { to: USER_B })
  }, 500)
})

// Test 7: Call Ended Notification
socketB.on('call-ended', (data) => {
  console.log('✅ User B received call ended:', data)
  testPassed++
  
  // Test 8: Signal Exchange (WebRTC)
  console.log('\n--- Test 8: Signal Exchange ---')
  setTimeout(() => {
    console.log('📡 Testing signal exchange...')
    socketA.emit('signal', {
      type: 'offer',
      data: { test: 'offer_data' },
      from: USER_A,
      to: USER_B
    })
  }, 500)
})

socketB.on('signal', (signal) => {
  console.log('✅ User B received signal:', signal)
  testPassed++
  
  // Send answer signal back
  setTimeout(() => {
    socketB.emit('signal', {
      type: 'answer',
      data: { test: 'answer_data' },
      from: USER_B,
      to: USER_A
    })
  }, 200)
})

socketA.on('signal', (signal) => {
  if (signal.type === 'answer') {
    console.log('✅ User A received answer signal:', signal)
    testPassed++
  }
})

// Error handling
socketA.on('call-error', (error) => {
  console.log('❌ User A received error:', error)
  testFailed++
})

socketB.on('call-error', (error) => {
  console.log('❌ User B received error:', error)
  testFailed++
})

// Disconnect handling
socketA.on('disconnect', () => {
  console.log('🔌 Socket A disconnected')
})

socketB.on('disconnect', () => {
  console.log('🔌 Socket B disconnected')
})

// Test completion
setTimeout(() => {
  console.log('\n=== TEST RESULTS ===')
  console.log(`✅ Tests passed: ${testPassed}`)
  console.log(`❌ Tests failed: ${testFailed}`)
  
  if (testPassed >= 6) {
    console.log('🎉 Call functionality test PASSED!')
  } else {
    console.log('💥 Call functionality test FAILED!')
  }
  
  // Cleanup
  socketA.disconnect()
  socketB.disconnect()
  process.exit(0)
}, 5000)

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted')
  socketA.disconnect()
  socketB.disconnect()
  process.exit(0)
}) 