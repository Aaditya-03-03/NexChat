# WebRTC Call Feature Setup

This document explains how to set up and use the WebRTC audio and video call feature in NexChat.

## Features

- **Audio Calls**: Make voice calls to other users
- **Video Calls**: Make video calls with camera and microphone
- **Call Controls**: Mute/unmute, turn video on/off, end calls
- **Call Notifications**: Incoming call notifications with accept/reject options
- **Real-time Communication**: Direct peer-to-peer connection using WebRTC

## Prerequisites

- Node.js 16+ and npm/pnpm
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone permissions

## Installation

### 1. Install WebRTC Dependencies

The WebRTC dependencies have been added to the main project:

```bash
pnpm add simple-peer @types/simple-peer
```

### 2. Set up the Signaling Server

The signaling server handles WebRTC connection establishment between peers.

#### Install server dependencies:

```bash
cd server
npm install
```

#### Start the signaling server:

```bash
cd server
npm run dev
```

The server will run on `http://localhost:3001` by default.

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Usage

### Making Calls

1. **From Chat Window**: Click the phone icon for audio calls or video icon for video calls
2. **From User Profile**: Click the call buttons in the profile photo viewer
3. **From Chat Header**: Use the call buttons in the chat header (direct chats only)

### Receiving Calls

1. **Incoming Call Notification**: You'll see a notification when someone calls you
2. **Call Interface**: The call interface will open automatically
3. **Accept/Reject**: Click the green phone button to accept or red button to reject

### During Calls

- **Mute/Unmute**: Click the microphone button to toggle audio
- **Video On/Off**: Click the video button to toggle camera (video calls only)
- **End Call**: Click the red phone button to end the call

## Architecture

### Components

1. **CallService** (`lib/call-service.ts`): Manages WebRTC connections and signaling
2. **CallInterface** (`components/call-interface.tsx`): UI for call controls and video display
3. **useCall Hook** (`hooks/use-call.ts`): React hook for call state management
4. **Signaling Server** (`server/index.js`): Handles WebRTC signaling between peers

### WebRTC Flow

1. **Call Initiation**: User clicks call button → CallService requests user media → Creates peer connection
2. **Signaling**: Offer/answer exchange through signaling server
3. **Connection**: Direct peer-to-peer connection established
4. **Media Streams**: Audio/video streams shared between peers
5. **Call End**: Connection closed and resources cleaned up

## Security Considerations

- **HTTPS Required**: WebRTC requires HTTPS in production for security
- **User Permissions**: Camera and microphone access requires user consent
- **Peer-to-Peer**: Media streams are direct between users, not through server
- **Firewall**: WebRTC may require STUN/TURN servers for NAT traversal

## Troubleshooting

### Common Issues

1. **"Failed to get user media"**: Check camera/microphone permissions
2. **"User not online"**: Ensure the signaling server is running
3. **"Call failed"**: Check browser console for WebRTC errors
4. **No video/audio**: Verify device permissions and hardware

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG=true
```

### Browser Support

- Chrome 56+
- Firefox 52+
- Safari 11+
- Edge 79+

## Production Deployment

### 1. Deploy Signaling Server

Deploy the server to a platform like:
- Heroku
- Vercel
- Railway
- DigitalOcean

### 2. Configure STUN/TURN Servers

For production, add STUN/TURN servers to handle NAT traversal:

```javascript
// In call-service.ts
const peer = new SimplePeer({
  initiator: true,
  trickle: false,
  stream,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Add your TURN server here
    ]
  }
})
```

### 3. Environment Variables

Set production environment variables:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-signaling-server.com
```

## API Reference

### CallService Methods

- `initiateCall(userId, type)`: Start a call
- `acceptCall()`: Accept incoming call
- `rejectCall()`: Reject incoming call
- `endCall()`: End current call
- `toggleMute()`: Toggle microphone
- `toggleVideo()`: Toggle camera
- `registerUser(userId)`: Register user with signaling server

### CallInterface Props

- `isOpen`: Whether call interface is visible
- `onClose`: Callback when interface closes
- `remoteUserId`: ID of the other user
- `remoteUserName`: Name of the other user
- `remoteUserPhoto`: Photo URL of the other user
- `callType`: 'audio' | 'video'
- `isIncoming`: Whether this is an incoming call

## Contributing

When adding new call features:

1. Update the CallService interface
2. Add corresponding UI components
3. Update the signaling server if needed
4. Add proper error handling
5. Test across different browsers
6. Update documentation

## License

This WebRTC implementation is part of NexChat and follows the same license terms. 