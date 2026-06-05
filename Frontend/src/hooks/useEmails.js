import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { emailService } from '../services/emailService';

export const useEmails = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emailService.getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load email accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const connectGmail = useCallback(async () => {
    try {
      setIsConnecting(true);
      const { authUrl } = await emailService.connectGmail();
      window.location.href = authUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate Gmail connection');
      setIsConnecting(false);
    }
  }, []);

  const syncAccount = useCallback(async (id, { onComplete } = {}) => {
    setSyncingId(id);
    try {
      const result = await emailService.syncAccount(id);
      // result.newApplications is present when sync ran directly (no Redis)
      if (result?.newApplications != null) {
        const n = result.newApplications;
        toast.success(
          n > 0
            ? `Sync complete — ${n} new application${n > 1 ? 's' : ''} found`
            : 'Sync complete — no new applications'
        );
      } else {
        toast.success('Sync started — check back in a moment');
      }
      if (onComplete) onComplete(result);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  }, []);

  const deleteAccount = useCallback(async (id, { onComplete } = {}) => {
    // Optimistic remove from UI immediately
    setAccounts((prev) => prev.filter((a) => a._id !== id));
    try {
      const result = await emailService.deleteAccount(id);
      const n = result?.applicationsDeleted ?? 0;
      toast.success(
        n > 0
          ? `Email account removed — ${n} application${n > 1 ? 's' : ''} deleted`
          : 'Email account removed'
      );
      if (onComplete) onComplete(result);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove account');
      fetchAccounts(); // re-sync on error
    }
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    syncingId,
    isConnecting,
    refetch: fetchAccounts,
    connectGmail,
    syncAccount,
    deleteAccount,
  };
};
