import { io } from 'socket.io-client';

let socket = null;

/** Decode the payload of a JWT without verifying the signature. */
const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

/**
 * Connect to the Socket.IO server with JWT authentication.
 * On connect, emits 'join-user-room' so the backend places the socket
 * into the user's personal room (user:{userId}), which is required for
 * emitToUser() to deliver events correctly.
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  // Disconnect any stale socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // In production, connect directly to the backend server.
  // In development, '/' is proxied by Vite to localhost:3000.
  const serverUrl = import.meta.env.VITE_API_URL || '/';

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });

  // Join the personal user room on every (re)connection so emitToUser() works
  socket.on('connect', () => {
    const payload = decodeJwtPayload(token);
    const userId = payload?.id;
    if (userId) socket.emit('join-user-room', userId);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
