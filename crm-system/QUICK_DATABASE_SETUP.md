# 🚀 Quick Database Setup

## Step 1: Go to Supabase Dashboard
1. Open [supabase.com](https://supabase.com)
2. Go to your project
3. Click "SQL Editor" in the sidebar

## Step 2: Run Migrations (IN ORDER!)

Copy and paste each file content into SQL Editor and click "Run":

### 1️⃣ First: `001_create_roles_and_permissions.sql`
### 2️⃣ Second: `002_insert_default_roles.sql`  
### 3️⃣ Third: `003_create_rls_policies.sql`
### 4️⃣ Fourth: `004_create_crm_entities.sql`
### 5️⃣ Fifth: `005_create_crm_rls_policies.sql`
### 6️⃣ Sixth: `006_enhance_user_management.sql`
### 7️⃣ Seventh: `007_enhance_leads_management.sql`

## Step 3: Verify Setup

Run the verification script:
```sql
-- Copy content from scripts/verify-database.sql
```

## Step 4: Update Environment

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## ✅ Success!

If verification shows all ✅ PASS, your database is ready!

You should have:
- 20+ tables created
- 6 default roles
- 10+ lead sources  
- 10+ scoring rules
- 13+ database functions
- RLS enabled on all tables

## 🎯 Next Steps

1. Start your app: `npm run dev`
2. Sign up for an account
3. Go to `/admin` to manage users
4. Go to `/leads` to start managing leads

Your CRM is ready to use! 🎉