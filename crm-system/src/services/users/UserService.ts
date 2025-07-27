import { supabase } from '../supabase';
import type { Database } from '../supabase/types';

export type UserProfile = Database['public']['Functions']['get_user_profile']['Returns'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type UserActivity = Database['public']['Tables']['user_activity_log']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type TeamMembership = Database['public']['Tables']['team_memberships']['Row'];
export type UserSkill = Database['public']['Tables']['user_skills']['Row'];
export type UserTerritory = Database['public']['Tables']['user_territories']['Row'];

export interface CreateUserPreferencesData {
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
  };
  dashboard_layout?: Record<string, any>;
  default_filters?: Record<string, any>;
  timezone?: string;
  language?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  currency?: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  timezone?: string;
  language?: string;
}

export interface CreateUserActivityData {
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class UserService {
  /**
   * Get comprehensive user profile
   */
  static async getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_profile', {
        p_clerk_user_id: clerkUserId,
      });

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile information
   */
  static async updateUserProfile(
    clerkUserId: string,
    updates: UpdateUserProfileData
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(clerkUserId: string): Promise<UserPreferences | null> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error getting user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  /**
   * Create or update user preferences
   */
  static async upsertUserPreferences(
    clerkUserId: string,
    preferences: CreateUserPreferencesData
  ): Promise<boolean> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return false;
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userData.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error upserting user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to upsert user preferences:', error);
      return false;
    }
  }

  /**
   * Log user activity
   */
  static async logActivity(
    clerkUserId: string,
    activityData: CreateUserActivityData
  ): Promise<string | null> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return null;
      }

      const { data, error } = await supabase.rpc('log_user_activity', {
        p_user_id: userData.id,
        p_action: activityData.action,
        p_resource_type: activityData.resource_type,
        p_resource_id: activityData.resource_id,
        p_details: activityData.details || {},
        p_ip_address: activityData.ip_address,
        p_user_agent: activityData.user_agent,
      });

      if (error) {
        console.error('Error logging user activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to log user activity:', error);
      return null;
    }
  }

  /**
   * Get user activity history
   */
  static async getUserActivity(
    clerkUserId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<UserActivity[]> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting user activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return [];
    }
  }

  /**
   * Update user last activity timestamp
   */
  static async updateLastActivity(clerkUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_user_activity', {
        p_clerk_user_id: clerkUserId,
      });

      if (error) {
        console.error('Error updating user activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update user activity:', error);
      return false;
    }
  }

  /**
   * Get user's teams
   */
  static async getUserTeams(clerkUserId: string): Promise<any[]> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return [];
      }

      const { data, error } = await supabase.rpc('get_user_teams', {
        p_user_id: userData.id,
      });

      if (error) {
        console.error('Error getting user teams:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user teams:', error);
      return [];
    }
  }

  /**
   * Get user skills
   */
  static async getUserSkills(clerkUserId: string): Promise<UserSkill[]> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userData.id)
        .order('skill_name');

      if (error) {
        console.error('Error getting user skills:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user skills:', error);
      return [];
    }
  }

  /**
   * Add or update user skill
   */
  static async upsertUserSkill(
    clerkUserId: string,
    skillName: string,
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<boolean> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return false;
      }

      const { error } = await supabase
        .from('user_skills')
        .upsert({
          user_id: userData.id,
          skill_name: skillName,
          skill_level: skillLevel,
        });

      if (error) {
        console.error('Error upserting user skill:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to upsert user skill:', error);
      return false;
    }
  }

  /**
   * Get user territories
   */
  static async getUserTerritories(clerkUserId: string): Promise<UserTerritory[]> {
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('user_territories')
        .select('*')
        .eq('user_id', userData.id)
        .order('territory_name');

      if (error) {
        console.error('Error getting user territories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user territories:', error);
      return [];
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*),
          team:teams(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting all users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(
    query: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          clerk_user_id,
          email,
          first_name,
          last_name,
          title,
          department,
          image_url,
          is_active,
          role:roles(name, description)
        `)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  /**
   * Get team members for a user (if they're a manager)
   */
  static async getTeamMembers(clerkUserId: string): Promise<any[]> {
    try {
      // First get the user's team
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('team_id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (userError || !userData?.team_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(name, description)
        `)
        .eq('team_id', userData.team_id)
        .eq('is_active', true)
        .order('first_name');

      if (error) {
        console.error('Error getting team members:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get team members:', error);
      return [];
    }
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role_id?: string;
    team_id?: string;
    title?: string;
    department?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          ...userData,
          clerk_user_id: `temp_${Date.now()}`, // Temporary ID until Clerk user is created
          is_active: true,
        });

      if (error) {
        console.error('Error creating user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create user:', error);
      return false;
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  static async updateUserStatus(clerkUserId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('Error updating user status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update user status:', error);
      return false;
    }
  }

  /**
   * Assign user to team
   */
  static async assignUserToTeam(clerkUserId: string, teamId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          team_id: teamId,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('Error assigning user to team:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to assign user to team:', error);
      return false;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentUsers: number;
  }> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          is_active,
          created_at,
          role:roles(name)
        `);

      if (error) {
        console.error('Error getting user stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          usersByRole: {},
          recentUsers: 0,
        };
      }

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active).length || 0;
      
      // Count users by role
      const usersByRole: Record<string, number> = {};
      users?.forEach(user => {
        const roleName = user.role?.name || 'no_role';
        usersByRole[roleName] = (usersByRole[roleName] || 0) + 1;
      });

      // Count recent users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers = users?.filter(u => 
        new Date(u.created_at) > thirtyDaysAgo
      ).length || 0;

      return {
        totalUsers,
        activeUsers,
        usersByRole,
        recentUsers,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        usersByRole: {},
        recentUsers: 0,
      };
    }
  }

  /**
   * Bulk update users
   */
  static async bulkUpdateUsers(
    updates: Array<{
      clerk_user_id: string;
      updates: Partial<Database['public']['Tables']['users']['Update']>;
    }>
  ): Promise<boolean> {
    try {
      const promises = updates.map(({ clerk_user_id, updates: userUpdates }) =>
        supabase
          .from('users')
          .update({
            ...userUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', clerk_user_id)
      );

      const results = await Promise.all(promises);
      
      // Check if any updates failed
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        console.error('Some bulk updates failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to bulk update users:', error);
      return false;
    }
  }
}