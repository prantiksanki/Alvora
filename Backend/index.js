require('dotenv').config();

const http = require('http');
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { helmet, cors, jsonParser } = require('./middlewares/security');
const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const goalsRoutes = require('./routes/goals');
const analyticsRoutes = require('./routes/analytics');
const insightsRoutes = require('./routes/insights');
const gamificationRoutes = require('./routes/gamification');
const contestsRoutes = require('./routes/contests');
const notificationsRoutes = require('./routes/notifications');
const yearInCodeRoutes = require('./routes/yearInCode');
const emailRoutes = require('./routes/emails');
const applicationRoutes = require('./routes/applications');
const jobsRoutes = require('./routes/jobs');
const subscriptionsRoutes = require('./routes/subscriptions');
const monitorRoutes = require('./routes/monitor');
const potdRoutes = require('./routes/potd');

// Job imports
const { startSnapshotJob } = require('./jobs/snapshotJob');
const { startContestSyncJob } = require('./jobs/contestSyncJob');
const { startEmailSyncJob } = require('./jobs/emailSyncJob');
const { startGhostingDetectionJob } = require('./jobs/ghostingDetectionJob');
const { startJobMonitorJob } = require('./jobs/jobMonitorJob');
const { startPotdSyncJob } = require('./jobs/potdSyncJob');

// Queue worker imports (BullMQ workers — require Redis)
const { startSnapshotWorker } = require('./queues/workers/snapshotWorker');
const { startNotificationWorker } = require('./queues/workers/notificationWorker');
const { startAnalyticsWorker } = require('./queues/workers/analyticsWorker');
const { startEmailSyncWorker } = require('./queues/workers/emailSyncWorker');
const { startGreenhouseMonitorWorker } = require('./queues/workers/greenhouseMonitorWorker');
const { startLeverMonitorWorker } = require('./queues/workers/leverMonitorWorker');
const { startJobNotificationWorker } = require('./queues/workers/jobNotificationWorker');
const { startJobProcessingWorker } = require('./queues/workers/jobProcessingWorker');
const { startPriorityMonitorWorkers } = require('./queues/workers/priorityMonitorWorker');
const { initializeSocket } = require('./socket/index');

const app = express();
const server = http.createServer(app);

// Security middleware (order matters)
app.use(helmet);
app.use(cors);
app.use(jsonParser);

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/year-in-code', yearInCodeRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/potd', potdRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Socket.IO — must be after all middleware, before listen
initializeSocket(server);

// Must be last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    startSnapshotJob();
    startContestSyncJob();
    startEmailSyncJob();
    startGhostingDetectionJob();
    startJobMonitorJob();
    startPotdSyncJob();
    // Always start the job notification worker so the event bus has a listener
    // even when Redis is unavailable (it gracefully skips queue ops but still
    // delivers real-time WebSocket pushes via emitToUser)
    startJobNotificationWorker();
    if (process.env.REDIS_URL) {
      startSnapshotWorker();
      startNotificationWorker();
      startAnalyticsWorker();
      startEmailSyncWorker();
      startGreenhouseMonitorWorker();
      startLeverMonitorWorker();
      startJobProcessingWorker();
      startPriorityMonitorWorkers();
    } else {
      logger.warn('REDIS_URL not set — BullMQ workers disabled');
    }
  });
});
