-- Enable Row Level Security on CRM tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns or can access record
CREATE OR REPLACE FUNCTION can_access_record(
    user_clerk_id TEXT,
    record_owner_id UUID,
    resource TEXT,
    action TEXT
)
RETURNS BOOLEAN AS 
DECLARE
    user_uuid UUID;
    user_team_id UUID;
    owner_team_id UUID;
    user_role TEXT;
BEGIN
    -- Get user information
    SELECT u.id, u.team_id INTO user_uuid, user_team_id
    FROM users u
    WHERE u.clerk_user_id = user_clerk_id;
    
    -- Get user role
    user_role := get_user_role(user_clerk_id);
    
    -- Super admin and admin can access everything
    IF user_role IN ('super_admin', 'admin') THEN
        RETURN user_has_permission(user_clerk_id, resource, action);
    END IF;
    
    -- User owns the record
    IF user_uuid = record_owner_id THEN
        RETURN user_has_permission(user_clerk_id, resource, action);
    END IF;
    
    -- Sales managers can access team records
    IF user_role = 'sales_manager' AND user_has_permission(user_clerk_id, resource, action) THEN
        SELECT u.team_id INTO owner_team_id
        FROM users u
        WHERE u.id = record_owner_id;
        
        RETURN user_team_id = owner_team_id;
    END IF;
    
    -- Default deny
    RETURN false;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for leads table
CREATE POLICY "Users can read accessible leads" ON leads
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'leads',
            'read'
        )
    );

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'leads',
            'create'
        )
    );

CREATE POLICY "Users can update accessible leads" ON leads
    FOR UPDATE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'leads',
            'update'
        )
    );

CREATE POLICY "Users can delete accessible leads" ON leads
    FOR DELETE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'leads',
            'delete'
        )
    );

-- RLS Policies for accounts table
CREATE POLICY "Users can read accessible accounts" ON accounts
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'accounts',
            'read'
        )
    );

CREATE POLICY "Users can create accounts" ON accounts
    FOR INSERT WITH CHECK (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'accounts',
            'create'
        )
    );

CREATE POLICY "Users can update accessible accounts" ON accounts
    FOR UPDATE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'accounts',
            'update'
        )
    );

CREATE POLICY "Users can delete accessible accounts" ON accounts
    FOR DELETE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'accounts',
            'delete'
        )
    );

-- RLS Policies for contacts table
CREATE POLICY "Users can read accessible contacts" ON contacts
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'contacts',
            'read'
        )
        OR
        -- Users can read contacts from accounts they own
        account_id IN (
            SELECT id FROM accounts 
            WHERE can_access_record(
                current_setting('request.jwt.claims', true)::json->>'sub',
                owner_id,
                'accounts',
                'read'
            )
        )
    );

CREATE POLICY "Users can create contacts" ON contacts
    FOR INSERT WITH CHECK (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'contacts',
            'create'
        )
        AND
        -- Can only create contacts for accessible accounts
        (account_id IS NULL OR account_id IN (
            SELECT id FROM accounts 
            WHERE can_access_record(
                current_setting('request.jwt.claims', true)::json->>'sub',
                owner_id,
                'accounts',
                'read'
            )
        ))
    );

CREATE POLICY "Users can update accessible contacts" ON contacts
    FOR UPDATE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'contacts',
            'update'
        )
    );

CREATE POLICY "Users can delete accessible contacts" ON contacts
    FOR DELETE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'contacts',
            'delete'
        )
    );

-- RLS Policies for deals table
CREATE POLICY "Users can read accessible deals" ON deals
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'deals',
            'read'
        )
    );

CREATE POLICY "Users can create deals" ON deals
    FOR INSERT WITH CHECK (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'deals',
            'create'
        )
        AND
        -- Can only create deals for accessible accounts
        (account_id IS NULL OR account_id IN (
            SELECT id FROM accounts 
            WHERE can_access_record(
                current_setting('request.jwt.claims', true)::json->>'sub',
                owner_id,
                'accounts',
                'read'
            )
        ))
    );

CREATE POLICY "Users can update accessible deals" ON deals
    FOR UPDATE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'deals',
            'update'
        )
    );

CREATE POLICY "Users can delete accessible deals" ON deals
    FOR DELETE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'deals',
            'delete'
        )
    );

-- RLS Policies for projects table
CREATE POLICY "Users can read accessible projects" ON projects
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'projects',
            'read'
        )
        OR
        -- Users can read projects from deals they own
        deal_id IN (
            SELECT id FROM deals 
            WHERE can_access_record(
                current_setting('request.jwt.claims', true)::json->>'sub',
                owner_id,
                'deals',
                'read'
            )
        )
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'projects',
            'create'
        )
    );

CREATE POLICY "Users can update accessible projects" ON projects
    FOR UPDATE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'projects',
            'update'
        )
    );

CREATE POLICY "Users can delete accessible projects" ON projects
    FOR DELETE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'projects',
            'delete'
        )
    );

-- RLS Policies for activities table
CREATE POLICY "Users can read accessible activities" ON activities
    FOR SELECT USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'activities',
            'read'
        )
        OR
        -- Users can read activities related to their records
        (
            (related_to_type = 'lead' AND related_to_id IN (
                SELECT id FROM leads 
                WHERE can_access_record(
                    current_setting('request.jwt.claims', true)::json->>'sub',
                    owner_id,
                    'leads',
                    'read'
                )
            ))
            OR
            (related_to_type = 'contact' AND related_to_id IN (
                SELECT id FROM contacts 
                WHERE can_access_record(
                    current_setting('request.jwt.claims', true)::json->>'sub',
                    owner_id,
                    'contacts',
                    'read'
                )
            ))
            OR
            (related_to_type = 'deal' AND related_to_id IN (
                SELECT id FROM deals 
                WHERE can_access_record(
                    current_setting('request.jwt.claims', true)::json->>'sub',
                    owner_id,
                    'deals',
                    'read'
                )
            ))
            OR
            (related_to_type = 'project' AND related_to_id IN (
                SELECT id FROM projects 
                WHERE can_access_record(
                    current_setting('request.jwt.claims', true)::json->>'sub',
                    owner_id,
                    'projects',
                    'read'
                )
            ))
        )
    );

CREATE POLICY "Users can create activities" ON activities
    FOR INSERT WITH CHECK (
        user_has_permission(
            current_setting('request.jwt.claims', true)::json->>'sub',
            'activities',
            'create'
        )
    );

CREATE POLICY "Users can update accessible activities" ON activities
    FOR UPDATE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'activities',
            'update'
        )
    );

CREATE POLICY "Users can delete accessible activities" ON activities
    FOR DELETE USING (
        can_access_record(
            current_setting('request.jwt.claims', true)::json->>'sub',
            owner_id,
            'activities',
            'delete'
        )
    );