# Authentication Integration

This module handles the integration between Clerk authentication and Supabase database for user management in the CRM system.

## Overview

The authentication system uses Clerk for user authentication and session management, while synchronizing user data with Supabase for role-based access control and additional user metadata.

## Components

### User Synchronization (`userSync.ts`)

Handles synchronizing user data between Clerk and Supabase:

- **`syncUserWithSupabase(clerkUser)`**: Syncs Clerk user data to Supabase
- **`getUserFromSupabase(clerkUserId)`**: Fetches complete user data from Supabase
- **`deactivateUser(clerkUserId)`**: Deactivates a user in Supabase

### Webhook Handler (`../webhooks/clerkWebhook.ts`)

Processes Clerk webhook events for real-time user synchronization:

- Handles `user.created`, `user.updated`, and `user.deleted` events
- Automatically syncs user changes to Supabase

## Usage

### Basic User Sync

```typescript
import { syncUserWithSupabase } from '../services/auth';

const result = await syncUserWithSupabase(clerkUser);
if (result.success) {
  console.log(`User ${result.isNewUser ? 'created' : 'updated'}`);
} else {
  console.error('Sync failed:', result.error);
}
```

### Fetching User Data

```typescript
import { getUserFromSupabase } from '../services/auth';

const userData = await getUserFromSupabase(clerkUserId);
console.log('User role:', userData?.role?.name);
```

### Using the Hook

```typescript
import { useUserSync } from '../hooks/useUserSync';

function MyComponent() {
  const { 
    supabaseUser, 
    syncSuccess, 
    isSyncing, 
    refetchUser 
  } = useUserSync();

  if (isSyncing) return <div>Syncing user...</div>;
  if (!syncSuccess) return <div>Sync failed</div>;

  return <div>Welcome, {supabaseUser?.first_name}!</div>;
}
```

## Configuration

### Environment Variables

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Webhook Setup

1. In your Clerk dashboard, go to Webhooks
2. Add a new webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret for signature verification

## Database Schema

The user synchronization expects the following Supabase tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image_url TEXT,
  role_id UUID REFERENCES roles(id),
  team_id UUID REFERENCES teams(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

The sync functions return structured results:

```typescript
interface SyncResult {
  success: boolean;
  isNewUser: boolean;
  userId?: string;
  error?: string;
}
```

Common error scenarios:
- Missing Clerk user ID
- Missing primary email address
- Database connection failures
- Permission errors

## Testing

Run the authentication tests:

```bash
npm run test src/services/auth
npm run test src/hooks/useAuth
npm run test src/hooks/useUserSync
```

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures in production
2. **Data Validation**: Validate all user data before database operations
3. **Error Logging**: Log authentication errors for security monitoring
4. **Rate Limiting**: Implement rate limiting for webhook endpoints
5. **Data Sanitization**: Sanitize user input to prevent injection attacks

## Troubleshooting

### Common Issues

1. **User not syncing**: Check Clerk webhook configuration and network connectivity
2. **Permission errors**: Verify Supabase RLS policies and user roles
3. **Duplicate users**: Ensure Clerk user ID uniqueness constraints
4. **Sync failures**: Check database connection and table schemas

### Debug Mode

Enable debug logging:

```typescript
// In development
if (import.meta.env.DEV) {
  console.log('User sync debug info:', { clerkUser, syncResult });
}
```