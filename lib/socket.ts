import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? 'https://your-production-url' : 'http://localhost:3001';

export const socket = io(URL, {
  autoConnect: false,
}); 