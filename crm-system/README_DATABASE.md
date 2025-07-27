# 🗄️ Database Setup for CRM System

## 🎯 Current Status

The CRM system has a comprehensive database schema ready for implementation. All migration files are created and the application includes database verification tools.

## 📋 What You Need to Do

### 1. Set Up Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy your project URL and anon key

### 2. Update Environment Variables
Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Run Database Migrations
In your Supabase dashboard → SQL Editor, run these files **in order**:

1. `supabase/migrations/001_create_roles_and_permissions.sql`
2. `supabase/migrations/002_insert_default_roles.sql`
3. `supabase/migrations/003_create_rls_policies.sql`
4. `supabase/migrations/004_create_crm_entities.sql`
5. `supabase/migrations/005_create_crm_rls_policies.sql`
6. `supabase/migrations/006_enhance_user_management.sql`
7. `supabase/migrations/007_enhance_leads_management.sql`

### 4. Verify Setup
1. Start your application: `npm run dev`
2. Go to `/admin` page
3. Check the "Database Status" card at the top
4. All items should show green checkmarks ✅

## 📊 What Gets Created

### Tables (20+)
- **User Management**: users, roles, teams, user_sessions, user_activity_log, user_preferences, team_memberships, user_skills, user_territories
- **Lead Management**: leads, lead_sources, lead_campaigns, lead_activities, lead_scoring_rules, lead_assignments
- **CRM Core**: accounts, contacts, deals, projects, activities

### Default Data
- **6 User Roles**: super_admin, admin, sales_manager, sales_executive, support_agent, customer
- **10 Lead Sources**: Website Form, Social Media, Google Ads, Facebook Ads, LinkedIn, Referral, Trade Show, Cold Calling, Email Campaign, Content Marketing
- **10 Scoring Rules**: Company size, revenue, website visits, email engagement, form submissions, demo requests, etc.

### Database Functions (13+)
- `calculate_lead_score()` - Intelligent lead scoring
- `assign_lead_auto()` - Automatic lead assignment
- `convert_lead()` - Lead conversion to contacts/accounts/deals
- `user_has_permission()` - Permission checking
- `get_user_profile()` - Complete user data
- And more...

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Permission-based access** control
- **Role-based data filtering**
- **Audit logging** for all activities

## 🔧 Verification Tools

The application includes built-in verification:

1. **Database Status Component** (`/admin` page)
   - Tests database connection
   - Verifies all tables exist
   - Checks default data is loaded
   - Tests database functions

2. **Manual Verification Script** (`scripts/verify-database.sql`)
   - Run in Supabase SQL Editor
   - Comprehensive database check
   - Shows detailed status of all components

## 🚨 Troubleshooting

### Common Issues

**"Missing tables" error**
- Run migrations in correct order (001 → 007)
- Check for SQL errors in Supabase dashboard

**"No default roles found"**
- Make sure migration 002 ran successfully
- Check roles table has 6 entries

**"Database connection failed"**
- Verify environment variables are correct
- Check Supabase project is active
- Restart your development server

**"Permission denied" errors**
- RLS policies may not be set up correctly
- Run migrations 003 and 005 again
- Check user has proper role assigned

### Getting Help

1. Check the Database Status component in `/admin`
2. Run the verification script in Supabase SQL Editor
3. Check browser console for specific error messages
4. Verify all environment variables are set correctly

## ✅ Success Indicators

When everything is working correctly:

1. **Database Status** shows all green checkmarks ✅
2. **Application starts** without database errors
3. **Admin page loads** and shows system information
4. **User can sign up** and be assigned a role
5. **Navigation works** based on user permissions

## 🎯 Next Steps

Once database is set up:

1. **Create admin user**: Sign up and assign yourself admin role
2. **Test lead management**: Go to `/leads` page
3. **Create test data**: Add some leads and contacts
4. **Explore features**: Try different user roles and permissions

Your CRM database will be enterprise-ready with comprehensive lead management, user roles, and security! 🚀