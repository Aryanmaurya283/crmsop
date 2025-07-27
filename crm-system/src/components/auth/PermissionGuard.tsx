import { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { LoadingSpinner } from '../common';
import type { Permission } from '../../services/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showLoading?: boolean;
}

const PermissionGuard = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showLoading = false,
}: PermissionGuardProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading && showLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  // Single permission check
  if (permission) {
    const hasAccess = hasPermission(permission.resource, permission.action);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // No permission specified, render children
  return <>{children}</>;
};

export default PermissionGuard;