import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { activityService, type ActivityFilters, type ActivityCreateData, type ActivityUpdateData, type ActivityStats } from '../services/activities';
import type { Activity, ActivityType, ActivityStatus, ActivityPriority, RelatedEntityType } from '../types/activities';

export const useActivities = () => {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityFilters>({});

  const fetchActivities = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getActivities(filters, page);
      setActivities(result.activities);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, page]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const applyFilters = useCallback((newFilters: ActivityFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  const createActivity = useCallback(async (activityData: ActivityCreateData) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newActivity = await activityService.createActivity(activityData, userId);
      setActivities(prev => [newActivity, ...prev]);
      return newActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      throw err;
    }
  }, [userId]);

  const updateActivity = useCallback(async (id: string, activityData: ActivityUpdateData) => {
    try {
      const updatedActivity = await activityService.updateActivity(id, activityData);
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ));
      return updatedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    try {
      await activityService.deleteActivity(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      throw err;
    }
  }, []);

  const completeActivity = useCallback(async (id: string, completionNotes?: string) => {
    try {
      const completedActivity = await activityService.completeActivity(id, completionNotes);
      setActivities(prev => prev.map(activity => 
        activity.id === id ? completedActivity : activity
      ));
      return completedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete activity');
      throw err;
    }
  }, []);

  return {
    activities,
    loading,
    error,
    total,
    page,
    filters,
    applyFilters,
    refresh,
    createActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    setPage
  };
};

export const useActivityStats = () => {
  const { userId } = useAuth();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getActivityStats(userId);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity stats');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

export const useUpcomingActivities = (days: number = 7) => {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingActivities = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getUpcomingActivities(userId, days);
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming activities');
    } finally {
      setLoading(false);
    }
  }, [userId, days]);

  useEffect(() => {
    fetchUpcomingActivities();
  }, [fetchUpcomingActivities]);

  return {
    activities,
    loading,
    error,
    refresh: fetchUpcomingActivities
  };
};

export const useOverdueActivities = () => {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverdueActivities = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getOverdueActivities(userId);
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overdue activities');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOverdueActivities();
  }, [fetchOverdueActivities]);

  return {
    activities,
    loading,
    error,
    refresh: fetchOverdueActivities
  };
};

export const useActivitiesByEntity = (entityType: RelatedEntityType, entityId: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivitiesByEntity = useCallback(async () => {
    if (!entityId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getActivitiesByEntity(entityType, entityId);
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch activities for ${entityType}`);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchActivitiesByEntity();
  }, [fetchActivitiesByEntity]);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivitiesByEntity
  };
};

export const useActivity = (activityId: string) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!activityId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getActivity(activityId);
      setActivity(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activity,
    loading,
    error,
    refresh: fetchActivity
  };
};

export const useActivitiesByDateRange = (startDate: string, endDate: string) => {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivitiesByDateRange = useCallback(async () => {
    if (!userId || !startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);
      const result = await activityService.getActivitiesByDateRange(startDate, endDate, userId);
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities by date range');
    } finally {
      setLoading(false);
    }
  }, [userId, startDate, endDate]);

  useEffect(() => {
    fetchActivitiesByDateRange();
  }, [fetchActivitiesByDateRange]);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivitiesByDateRange
  };
};

export const useActivityMetadata = () => {
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
  const [priorities, setPriorities] = useState<ActivityPriority[]>([]);
  const [entityTypes, setEntityTypes] = useState<RelatedEntityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [typesResult, statusesResult, prioritiesResult, entityTypesResult] = await Promise.all([
        activityService.getActivityTypes(),
        activityService.getActivityStatuses(),
        activityService.getActivityPriorities(),
        activityService.getRelatedEntityTypes()
      ]);

      setTypes(typesResult);
      setStatuses(statusesResult);
      setPriorities(prioritiesResult);
      setEntityTypes(entityTypesResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    types,
    statuses,
    priorities,
    entityTypes,
    loading,
    error,
    refresh: fetchMetadata
  };
}; 