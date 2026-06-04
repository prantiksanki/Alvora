import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Non-fatal
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications?limit=10');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Non-fatal
    }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Non-fatal
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead };
}
