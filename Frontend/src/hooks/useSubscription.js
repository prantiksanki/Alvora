import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionService.get();
      setSubscription(data.subscription || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const saveSubscription = useCallback(async (data) => {
    try {
      setIsSaving(true);
      const result = await subscriptionService.upsert(data);
      setSubscription(result.subscription);
      toast.success('Preferences saved');
      return result.subscription;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteSubscription = useCallback(async () => {
    try {
      setIsSaving(true);
      await subscriptionService.deactivate();
      setSubscription((prev) => prev ? { ...prev, isActive: false } : null);
      toast.success('Subscription deactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    subscription,
    isLoading,
    isSaving,
    error,
    saveSubscription,
    deleteSubscription,
    refetch: fetchSubscription,
  };
}
