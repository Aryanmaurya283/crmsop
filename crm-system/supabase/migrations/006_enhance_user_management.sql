-- Enhance user management with additional fields and functionality

-- Add additional user profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE;

-- Create user sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user preferences table for detailed settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    notifications JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "marketing": false
    }',
    dashboard_layout JSONB DEFAULT '{}',
    default_filters JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(10) DEFAULT '12h',
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create team membership table for flexible team assignments
CREATE TABLE IF NOT EXISTS team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- member, lead, manager
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, team_id)
);

-- Create user skills/competencies table
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced, expert
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_name)
);

-- Create user territories table for sales territory management
CREATE TABLE IF NOT EXISTS user_territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    territory_name VARCHAR(100) NOT NULL,
    territory_type VARCHAR(50) DEFAULT 'geographic', -- geographic, industry, account_size
    territory_data JSONB DEFAULT '{}', -- stores territory-specific data like zip codes, industries, etc.
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, territory_name)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);
CREATE INDEX IF NOT EXISTS idx_users_hire_date ON users(hire_date);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_resource ON user_activity_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_active ON team_memberships(is_active);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(skill_name);

CREATE INDEX IF NOT EXISTS idx_user_territories_user_id ON user_territories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_territories_type ON user_territories(territory_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_log (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO activity_id;
    
    -- Update user's last activity
    UPDATE users 
    SET last_activity = CURRENT_TIMESTAMP 
    WHERE id = p_user_id;
    
    RETURN activity_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's active teams
CREATE OR REPLACE FUNCTION get_user_teams(p_user_id UUID)
RETURNS TABLE (
    team_id UUID,
    team_name VARCHAR(100),
    team_description TEXT,
    membership_role VARCHAR(50),
    is_manager BOOLEAN
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.description,
        tm.role,
        (t.manager_id = p_user_id) as is_manager
    FROM teams t
    JOIN team_memberships tm ON t.id = tm.team_id
    WHERE tm.user_id = p_user_id 
    AND tm.is_active = true;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's full profile
CREATE OR REPLACE FUNCTION get_user_profile(p_clerk_user_id TEXT)
RETURNS TABLE (
    user_id UUID,
    clerk_user_id TEXT,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    title VARCHAR(100),
    department VARCHAR(100),
    image_url TEXT,
    role_name VARCHAR(50),
    role_permissions JSONB,
    team_name VARCHAR(100),
    preferences JSONB,
    is_active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    hire_date DATE
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.clerk_user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.mobile,
        u.title,
        u.department,
        u.image_url,
        r.name as role_name,
        r.permissions as role_permissions,
        t.name as team_name,
        up.notifications as preferences,
        u.is_active,
        u.last_login,
        u.last_activity,
        u.hire_date
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN teams t ON u.team_id = t.id
    LEFT JOIN user_preferences up ON u.id = up.user_id
    WHERE u.clerk_user_id = p_clerk_user_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user last activity
CREATE OR REPLACE FUNCTION update_user_activity(p_clerk_user_id TEXT)
RETURNS VOID AS $
BEGIN
    UPDATE users 
    SET last_activity = CURRENT_TIMESTAMP 
    WHERE clerk_user_id = p_clerk_user_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_territories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can read their own sessions" ON user_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

CREATE POLICY "Admins can read all sessions" ON user_sessions
    FOR SELECT USING (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'read'
        )
    );

-- RLS Policies for user_activity_log
CREATE POLICY "Users can read their own activity" ON user_activity_log
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

CREATE POLICY "Admins can read all activity" ON user_activity_log
    FOR SELECT USING (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'read'
        )
    );

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- RLS Policies for team_memberships
CREATE POLICY "Users can read team memberships" ON team_memberships
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
        OR
        team_id IN (
            SELECT team_id FROM team_memberships tm2
            JOIN users u ON tm2.user_id = u.id
            WHERE u.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            AND tm2.is_active = true
        )
        OR
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'teams',
            'read'
        )
    );

-- RLS Policies for user_skills
CREATE POLICY "Users can manage their own skills" ON user_skills
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
        OR
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'update'
        )
    );

-- RLS Policies for user_territories
CREATE POLICY "Users can read their own territories" ON user_territories
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
        OR
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'read'
        )
    );

CREATE POLICY "Managers can assign territories" ON user_territories
    FOR ALL USING (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'users',
            'update'
        )
    );