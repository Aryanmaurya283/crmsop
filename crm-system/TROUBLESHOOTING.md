# 🔧 CRM System Troubleshooting Guide

## Common Issues & Solutions

### 1. ❌ "Missing Publishable Key" Error

**Problem**: Application shows "Missing Publishable Key" error
**Cause**: Clerk publishable key not configured

**Solution**:
```bash
# Update your .env file with your actual Clerk key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here
```

**How to get your Clerk key**:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" section
4. Copy the "Publishable key"
5. Paste it in your `.env` file

### 2. ❌ "Missing Supabase environment variables" Error

**Problem**: Supabase connection fails
**Cause**: Supabase credentials not configured

**Solution**:
```bash
# Update your .env file with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. ❌ Database/RLS Policy Errors

**Problem**: Permission denied or RLS policy errors
**Cause**: Database migrations not run

**Solution**:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run these migrations in order:
   ```sql
   -- Run each file in your Supabase SQL Editor:
   001_create_roles_and_permissions.sql
   002_insert_default_roles.sql
   003_create_rls_policies.sql
   004_create_crm_entities.sql
   005_create_crm_rls_policies.sql
   006_enhance_user_management.sql
   ```

### 4. ❌ "Something went wrong" Page Error

**Problem**: React application crashes or shows error page
**Cause**: Usually component import/export issues

**Solution**:
1. Check browser console for specific errors
2. Restart the development server:
   ```bash
   npm run dev
   ```
3. Clear browser cache and reload

### 5. ❌ Pages Not Loading/404 Errors

**Problem**: Navigating to pages shows 404 or blank screen
**Cause**: Routing or component issues

**Solution**:
1. Verify all page components are exported in `src/pages/index.ts`
2. Check that routes are properly configured in `AppRoutes.tsx`
3. Ensure user has proper permissions for the page

### 6. ❌ Permission/Role Issues

**Problem**: User can't access certain pages or features
**Cause**: User doesn't have proper role assigned

**Solution**:
1. Sign in as admin user
2. Go to `/admin` page
3. Assign proper role to the user
4. Or manually update in Supabase:
   ```sql
   -- Update user role in Supabase
   UPDATE users 
   SET role_id = (SELECT id FROM roles WHERE name = 'admin')
   WHERE clerk_user_id = 'your_clerk_user_id';
   ```

## 🚀 Quick Fix Commands

### Restart Everything
```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

### Clear Node Modules (if needed)
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Check Environment Variables
```bash
# Make sure these are set in .env:
echo $VITE_CLERK_PUBLISHABLE_KEY
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

## 🔍 Debug Steps

### 1. Check Browser Console
- Open Developer Tools (F12)
- Look for red error messages
- Note the specific error and line number

### 2. Check Network Tab
- Look for failed API requests
- Check if Supabase/Clerk requests are working

### 3. Check Application State
- Verify user is signed in
- Check user role and permissions
- Verify database connection

## 📞 Getting Help

If you're still having issues:

1. **Check the error message** in browser console
2. **Verify environment setup** (`.env` file)
3. **Confirm database migrations** are run
4. **Test with a fresh browser session**

## ✅ Working Application Checklist

- [ ] `.env` file has all required variables
- [ ] Clerk publishable key is valid
- [ ] Supabase URL and key are correct
- [ ] All 6 database migrations have been run
- [ ] User can sign in successfully
- [ ] User has been assigned a role
- [ ] Dashboard loads without errors
- [ ] Navigation sidebar is visible
- [ ] Admin page is accessible (for admin users)

Once all items are checked, the application should work perfectly!