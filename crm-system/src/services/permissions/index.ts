import { supabase } from '../supabase';
import type { Database } from '../supabase/types';

export type Permission = {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
};

export type UserRole = Database['public']['Tables']['roles']['Row'];
export type UserWithRole = Database['public']['Tables']['users']['Row'] & {
  role: UserRole | null;
};

export class PermissionService {
  /**
   * Check if the current user has a specific permission
   */
  static async hasPermission(
    clerkUserId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_has_permission', {
        user_clerk_id: clerkUserId,
        resource,
        action,
      });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  /**
   * Get user's role information
   */
  static async getUserRole(clerkUserId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        user_clerk_id: clerkUserId,
      });

      if (error) {
        console.error('Error getting user role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  /**
   * Get user with role information
   */
  static async getUserWithRole(clerkUserId: string): Promise<UserWithRole | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (error) {
        console.error('Error getting user with role:', error);
        return null;
      }

      return data as UserWithRole;
    } catch (error) {
      console.error('Failed to get user with role:', error);
      return null;
    }
  }

  /**
   * Get all available roles
   */
  static async getAllRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error getting roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get roles:', error);
      return [];
    }
  }

  /**
   * Assign role to user
   */
  static async assignRole(clerkUserId: string, roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role_id: roleId })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('Error assigning role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to assign role:', error);
      return false;
    }
  }

  /**
   * Check if user is team manager
   */
  static async isTeamManager(clerkUserId: string, teamId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_team_manager', {
        user_clerk_id: clerkUserId,
        team_uuid: teamId,
      });

      if (error) {
        console.error('Error checking team manager status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Failed to check team manager status:', error);
      return false;
    }
  }

  /**
   * Set current user context for RLS
   */
  static async setCurrentUser(clerkUserId: string): Promise<void> {
    try {
      await supabase.rpc('set_current_user_id', {
        user_clerk_id: clerkUserId,
      });
    } catch (error) {
      console.error('Failed to set current user context:', error);
    }
  }

  /**
   * Check if user can access a specific record
   */
  static async canAccessRecord(
    clerkUserId: string,
    recordOwnerId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_access_record', {
        user_clerk_id: clerkUserId,
        record_owner_id: recordOwnerId,
        resource,
        action,
      });

      if (error) {
        console.error('Error checking record access:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Failed to check record access:', error);
      return false;
    }
  }

  /**
   * Get user's team members
   */
  static async getTeamMembers(clerkUserId: string): Promise<UserWithRole[]> {
    try {
      // First get user's team
      const teamId = await supabase.rpc('get_user_team_id', {
        user_clerk_id: clerkUserId,
      });

      if (!teamId.data) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('team_id', teamId.data)
        .eq('is_active', true);

      if (error) {
        console.error('Error getting team members:', error);
        return [];
      }

      return (data as UserWithRole[]) || [];
    } catch (error) {
      console.error('Failed to get team members:', error);
      return [];
    }
  }

  /**
   * Create a role (admin only)
   */
  static async createRole(
    clerkUserId: string,
    roleData: Database['public']['Tables']['roles']['Insert']
  ): Promise<boolean> {
    try {
      // Check if user has permission to create roles
      const canCreate = await this.hasPermission(clerkUserId, 'roles', 'create');
      if (!canCreate) {
        console.error('User does not have permission to create roles');
        return false;
      }

      const { error } = await supabase
        .from('roles')
        .insert(roleData);

      if (error) {
        console.error('Error creating role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create role:', error);
      return false;
    }
  }

  /**
   * Update a role (admin only)
   */
  static async updateRole(
    clerkUserId: string,
    roleId: string,
    updates: Database['public']['Tables']['roles']['Update']
  ): Promise<boolean> {
    try {
      // Check if user has permission to update roles
      const canUpdate = await this.hasPermission(clerkUserId, 'roles', 'update');
      if (!canUpdate) {
        console.error('User does not have permission to update roles');
        return false;
      }

      const { error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', roleId);

      if (error) {
        console.error('Error updating role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update role:', error);
      return false;
    }
  }
}

// Permission constants
export const PERMISSIONS = {
  USERS: {
    CREATE: { resource: 'users', action: 'create' as const },
    READ: { resource: 'users', action: 'read' as const },
    UPDATE: { resource: 'users', action: 'update' as const },
    DELETE: { resource: 'users', action: 'delete' as const },
  },
  ROLES: {
    CREATE: { resource: 'roles', action: 'create' as const },
    READ: { resource: 'roles', action: 'read' as const },
    UPDATE: { resource: 'roles', action: 'update' as const },
    DELETE: { resource: 'roles', action: 'delete' as const },
  },
  TEAMS: {
    CREATE: { resource: 'teams', action: 'create' as const },
    READ: { resource: 'teams', action: 'read' as const },
    UPDATE: { resource: 'teams', action: 'update' as const },
    DELETE: { resource: 'teams', action: 'delete' as const },
  },
  LEADS: {
    CREATE: { resource: 'leads', action: 'create' as const },
    READ: { resource: 'leads', action: 'read' as const },
    UPDATE: { resource: 'leads', action: 'update' as const },
    DELETE: { resource: 'leads', action: 'delete' as const },
  },
  ACCOUNTS: {
    CREATE: { resource: 'accounts', action: 'create' as const },
    READ: { resource: 'accounts', action: 'read' as const },
    UPDATE: { resource: 'accounts', action: 'update' as const },
    DELETE: { resource: 'accounts', action: 'delete' as const },
  },
  CONTACTS: {
    CREATE: { resource: 'contacts', action: 'create' as const },
    READ: { resource: 'contacts', action: 'read' as const },
    UPDATE: { resource: 'contacts', action: 'update' as const },
    DELETE: { resource: 'contacts', action: 'delete' as const },
  },
  DEALS: {
    CREATE: { resource: 'deals', action: 'create' as const },
    READ: { resource: 'deals', action: 'read' as const },
    UPDATE: { resource: 'deals', action: 'update' as const },
    DELETE: { resource: 'deals', action: 'delete' as const },
  },
  PROJECTS: {
    CREATE: { resource: 'projects', action: 'create' as const },
    READ: { resource: 'projects', action: 'read' as const },
    UPDATE: { resource: 'projects', action: 'update' as const },
    DELETE: { resource: 'projects', action: 'delete' as const },
  },
  ACTIVITIES: {
    CREATE: { resource: 'activities', action: 'create' as const },
    READ: { resource: 'activities', action: 'read' as const },
    UPDATE: { resource: 'activities', action: 'update' as const },
    DELETE: { resource: 'activities', action: 'delete' as const },
  },
  REPORTS: {
    CREATE: { resource: 'reports', action: 'create' as const },
    READ: { resource: 'reports', action: 'read' as const },
    UPDATE: { resource: 'reports', action: 'update' as const },
    DELETE: { resource: 'reports', action: 'delete' as const },
  },
  SETTINGS: {
    CREATE: { resource: 'settings', action: 'create' as const },
    READ: { resource: 'settings', action: 'read' as const },
    UPDATE: { resource: 'settings', action: 'update' as const },
    DELETE: { resource: 'settings', action: 'delete' as const },
  },
} as const;

// Role-based permission helpers
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    PERMISSIONS.USERS.CREATE, PERMISSIONS.USERS.READ, PERMISSIONS.USERS.UPDATE, PERMISSIONS.USERS.DELETE,
    PERMISSIONS.ROLES.CREATE, PERMISSIONS.ROLES.READ, PERMISSIONS.ROLES.UPDATE, PERMISSIONS.ROLES.DELETE,
    PERMISSIONS.TEAMS.CREATE, PERMISSIONS.TEAMS.READ, PERMISSIONS.TEAMS.UPDATE, PERMISSIONS.TEAMS.DELETE,
    PERMISSIONS.LEADS.CREATE, PERMISSIONS.LEADS.READ, PERMISSIONS.LEADS.UPDATE, PERMISSIONS.LEADS.DELETE,
    PERMISSIONS.ACCOUNTS.CREATE, PERMISSIONS.ACCOUNTS.READ, PERMISSIONS.ACCOUNTS.UPDATE, PERMISSIONS.ACCOUNTS.DELETE,
    PERMISSIONS.CONTACTS.CREATE, PERMISSIONS.CONTACTS.READ, PERMISSIONS.CONTACTS.UPDATE, PERMISSIONS.CONTACTS.DELETE,
    PERMISSIONS.DEALS.CREATE, PERMISSIONS.DEALS.READ, PERMISSIONS.DEALS.UPDATE, PERMISSIONS.DEALS.DELETE,
    PERMISSIONS.PROJECTS.CREATE, PERMISSIONS.PROJECTS.READ, PERMISSIONS.PROJECTS.UPDATE, PERMISSIONS.PROJECTS.DELETE,
    PERMISSIONS.ACTIVITIES.CREATE, PERMISSIONS.ACTIVITIES.READ, PERMISSIONS.ACTIVITIES.UPDATE, PERMISSIONS.ACTIVITIES.DELETE,
    PERMISSIONS.REPORTS.CREATE, PERMISSIONS.REPORTS.READ, PERMISSIONS.REPORTS.UPDATE, PERMISSIONS.REPORTS.DELETE,
    PERMISSIONS.SETTINGS.CREATE, PERMISSIONS.SETTINGS.READ, PERMISSIONS.SETTINGS.UPDATE, PERMISSIONS.SETTINGS.DELETE,
  ],
  ADMIN: [
    PERMISSIONS.USERS.CREATE, PERMISSIONS.USERS.READ, PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.ROLES.READ,
    PERMISSIONS.TEAMS.CREATE, PERMISSIONS.TEAMS.READ, PERMISSIONS.TEAMS.UPDATE, PERMISSIONS.TEAMS.DELETE,
    PERMISSIONS.LEADS.CREATE, PERMISSIONS.LEADS.READ, PERMISSIONS.LEADS.UPDATE, PERMISSIONS.LEADS.DELETE,
    PERMISSIONS.ACCOUNTS.CREATE, PERMISSIONS.ACCOUNTS.READ, PERMISSIONS.ACCOUNTS.UPDATE, PERMISSIONS.ACCOUNTS.DELETE,
    PERMISSIONS.CONTACTS.CREATE, PERMISSIONS.CONTACTS.READ, PERMISSIONS.CONTACTS.UPDATE, PERMISSIONS.CONTACTS.DELETE,
    PERMISSIONS.DEALS.CREATE, PERMISSIONS.DEALS.READ, PERMISSIONS.DEALS.UPDATE, PERMISSIONS.DEALS.DELETE,
    PERMISSIONS.PROJECTS.CREATE, PERMISSIONS.PROJECTS.READ, PERMISSIONS.PROJECTS.UPDATE, PERMISSIONS.PROJECTS.DELETE,
    PERMISSIONS.ACTIVITIES.CREATE, PERMISSIONS.ACTIVITIES.READ, PERMISSIONS.ACTIVITIES.UPDATE, PERMISSIONS.ACTIVITIES.DELETE,
    PERMISSIONS.REPORTS.CREATE, PERMISSIONS.REPORTS.READ, PERMISSIONS.REPORTS.UPDATE,
    PERMISSIONS.SETTINGS.READ, PERMISSIONS.SETTINGS.UPDATE,
  ],
  SALES_MANAGER: [
    PERMISSIONS.USERS.READ,
    PERMISSIONS.TEAMS.READ,
    PERMISSIONS.LEADS.CREATE, PERMISSIONS.LEADS.READ, PERMISSIONS.LEADS.UPDATE,
    PERMISSIONS.ACCOUNTS.CREATE, PERMISSIONS.ACCOUNTS.READ, PERMISSIONS.ACCOUNTS.UPDATE,
    PERMISSIONS.CONTACTS.CREATE, PERMISSIONS.CONTACTS.READ, PERMISSIONS.CONTACTS.UPDATE,
    PERMISSIONS.DEALS.CREATE, PERMISSIONS.DEALS.READ, PERMISSIONS.DEALS.UPDATE,
    PERMISSIONS.PROJECTS.READ, PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.ACTIVITIES.CREATE, PERMISSIONS.ACTIVITIES.READ, PERMISSIONS.ACTIVITIES.UPDATE,
    PERMISSIONS.REPORTS.READ,
  ],
  SALES_EXECUTIVE: [
    PERMISSIONS.LEADS.CREATE, PERMISSIONS.LEADS.READ, PERMISSIONS.LEADS.UPDATE,
    PERMISSIONS.ACCOUNTS.CREATE, PERMISSIONS.ACCOUNTS.READ, PERMISSIONS.ACCOUNTS.UPDATE,
    PERMISSIONS.CONTACTS.CREATE, PERMISSIONS.CONTACTS.READ, PERMISSIONS.CONTACTS.UPDATE,
    PERMISSIONS.DEALS.CREATE, PERMISSIONS.DEALS.READ, PERMISSIONS.DEALS.UPDATE,
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.ACTIVITIES.CREATE, PERMISSIONS.ACTIVITIES.READ, PERMISSIONS.ACTIVITIES.UPDATE,
    PERMISSIONS.REPORTS.READ,
  ],
} as const;