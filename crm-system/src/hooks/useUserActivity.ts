import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserService, type UserActivity } from '../services/users';

export const useUserActivity = () => {
  const { userId, isSignedIn } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async (limit: number = 50, offset: number = 0) => {
    if (!isSignedIn || !userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const activityData = await UserService.getUserActivity(userId, limit, offset);
      
      if (offset === 0) {
        setActivities(activityData);
      } else {
        setActivities(prev => [...prev, ...activityData]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
      setError(errorMessage);
      console.error('Error loading activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const logActivity = useCallback(async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    if (!userId) return null;

    try {
      const activityId = await UserService.logActivity(userId, {
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: undefined, // Could be populated from request context
        user_agent: navigator.userAgent,
      });

      // Refresh activities to include the new one
      if (activityId) {
        loadActivities();
      }

      return activityId;
    } catch (err) {
      console.error('Error logging activity:', err);
      return null;
    }
  }, [userId, loadActivities]);

  const updateLastActivity = useCallback(async () => {
    if (!userId) return false;

    try {
      return await UserService.updateLastActivity(userId);
    } catch (err) {
      console.error('Error updating last activity:', err);
      return false;
    }
  }, [userId]);

  const loadMore = useCallback(() => {
    loadActivities(50, activities.length);
  }, [loadActivities, activities.length]);

  const refresh = useCallback(() => {
    loadActivities();
  }, [loadActivities]);

  // Activity type helpers
  const getActivitiesByType = useCallback((type: string) => {
    return activities.filter(activity => activity.action === type);
  }, [activities]);

  const getActivitiesByResource = useCallback((resourceType: string, resourceId?: string) => {
    return activities.filter(activity => {
      if (resourceId) {
        return activity.resource_type === resourceType && activity.resource_id === resourceId;
      }
      return activity.resource_type === resourceType;
    });
  }, [activities]);

  const getRecentActivities = useCallback((hours: number = 24) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return activities.filter(activity => 
      new Date(activity.created_at) > cutoff
    );
  }, [activities]);

  return {
    activities,
    isLoading,
    error,
    logActivity,
    updateLastActivity,
    loadMore,
    refresh,
    // Helper functions
    getActivitiesByType,
    getActivitiesByResource,
    getRecentActivities,
    // Computed properties
    totalActivities: activities.length,
    hasActivities: activities.length > 0,
    lastActivity: activities[0] || null,
  };
};