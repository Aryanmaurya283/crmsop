import { supabase } from '../supabase';
import type { 
  Activity, 
  ActivityFilters, 
  ActivityCreateData, 
  ActivityUpdateData, 
  ActivityStats,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  RelatedEntityType
} from '../../types/activities';

class ActivityService {
  async getActivities(filters: ActivityFilters = {}, page = 1, limit = 20): Promise<{ activities: Activity[], total: number }> {
    let query = supabase
      .from('activities')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.related_to_type) {
      query = query.eq('related_to_type', filters.related_to_type);
    }
    if (filters.related_to_id) {
      query = query.eq('related_to_id', filters.related_to_id);
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.due_date_from) {
      query = query.gte('due_date', filters.due_date_from);
    }
    if (filters.due_date_to) {
      query = query.lte('due_date', filters.due_date_to);
    }
    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.completed !== undefined) {
      if (filters.completed) {
        query = query.not('completed_at', 'is', null);
      } else {
        query = query.is('completed_at', null);
      }
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return {
      activities: data || [],
      total: count || 0
    };
  }

  async getActivity(id: string): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }

    return data;
  }

  async createActivity(activityData: ActivityCreateData, ownerId: string): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...activityData,
        owner_id: ownerId,
        status: activityData.status || 'pending',
        priority: activityData.priority || 'medium'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }

    return data;
  }

  async updateActivity(id: string, activityData: ActivityUpdateData): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update(activityData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }

    return data;
  }

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete activity: ${error.message}`);
    }
  }

  async completeActivity(id: string, completionNotes?: string): Promise<Activity> {
    const updateData: ActivityUpdateData = {
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    if (completionNotes) {
      updateData.description = completionNotes;
    }

    return this.updateActivity(id, updateData);
  }

  async getActivitiesByEntity(entityType: RelatedEntityType, entityId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('related_to_type', entityType)
      .eq('related_to_id', entityId)
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch activities for ${entityType}: ${error.message}`);
    }

    return data || [];
  }

  async getUpcomingActivities(ownerId?: string, days = 7): Promise<Activity[]> {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = supabase
      .from('activities')
      .select('*')
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .is('completed_at', null)
      .order('due_date', { ascending: true });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch upcoming activities: ${error.message}`);
    }

    return data || [];
  }

  async getOverdueActivities(ownerId?: string): Promise<Activity[]> {
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('activities')
      .select('*')
      .lt('due_date', today)
      .is('completed_at', null)
      .order('due_date', { ascending: true });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch overdue activities: ${error.message}`);
    }

    return data || [];
  }

  async getActivityStats(ownerId?: string): Promise<ActivityStats> {
    let query = supabase.from('activities').select('*');
    
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch activity stats: ${error.message}`);
    }

    const activities = data || [];
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'completed').length;
    const overdueActivities = activities.filter(a => 
      a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed'
    ).length;
    const upcomingActivities = activities.filter(a => 
      a.due_date && new Date(a.due_date) >= new Date() && a.status !== 'completed'
    ).length;

    // Calculate activities by type
    const activitiesByType: Record<ActivityType, number> = {
      task: 0,
      call: 0,
      meeting: 0,
      email: 0,
      note: 0
    };

    activities.forEach(activity => {
      activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
    });

    // Calculate activities by status
    const activitiesByStatus: Record<ActivityStatus, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      deferred: 0
    };

    activities.forEach(activity => {
      activitiesByStatus[activity.status] = (activitiesByStatus[activity.status] || 0) + 1;
    });

    // Calculate average completion time
    const completedActivitiesWithDates = activities.filter(a => 
      a.status === 'completed' && a.completed_at && a.created_at
    );

    let averageCompletionTime = 0;
    if (completedActivitiesWithDates.length > 0) {
      const totalTime = completedActivitiesWithDates.reduce((sum, activity) => {
        const created = new Date(activity.created_at).getTime();
        const completed = new Date(activity.completed_at!).getTime();
        return sum + (completed - created);
      }, 0);
      averageCompletionTime = totalTime / completedActivitiesWithDates.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate productivity score (0-100)
    const productivityScore = totalActivities > 0 
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

    return {
      totalActivities,
      completedActivities,
      overdueActivities,
      upcomingActivities,
      activitiesByType,
      activitiesByStatus,
      averageCompletionTime,
      productivityScore
    };
  }

  async getActivitiesByDateRange(startDate: string, endDate: string, ownerId?: string): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select('*')
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch activities by date range: ${error.message}`);
    }

    return data || [];
  }

  async bulkUpdateActivities(activityIds: string[], updateData: ActivityUpdateData): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .update(updateData)
      .in('id', activityIds);

    if (error) {
      throw new Error(`Failed to bulk update activities: ${error.message}`);
    }
  }

  async getActivityTypes(): Promise<ActivityType[]> {
    return ['task', 'call', 'meeting', 'email', 'note'];
  }

  async getActivityStatuses(): Promise<ActivityStatus[]> {
    return ['pending', 'in_progress', 'completed', 'cancelled', 'deferred'];
  }

  async getActivityPriorities(): Promise<ActivityPriority[]> {
    return ['low', 'medium', 'high', 'urgent'];
  }

  async getRelatedEntityTypes(): Promise<RelatedEntityType[]> {
    return ['lead', 'contact', 'deal', 'account', 'project'];
  }
}

export const activityService = new ActivityService(); 