# Role-Based Access Control (RBAC) System

This module implements a comprehensive Role-Based Access Control system using Supabase Row Level Security (RLS) policies and Clerk authentication.

## Overview

The RBAC system provides fine-grained access control for all CRM entities including users, leads, contacts, accounts, deals, projects, and activities. It uses a combination of:

- **Supabase RLS Policies**: Database-level security enforced at the row level
- **Role-based Permissions**: JSON-based permission definitions stored in the database
- **Team-based Access**: Hierarchical access control based on team membership
- **React Components**: Frontend permission guards and role management interfaces

## Architecture

### Database Schema

```sql
-- Core RBAC tables
roles (id, name, description, permissions, is_system_role)
teams (id, name, description, manager_id)
users (id, clerk_user_id, email, role_id, team_id, is_active)

-- CRM entities with owner_id for access control
leads (id, ..., owner_id)
accounts (id, ..., owner_id)
contacts (id, ..., owner_id)
deals (id, ..., owner_id)
projects (id, ..., owner_id)
activities (id, ..., owner_id)
```

### Permission Model

Permissions are stored as JSON objects in the `roles.permissions` field:

```json
{
  "leads": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false
  },
  "contacts": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false
  }
}
```

## Default Roles

### Super Admin
- Full system access including user and role management
- Can access all records regardless of ownership
- Can create, update, and delete system roles

### Admin
- Operational access to most features
- Can manage users but not delete them
- Can access all records within their scope
- Cannot modify system roles

### Sales Manager
- Team-level access to sales data
- Can view and manage team members' records
- Can generate reports for their team
- Cannot access admin functions

### Sales Executive
- Individual access to their own records
- Can create and manage leads, contacts, accounts, and deals
- Can view projects but not modify them
- Limited reporting access

### Support Agent
- Customer service focused permissions
- Can view and update customer records
- Can manage support tickets
- Limited access to sales data

### Customer
- Portal access only
- Can view their own projects and tickets
- Can create support tickets
- Cannot access internal CRM data

## Usage

### Service Layer

```typescript
import { PermissionService, PERMISSIONS } from '../services/permissions';

// Check if user has permission
const canCreateLeads = await PermissionService.hasPermission(
  clerkUserId,
  'leads',
  'create'
);

// Check if user can access specific record
const canAccessLead = await PermissionService.canAccessRecord(
  clerkUserId,
  leadOwnerId,
  'leads',
  'read'
);

// Get user's role
const userRole = await PermissionService.getUserRole(clerkUserId);

// Assign role to user
await PermissionService.assignRole(clerkUserId, roleId);
```

### React Hooks

```typescript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole,
    isAdmin,
    isSalesManager,
    isLoading,
  } = usePermissions();

  if (isLoading) return <div>Loading permissions...</div>;

  const canCreateLeads = hasPermission('leads', 'create');
  const canManageUsers = hasAnyPermission([
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.UPDATE,
  ]);

  return (
    <div>
      {canCreateLeads && <CreateLeadButton />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Permission Guards

```typescript
import { PermissionGuard, PERMISSIONS } from '../components/auth';

function ProtectedComponent() {
  return (
    <PermissionGuard
      permission={PERMISSIONS.LEADS.CREATE}
      fallback={<div>Access denied</div>}
      showLoading={true}
    >
      <CreateLeadForm />
    </PermissionGuard>
  );
}

// Multiple permissions (any)
<PermissionGuard
  permissions={[
    PERMISSIONS.LEADS.READ,
    PERMISSIONS.CONTACTS.READ,
  ]}
  requireAll={false}
>
  <SalesData />
</PermissionGuard>

// Multiple permissions (all required)
<PermissionGuard
  permissions={[
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
  ]}
  requireAll={true}
>
  <UserManagement />
</PermissionGuard>
```

## Row Level Security (RLS)

### Access Control Logic

The RLS policies implement the following access control logic:

1. **Super Admin & Admin**: Full access to all records
2. **Sales Manager**: Access to their team's records
3. **Sales Executive**: Access to their own records
4. **Record Relationships**: Users can access related records (e.g., contacts from accounts they own)

### Key RLS Functions

```sql
-- Check if user has permission for resource/action
user_has_permission(user_clerk_id, resource, action) -> boolean

-- Get user's role name
get_user_role(user_clerk_id) -> text

-- Check if user can access specific record
can_access_record(user_clerk_id, record_owner_id, resource, action) -> boolean

-- Check if user is team manager
is_team_manager(user_clerk_id, team_uuid) -> boolean
```

### Example RLS Policy

```sql
-- Users can read leads they own or their team's leads
CREATE POLICY "Users can read accessible leads" ON leads
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'leads',
            'read'
        )
    );
