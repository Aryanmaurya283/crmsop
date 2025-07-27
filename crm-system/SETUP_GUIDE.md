# CRM System Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

First, copy the environment variables:

```bash
cp .env.example .env
```

Then update `.env` with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Configuration  
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key

# Application Configuration
VITE_APP_NAME=CRM System
VITE_APP_VERSION=1.0.0
```

### 2. Database Setup

Run the Supabase migrations in order:

```bash
# In your Supabase SQL editor, run these files in order:
1. supabase/migrations/001_create_roles_and_permissions.sql
2. supabase/migrations/002_insert_default_roles.sql  
3. supabase/migrations/003_create_rls_policies.sql
4. supabase/migrations/004_create_crm_entities.sql
5. supabase/migrations/005_create_crm_rls_policies.sql
6. supabase/migrations/006_enhance_user_management.sql
```

### 3. Start the Application

```bash
npm install
npm run dev
```

## 📄 Available Pages & Access

### Public Pages
- **Sign In**: `/sign-in` - Clerk authentication
- **Sign Up**: `/sign-up` - User registration

### Protected Pages (require authentication)

#### 🏠 Dashboard (`/dashboard`)
- **Access**: All authenticated users
- **Features**: 
  - Welcome message with user role
  - Permission-based metric cards
  - Quick action buttons
  - User sync status

#### 👥 Leads (`/leads`)
- **Access**: Users with `leads.read` permission
- **Roles**: Sales Executive, Sales Manager, Admin, Super Admin
- **Status**: Basic structure (needs implementation)

#### 📞 Contacts (`/contacts`)
- **Access**: Users with `contacts.read` permission  
- **Roles**: Sales Executive, Sales Manager, Admin, Super Admin
- **Status**: Basic structure (needs implementation)

#### 💰 Deals (`/deals`)
- **Access**: Users with `deals.read` permission
- **Roles**: Sales Executive, Sales Manager, Admin, Super Admin
- **Status**: Basic structure (needs implementation)

#### 📋 Projects (`/projects`)
- **Access**: Users with `projects.read` permission
- **Roles**: Sales Manager (read-only), Admin, Super Admin
- **Status**: Basic structure (needs implementation)

#### 📊 Reports (`/reports`)
- **Access**: Users with `reports.read` permission
- **Roles**: Sales Manager (limited), Admin, Super Admin
- **Status**: Basic structure (needs implementation)

#### ⚙️ Admin (`/admin`)
- **Access**: Admin and Super Admin only
- **Features**:
  - User management table
  - Role assignment interface
  - System information
  - Quick stats dashboard

## 🔐 User Roles & Permissions

### Super Admin
- Full system access
- Can manage users, roles, and all data
- Access to all pages and features

### Admin  
- Operational access to most features
- Can manage users but not delete them
- Cannot modify system roles
- Access to all CRM pages

### Sales Manager
- Team-level access to sales data
- Can view and manage team members' records
- Limited reporting access
- Access: Dashboard, Leads, Contacts, Deals, Projects (read-only), Reports

### Sales Executive
- Individual access to own records
- Can create and manage leads, contacts, accounts, deals
- Limited project and report access
- Access: Dashboard, Leads, Contacts, Deals, Projects (read-only), Reports (limited)

### Support Agent
- Customer service focused permissions
- Can view and update customer records
- Access: Dashboard, Contacts, Projects (customer projects)

### Customer
- Portal access only (separate interface)
- Can view own projects and tickets
- Cannot access internal CRM pages

## 🧭 Navigation

The application uses a sidebar navigation with:

- **Logo**: "CRM System" at the top
- **Menu Items**: Dashboard, Leads, Contacts, Deals, Projects, Reports
- **Admin Section**: Only visible to Admin/Super Admin users
- **Permission-based**: Menu items only show if user has required permissions
- **Active State**: Current page is highlighted

## 🔧 Development Status

### ✅ Completed Features
- Authentication system with Clerk
- Role-based access control with Supabase RLS
- User management and synchronization
- Permission system with guards
- Dashboard with role-based content
- Admin panel with user management
- Database schema with comprehensive tables
- Navigation with permission-based visibility

### 🚧 In Progress / Planned
- Lead management implementation
- Contact management implementation  
- Deal pipeline implementation
- Project management implementation
- Reporting and analytics implementation
- Customer portal interface

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Publishable Key" Error**
   - Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env`
   - Restart the dev server after updating `.env`

2. **"Missing Supabase environment variables" Error**
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Check that the Supabase project is active

3. **Permission Denied Errors**
   - Run the database migrations in the correct order
   - Make sure RLS policies are properly set up
   - Check that your user has been assigned a role

4. **Pages Not Loading**
   - Check that all required components are imported
   - Verify the user has the required permissions
   - Check browser console for JavaScript errors

### Getting Help

1. Check the browser console for error messages
2. Verify your `.env` file has all required variables
3. Ensure database migrations have been run
4. Check that your user account has the appropriate role assigned

## 🎯 Next Steps

1. **Set up your environment** following steps 1-3 above
2. **Create a test user** by signing up through `/sign-up`
3. **Assign admin role** to your user in Supabase dashboard
4. **Explore the admin panel** at `/admin`
5. **Start implementing** the CRM entity pages (leads, contacts, etc.)

The foundation is solid - authentication, permissions, and user management are fully functional. The next phase is implementing the core CRM functionality!