# Call Feature Troubleshooting Guide

## Recent Fixes Applied

### ✅ Fixed Call Notification Issues

The main issue preventing call notifications from working was **incorrect user ID handling**. Here are the key fixes:

1. **Fixed User ID vs Socket ID confusion**: The call service was using `socket.id` instead of `userId` for signaling
2. **Enhanced server logging**: Added comprehensive debugging to track all call events
3. **Improved error handling**: Better error messages and fallback mechanisms
4. **Fixed signal routing**: Ensured proper user-to-user communication

## Quick Test

### 1. Start the Signaling Server
```bash
cd server
npm start
```

### 2. Test Server Health
```bash
curl http://localhost:3001/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "connectedUsers": 0,
  "userList": []
}
```

### 3. Run Automated Test
```bash
node test-call.js
```
This will test the complete call flow automatically.

## Manual Testing Steps

### Step 1: Verify Server Connection
1. Open browser console on both users
2. Check for "Connected to call server" message
3. Verify user registration: "User registered for calls: [userId]"

### Step 2: Test Call Initiation
1. User A clicks call button for User B
2. Check console for:
   ```
   === INITIATING CALL ===
   Target user ID: [userId]
   Call type: audio
   ```

### Step 3: Test Call Reception
1. User B should see:
   ```
   === INCOMING CALL RECEIVED IN HOOK ===
   Call data: { from: "[userId]", type: "audio" }
   ```
2. Toast notification should appear
3. Call interface should open

### Step 4: Test Call Acceptance
1. User B clicks "Answer"
2. Check for:
   ```
   === HANDLING ACCEPT CALL ===
   Call accepted successfully
   ```

## Common Issues & Solutions

### Issue: "User not online" error
**Cause**: User not properly registered with the signaling server
**Solution**: 
1. Ensure user is logged in
2. Check browser console for registration success
3. Verify server shows user in connected list

### Issue: No incoming call notification
**Cause**: Socket connection or event handling issues
**Solution**:
1. Check browser console for connection errors
2. Verify `useCall` hook is properly initialized
3. Ensure call service events are subscribed

### Issue: Call interface doesn't open
**Cause**: State management issues in the hook
**Solution**:
1. Check for React state updates
2. Verify `isCallInterfaceOpen` state changes
3. Check for any JavaScript errors

### Issue: WebRTC connection fails
**Cause**: Media permissions or network issues
**Solution**:
1. Allow microphone/camera permissions
2. Check for HTTPS requirement (WebRTC needs secure context)
3. Verify STUN/TURN server configuration

## Debug Information

### Server Logs
The server now provides detailed logging:
```
=== NEW SOCKET CONNECTION ===
Socket ID: [socketId]
=== USER REGISTRATION ===
User ID: [userId]
=== CALL REQUEST ===
From user: [userId]
To user: [targetUserId]
```

### Client Logs
The client provides comprehensive debugging:
```
=== USE_CALL HOOK INITIALIZED ===
=== INITIATING CALL ===
=== INCOMING CALL RECEIVED IN HOOK ===
```

## Environment Variables

Ensure these are set correctly:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
CLIENT_URL=http://localhost:3000
```

## Testing Checklist

- [ ] Signaling server starts without errors
- [ ] Server health endpoint responds
- [ ] Users can connect and register
- [ ] Call requests are sent properly
- [ ] Incoming calls are received
- [ ] Call interface opens correctly
- [ ] Call acceptance works
- [ ] WebRTC connection establishes
- [ ] Audio/video streams work
- [ ] Call ending works properly

## Performance Monitoring

Monitor these metrics:
- Connection latency
- Call setup time
- Audio/video quality
- Connection stability

## Support

If issues persist:
1. Check browser console for errors
2. Review server logs for connection issues
3. Verify network connectivity
4. Test with different browsers
5. Check firewall/proxy settings 