```

## Admin Components

### Role Manager

Provides interface for creating and managing roles:

```typescript
import { RoleManager } from '../components/admin';

function AdminPage() {
  return (
    <RoleManager onRoleUpdated={() => console.log('Role updated')} />
  );
}
```

### User Role Assignment

Allows admins to assign roles to users:

```typescript
import { UserRoleAssignment } from '../components/admin';

function UserManagement() {
  return (
    <UserRoleAssignment onRoleAssigned={() => console.log('Role assigned')} />
  );
}
```

## Testing

### Unit Tests

```bash
# Test permission service
npm run test src/services/permissions

# Test permission hooks
npm run test src/hooks/usePermissions

# Test permission guards
npm run test src/components/auth/PermissionGuard
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '../components/auth';

test('should render content when user has permission', () => {
  // Mock permissions
  mockUsePermissions.mockReturnValue({
    hasPermission: () => true,
    isLoading: false,
  });

  render(
    <PermissionGuard permission={{ resource: 'leads', action: 'read' }}>
      <div>Protected Content</div>
    </PermissionGuard>
  );

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});
```

## Security Considerations

### Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Defense in Depth**: Implement checks at multiple layers (DB, API, UI)
3. **Regular Audits**: Monitor and audit permission changes
4. **Secure Defaults**: Deny access by default, explicitly grant permissions
5. **Input Validation**: Validate all permission-related inputs

### Common Pitfalls

1. **Client-side Only**: Never rely solely on frontend permission checks
2. **Overprivileged Roles**: Avoid giving excessive permissions
3. **Hardcoded Permissions**: Use constants and configuration
4. **Missing RLS**: Ensure all tables have appropriate RLS policies
5. **Stale Permissions**: Implement permission cache invalidation

## Performance Optimization

### Caching Strategy

1. **Permission Caching**: Cache frequently checked permissions
2. **Role Caching**: Cache user role information
3. **Batch Loading**: Load multiple permissions in single request
4. **Selective Loading**: Only load permissions for current context

### Database Optimization

1. **Indexes**: Proper indexing on user_id, role_id, team_id
2. **Function Optimization**: Optimize RLS helper functions
3. **Query Planning**: Monitor and optimize slow queries
4. **Connection Pooling**: Use connection pooling for better performance

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check RLS policies and user context
2. **Slow Queries**: Review indexes and RLS function performance
3. **Stale Permissions**: Clear permission cache or reload user data
4. **Role Assignment**: Verify role exists and user has proper permissions

### Debug Mode

Enable debug logging for permission checks:

```typescript
// In development
if (import.meta.env.DEV) {
  console.log('Permission check:', { userId, resource, action, result });
}
```

### Monitoring

Monitor permission-related metrics:

- Permission check frequency
- Failed permission attempts
- Role assignment changes
- RLS policy performance

## Migration Guide

### Adding New Permissions

1. Update role permissions in database
2. Add permission constants to `PERMISSIONS` object
3. Update RLS policies if needed
4. Add to permission preloading list
5. Update tests and documentation

### Creating New Roles

1. Insert role into database with appropriate permissions
2. Update role-based helper functions
3. Add role-specific UI components
4. Update permission guards and checks
5. Test thoroughly with new role

## API Reference

### PermissionService

- `hasPermission(userId, resource, action)`: Check single permission
- `getUserRole(userId)`: Get user's role name
- `getUserWithRole(userId)`: Get user with role details
- `getAllRoles()`: Get all available roles
- `assignRole(userId, roleId)`: Assign role to user
- `canAccessRecord(userId, ownerId, resource, action)`: Check record access
- `isTeamManager(userId, teamId)`: Check team manager status

### usePermissions Hook

- `hasPermission(resource, action)`: Check single permission
- `hasAnyPermission(permissions)`: Check if user has any of the permissions
- `hasAllPermissions(permissions)`: Check if user has all permissions
- `checkPermission(resource, action)`: Async permission check with caching
- `userRole`: Current user's role name
- `isLoading`: Permission loading state
- Role helpers: `isAdmin`, `isSuperAdmin`, `isSalesManager`, etc.

### Permission Constants

Use predefined permission constants for consistency:

```typescript
import { PERMISSIONS } from '../services/permissions';

PERMISSIONS.LEADS.CREATE    // { resource: 'leads', action: 'create' }
PERMISSIONS.USERS.READ      // { resource: 'users', action: 'read' }
PERMISSIONS.REPORTS.DELETE  // { resource: 'reports', action: 'delete' }
```