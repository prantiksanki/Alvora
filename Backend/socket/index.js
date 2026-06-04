const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.IO on the shared HTTP server.
 * Must be called AFTER all Express middleware is registered.
 *
 * Architecture foundation — emitToUser() can be called from any controller
 * or service to push live updates to connected clients.
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    // Only use websocket transport to avoid polling overhead
    transports: ['websocket', 'polling'],
  });

  // JWT authentication middleware for every socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id').lean();
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug('Socket connected', { userId: socket.userId });

    // Client joins their personal room for targeted updates.
    // Only allowed to join own room — prevents receiving other users' events.
    socket.on('join-user-room', (userId) => {
      if (userId === socket.userId) {
        socket.join(`user:${userId}`);
        logger.debug('Socket joined user room', { userId });
      }
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { userId: socket.userId });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

/**
 * Emit a real-time event to all sockets authenticated as `userId`.
 * Safe to call even if Socket.IO is not initialized or the user is offline.
 *
 * Example events:
 *   emitToUser(userId, 'application-updated', { applicationId, status })
 *   emitToUser(userId, 'sync-completed', { newApplications, updatedApplications })
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
};

module.exports = { initializeSocket, emitToUser };
