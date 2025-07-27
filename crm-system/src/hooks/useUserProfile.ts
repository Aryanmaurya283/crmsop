import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserService, type UserProfile, type UserPreferences } from '../services/users';

export const useUserProfile = () => {
  const { userId, isSignedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [profileData, preferencesData] = await Promise.all([
          UserService.getUserProfile(userId),
          UserService.getUserPreferences(userId),
        ]);

        setProfile(profileData);
        setPreferences(preferencesData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
        setError(errorMessage);
        console.error('Error loading user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId, isSignedIn]);

  const updateProfile = async (updates: Parameters<typeof UserService.updateUserProfile>[1]) => {
    if (!userId) return false;

    try {
      const success = await UserService.updateUserProfile(userId, updates);
      if (success && profile) {
        // Update local state
        setProfile({
          ...profile,
          ...updates,
        });
      }
      return success;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const updatePreferences = async (updates: Parameters<typeof UserService.upsertUserPreferences>[1]) => {
    if (!userId) return false;

    try {
      const success = await UserService.upsertUserPreferences(userId, updates);
      if (success) {
        // Reload preferences
        const newPreferences = await UserService.getUserPreferences(userId);
        setPreferences(newPreferences);
      }
      return success;
    } catch (err) {
      console.error('Error updating preferences:', err);
      return false;
    }
  };

  const logActivity = async (activityData: Parameters<typeof UserService.logActivity>[1]) => {
    if (!userId) return null;

    try {
      return await UserService.logActivity(userId, activityData);
    } catch (err) {
      console.error('Error logging activity:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const profileData = await UserService.getUserProfile(userId);
      setProfile(profileData);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    preferences,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    logActivity,
    refreshProfile,
    // Computed properties
    fullName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : '',
    displayName: profile?.first_name || profile?.email || 'User',
    hasRole: (roleName: string) => profile?.role_name === roleName,
    isActive: profile?.is_active ?? false,
  };
};