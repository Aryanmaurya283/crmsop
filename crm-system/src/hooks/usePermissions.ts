import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { PermissionService, type Permission, type UserRole } from '../services/permissions';

export const usePermissions = () => {
  const { userId, isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Set current user context for RLS
        await PermissionService.setCurrentUser(userId);

        // Get user role
        const role = await PermissionService.getUserRole(userId);
        setUserRole(role);

        // Pre-load common permissions
        const commonPermissions = [
          'users.read', 'users.create', 'users.update', 'users.delete',
          'roles.read', 'roles.create', 'roles.update', 'roles.delete',
          'teams.read', 'teams.create', 'teams.update', 'teams.delete',
          'leads.read', 'leads.create', 'leads.update', 'leads.delete',
          'accounts.read', 'accounts.create', 'accounts.update', 'accounts.delete',
          'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
          'deals.read', 'deals.create', 'deals.update', 'deals.delete',
          'projects.read', 'projects.create', 'projects.update', 'projects.delete',
          'activities.read', 'activities.create', 'activities.update', 'activities.delete',
          'reports.read', 'reports.create', 'reports.update', 'reports.delete',
          'settings.read', 'settings.create', 'settings.update', 'settings.delete',
        ];

        const permissionResults: Record<string, boolean> = {};
        
        for (const permission of commonPermissions) {
          const [resource, action] = permission.split('.');
          const hasPermission = await PermissionService.hasPermission(userId, resource, action);
          permissionResults[permission] = hasPermission;
        }

        setPermissions(permissionResults);
      } catch (error) {
        console.error('Failed to load user permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();
  }, [userId, isSignedIn]);

  const hasPermission = (resource: string, action: string): boolean => {
    const permissionKey = `${resource}.${action}`;
    return permissions[permissionKey] || false;
  };

  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    return permissionList.some(({ resource, action }) => hasPermission(resource, action));
  };

  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    return permissionList.every(({ resource, action }) => hasPermission(resource, action));
  };

  const checkPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!userId) return false;
    
    const permissionKey = `${resource}.${action}`;
    
    // Return cached permission if available
    if (permissionKey in permissions) {
      return permissions[permissionKey];
    }

    // Check permission and cache result
    try {
      const hasPermission = await PermissionService.hasPermission(userId, resource, action);
      setPermissions(prev => ({ ...prev, [permissionKey]: hasPermission }));
      return hasPermission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  };

  return {
    userRole,
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    // Role-based helpers
    isSuperAdmin: userRole === 'super_admin',
    isAdmin: userRole === 'admin' || userRole === 'super_admin',
    isSalesManager: userRole === 'sales_manager',
    isSalesExecutive: userRole === 'sales_executive',
    isSupportAgent: userRole === 'support_agent',
    isCustomer: userRole === 'customer',
  };
};