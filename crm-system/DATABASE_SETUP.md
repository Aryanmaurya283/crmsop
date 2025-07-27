# 🗄️ CRM System Database Setup Guide

## Overview

This guide will help you set up the complete database schema for the CRM system using Supabase. The database includes comprehensive tables for user management, lead management, contacts, deals, projects, and more.

## 📋 Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Environment Variables**: Update your `.env` file with Supabase credentials

## 🚀 Step-by-Step Setup

### Step 1: Update Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Step 2: Run Database Migrations

Go to your Supabase dashboard → SQL Editor and run these migrations **IN ORDER**:

#### Migration 1: Create Roles and Permissions
```sql
-- Copy and paste the content from: supabase/migrations/001_create_roles_and_permissions.sql
```

#### Migration 2: Insert Default Roles
```sql
-- Copy and paste the content from: supabase/migrations/002_insert_default_roles.sql
```

#### Migration 3: Create RLS Policies
```sql
-- Copy and paste the content from: supabase/migrations/003_create_rls_policies.sql
```

#### Migration 4: Create CRM Entities
```sql
-- Copy and paste the content from: supabase/migrations/004_create_crm_entities.sql
```

#### Migration 5: Create CRM RLS Policies
```sql
-- Copy and paste the content from: supabase/migrations/005_create_crm_rls_policies.sql
```

#### Migration 6: Enhance User Management
```sql
-- Copy and paste the content from: supabase/migrations/006_enhance_user_management.sql
```

#### Migration 7: Enhance Leads Management
```sql
-- Copy and paste the content from: supabase/migrations/007_enhance_leads_management.sql
```

## 📊 Database Schema Overview

After running all migrations, you'll have the following tables:

### Core Tables
- **users** - User profiles and authentication
- **roles** - User roles and permissions
- **teams** - Team organization
- **user_sessions** - Session tracking
- **user_activity_log** - Activity audit trail
- **user_preferences** - User settings
- **team_memberships** - Team assignments
- **user_skills** - User competencies
- **user_territories** - Sales territories

### CRM Tables
- **leads** - Lead management with scoring
- **lead_sources** - Lead source tracking
- **lead_campaigns** - Marketing campaigns
- **lead_activities** - Lead interaction history
- **lead_scoring_rules** - Scoring configuration
- **lead_assignments** - Lead assignment tracking
- **accounts** - Company/organization records
- **contacts** - Individual contact records
- **deals** - Sales opportunities
- **projects** - Project management
- **activities** - General activity tracking

## 🔧 Verification Steps

### Step 1: Check Tables Created
Run this query in Supabase SQL Editor to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- accounts
- activities
- contacts
- deals
- lead_activities
- lead_assignments
- lead_campaigns
- lead_scoring_rules
- lead_sources
- leads
- projects
- roles
- team_memberships
- teams
- user_activity_log
- user_preferences
- user_sessions
- user_skills
- user_territories
- users

### Step 2: Check Default Data
Verify default roles exist:

```sql
SELECT name, description FROM roles ORDER BY name;
```

Expected roles:
- admin
- customer
- sales_executive
- sales_manager
- super_admin
- support_agent

Verify default lead sources exist:

```sql
SELECT name, category FROM lead_sources ORDER BY name;
```

Expected sources:
- Cold Calling
- Content Marketing
- Email Campaign
- Facebook Ads
- Google Ads
- LinkedIn
- Referral
- Social Media
- Trade Show
- Website Form

### Step 3: Check Functions
Verify database functions exist:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

Expected functions:
- assign_lead_auto
- calculate_lead_score
- can_access_record
- convert_lead
- get_user_profile
- get_user_role
- get_user_teams
- is_team_manager
- log_user_activity
- set_current_user_id
- update_updated_at_column
- update_user_activity
- user_has_permission

### Step 4: Test RLS Policies
Check that Row Level Security is enabled:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

## 🔐 Security Configuration

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Allow users to access their own data
- Allow managers to access team data
- Allow admins to access all data
- Enforce permission-based access control

### Functions Security
All functions are marked as `SECURITY DEFINER` to ensure proper permission checking.

## 🧪 Test Data (Optional)

You can add test data to verify everything works:

### Create Test User
```sql
INSERT INTO users (clerk_user_id, email, first_name, last_name, role_id)
VALUES (
  'test_user_123',
  'test@example.com',
  'Test',
  'User',
  (SELECT id FROM roles WHERE name = 'sales_executive')
);
```

### Create Test Lead
```sql
INSERT INTO leads (
  email, first_name, last_name, company, phone, source, status, owner_id
) VALUES (
  'john.doe@example.com',
  'John',
  'Doe',
  'Example Corp',
  '+1-555-0123',
  'Website Form',
  'new',
  (SELECT id FROM users WHERE email = 'test@example.com')
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Migration Order**: Always run migrations in the correct order (001 → 007)
2. **Permissions**: Make sure you're running as the database owner
3. **Dependencies**: Some migrations depend on previous ones
4. **RLS Policies**: If you get permission errors, check RLS policies

### Error Solutions

**"relation does not exist"**
- Run earlier migrations first
- Check table names for typos

**"permission denied"**
- Check RLS policies
- Verify user roles are assigned correctly

**"function does not exist"**
- Run the migration that creates the function
- Check function names for typos

## ✅ Success Checklist

- [ ] All 7 migrations run successfully
- [ ] All 20+ tables created
- [ ] Default roles inserted (6 roles)
- [ ] Default lead sources inserted (10 sources)
- [ ] Default scoring rules inserted (10 rules)
- [ ] All database functions created (13+ functions)
- [ ] RLS enabled on all tables
- [ ] Test queries work without errors
- [ ] Environment variables updated
- [ ] Application connects to database

## 🎯 Next Steps

Once the database is set up:

1. **Test Connection**: Start your application and verify it connects
2. **Create Admin User**: Sign up and assign yourself admin role
3. **Test Permissions**: Try accessing different pages with different roles
4. **Add Test Data**: Create some test leads and contacts
5. **Verify Features**: Test lead creation, assignment, and conversion

Your CRM database is now ready for full functionality! 🎉