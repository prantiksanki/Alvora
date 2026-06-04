import { useEffect, useState } from 'react';
import { profileService } from '../services/profileService';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const updateProfile = async (data) => {
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setIsSaving(false);
    }
  };

  return { profile, updateProfile, isLoading, isSaving, error };
}
