-- ================================
-- Enhance leads table and related features
-- ================================

-- Add additional lead fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source_detail VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS social_profiles JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature VARCHAR(20) DEFAULT 'cold';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_contact_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_account_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_deal_id UUID;

-- ================================
-- Lead Sources
-- ================================
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- Required for ON CONFLICT
    description TEXT,
    category VARCHAR(50) DEFAULT 'other',
    is_active BOOLEAN DEFAULT true,
    cost_per_lead DECIMAL(10,2),
    conversion_rate DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Lead Campaigns
-- ================================
CREATE TABLE IF NOT EXISTS lead_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    target_leads INTEGER,
    actual_leads INTEGER DEFAULT 0,
    cost_per_lead DECIMAL(10,2),
    conversion_rate DECIMAL(5,2),
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Lead Activities
-- ================================
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(100),
    duration_minutes INTEGER,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Lead Scoring Rules
-- ================================
CREATE TABLE IF NOT EXISTS lead_scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    condition_field VARCHAR(100) NOT NULL,
    condition_operator VARCHAR(20) NOT NULL,
    condition_value TEXT NOT NULL,
    score_points INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Lead Assignments
-- ================================
CREATE TABLE IF NOT EXISTS lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    assignment_reason VARCHAR(100),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- ================================
-- Foreign Key Constraints
-- ================================
ALTER TABLE leads
    ADD CONSTRAINT fk_leads_campaign FOREIGN KEY (campaign_id)
    REFERENCES lead_campaigns(id);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_converted_at ON leads(converted_at);

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER update_lead_sources_updated_at
    BEFORE UPDATE ON lead_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_campaigns_updated_at
    BEFORE UPDATE ON lead_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_scoring_rules_updated_at
    BEFORE UPDATE ON lead_scoring_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Default Inserts
-- ================================
INSERT INTO lead_sources (name, description, category) VALUES
('Website Form', 'Leads from website contact forms', 'website'),
('Social Media', 'Leads from social media platforms', 'social'),
('Google Ads', 'Leads from Google advertising campaigns', 'advertising'),
('Facebook Ads', 'Leads from Facebook advertising', 'advertising'),
('LinkedIn', 'Leads from LinkedIn outreach', 'social'),
('Referral', 'Leads from customer referrals', 'referral'),
('Trade Show', 'Leads from trade shows and events', 'event'),
('Cold Calling', 'Leads from cold calling campaigns', 'other'),
('Email Campaign', 'Leads from email marketing', 'other'),
('Content Marketing', 'Leads from blog posts and content', 'website')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lead_scoring_rules (
    name, description, rule_type, condition_field,
    condition_operator, condition_value, score_points
) VALUES
('Company Size - Large', 'Large companies (500+ employees)', 'firmographic', 'employee_count', 'greater_than', '500', 20),
('Company Size - Medium', 'Medium companies (50-500 employees)', 'firmographic', 'employee_count', 'between', '50,500', 10),
('High Revenue', 'Companies with high annual revenue', 'firmographic', 'annual_revenue', 'greater_than', '10000000', 15),
('Website Visit', 'Visited company website', 'behavioral', 'activity_type', 'equals', 'website_visit', 5),
('Email Opened', 'Opened marketing email', 'engagement', 'activity_type', 'equals', 'email_opened', 3),
('Form Submitted', 'Submitted contact form', 'behavioral', 'activity_type', 'equals', 'form_submit', 10),
('Demo Requested', 'Requested product demo', 'behavioral', 'activity_type', 'equals', 'demo_request', 25),
('Pricing Page Visit', 'Visited pricing page', 'behavioral', 'activity_type', 'equals', 'pricing_visit', 8),
('Multiple Page Views', 'Viewed multiple pages in session', 'behavioral', 'page_views', 'greater_than', '3', 5),
('Return Visitor', 'Returned to website multiple times', 'behavioral', 'visit_count', 'greater_than', '1', 7)
ON CONFLICT (name) DO NOTHING;