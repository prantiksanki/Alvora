import { useState, useEffect, useCallback } from 'react';
import { jobNotificationService } from '../services/jobNotificationService';
import { useJobSocket } from '../context/JobSocketContext';

export function useJobNotifications() {
  const [events, setEvents] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useJobSocket();

  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await jobNotificationService.getNotifications({ page, limit: 20 });
      setEvents(data.events || []);
      setUnreadCount(data.unreadCount || 0);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch {
      // Non-fatal
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Increment unread count on live socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewJob = () => {
      setUnreadCount((c) => c + 1);
    };

    socket.on('new-job-detected', handleNewJob);
    return () => socket.off('new-job-detected', handleNewJob);
  }, [socket]);

  const markRead = useCallback(async (id) => {
    try {
      await jobNotificationService.markRead(id);
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? { ...e, readStatus: true } : e))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Non-fatal
    }
  }, []);

  return {
    events,
    unreadCount,
    pagination,
    isLoading,
    markRead,
    fetchNotifications,
  };
}
