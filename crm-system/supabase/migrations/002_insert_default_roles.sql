-- Insert default system roles
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
(
    'super_admin',
    'Super Administrator with full system access',
    '{
        "users": {"create": true, "read": true, "update": true, "delete": true},
        "roles": {"create": true, "read": true, "update": true, "delete": true},
        "teams": {"create": true, "read": true, "update": true, "delete": true},
        "leads": {"create": true, "read": true, "update": true, "delete": true},
        "contacts": {"create": true, "read": true, "update": true, "delete": true},
        "accounts": {"create": true, "read": true, "update": true, "delete": true},
        "deals": {"create": true, "read": true, "update": true, "delete": true},
        "projects": {"create": true, "read": true, "update": true, "delete": true},
        "reports": {"create": true, "read": true, "update": true, "delete": true},
        "settings": {"create": true, "read": true, "update": true, "delete": true},
        "audit": {"read": true}
    }',
    true
),
(
    'admin',
    'Administrator with operational access',
    '{
        "users": {"create": true, "read": true, "update": true, "delete": false},
        "roles": {"create": false, "read": true, "update": false, "delete": false},
        "teams": {"create": true, "read": true, "update": true, "delete": true},
        "leads": {"create": true, "read": true, "update": true, "delete": true},
        "contacts": {"create": true, "read": true, "update": true, "delete": true},
        "accounts": {"create": true, "read": true, "update": true, "delete": true},
        "deals": {"create": true, "read": true, "update": true, "delete": true},
        "projects": {"create": true, "read": true, "update": true, "delete": true},
        "reports": {"create": true, "read": true, "update": true, "delete": false},
        "settings": {"create": false, "read": true, "update": true, "delete": false}
    }',
    true
),
(
    'sales_manager',
    'Sales Manager with team oversight',
    '{
        "users": {"create": false, "read": true, "update": false, "delete": false},
        "teams": {"create": false, "read": true, "update": false, "delete": false},
        "leads": {"create": true, "read": true, "update": true, "delete": false},
        "contacts": {"create": true, "read": true, "update": true, "delete": false},
        "accounts": {"create": true, "read": true, "update": true, "delete": false},
        "deals": {"create": true, "read": true, "update": true, "delete": false},
        "projects": {"create": false, "read": true, "update": true, "delete": false},
        "reports": {"create": false, "read": true, "update": false, "delete": false}
    }',
    true
),
(
    'sales_executive',
    'Sales Executive with individual access',
    '{
        "leads": {"create": true, "read": true, "update": true, "delete": false},
        "contacts": {"create": true, "read": true, "update": true, "delete": false},
        "accounts": {"create": true, "read": true, "update": true, "delete": false},
        "deals": {"create": true, "read": true, "update": true, "delete": false},
        "projects": {"create": false, "read": true, "update": false, "delete": false},
        "reports": {"create": false, "read": true, "update": false, "delete": false}
    }',
    true
),
(
    'support_agent',
    'Support Agent with customer service access',
    '{
        "contacts": {"create": false, "read": true, "update": true, "delete": false},
        "accounts": {"create": false, "read": true, "update": false, "delete": false},
        "projects": {"create": false, "read": true, "update": true, "delete": false},
        "tickets": {"create": true, "read": true, "update": true, "delete": false}
    }',
    true
),
(
    'customer',
    'Customer with portal access',
    '{
        "portal": {"read": true, "update": false},
        "tickets": {"create": true, "read": true, "update": false, "delete": false},
        "projects": {"create": false, "read": true, "update": false, "delete": false}
    }',
    true
);