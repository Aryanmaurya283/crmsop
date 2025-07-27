-- Enable Row Level Security on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_clerk_id TEXT)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT r.name INTO user_role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.clerk_user_id = user_clerk_id;
    
    RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    user_clerk_id TEXT,
    resource TEXT,
    action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    SELECT COALESCE(
        (r.permissions->resource->>action)::boolean,
        false
    ) INTO has_permission
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.clerk_user_id = user_clerk_id;
    
    RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's team_id
CREATE OR REPLACE FUNCTION get_user_team_id(user_clerk_id TEXT)
RETURNS UUID AS $$
DECLARE
    team_id UUID;
BEGIN
    SELECT u.team_id INTO team_id
    FROM users u
    WHERE u.clerk_user_id = user_clerk_id;
    
    RETURN team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is team manager
CREATE OR REPLACE FUNCTION is_team_manager(user_clerk_id TEXT, team_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
    is_manager BOOLEAN := false;
BEGIN
    SELECT u.id INTO user_uuid
    FROM users u
    WHERE u.clerk_user_id = user_clerk_id;
    
    SELECT (t.manager_id = user_uuid) INTO is_manager
    FROM teams t
    WHERE t.id = team_uuid;
    
    RETURN COALESCE(is_manager, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for roles table
CREATE POLICY "Users can read roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Super admins can manage roles" ON roles
    FOR ALL USING (
        get_user_role(current_setting('request.jwt.claims', true)::json->>'sub') = 'super_admin'
    );

-- RLS Policies for teams table
CREATE POLICY "Users can read their team" ON teams
    FOR SELECT USING (
        id = get_user_team_id(current_setting('request.jwt.claims', true)::json->>'sub')
        OR user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'teams',
            'read'
        )
    );

CREATE POLICY "Admins can manage teams" ON teams
    FOR ALL USING (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'teams',
            'create'
        )
    );

-- RLS Policies for users table
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (
        clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );

CREATE POLICY "Users can read team members" ON users
    FOR SELECT USING (
        team_id = get_user_team_id(current_setting('request.jwt.claims', true)::json->>'sub')
        AND user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'read'
        )
    );

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'read'
        )
    );

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (
        clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'create'
        )
    );

-- Create a function to set the current user context
CREATE OR REPLACE FUNCTION set_current_user_id(user_clerk_id TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_clerk_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;