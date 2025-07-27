// Supabase database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          image_url: string | null;
          role_id: string | null;
          team_id: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          role_id?: string | null;
          team_id?: string | null;
          is_active?: boolean;
          last_login?: string | null;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: Record<string, any>;
          is_system_role: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions: Record<string, any>;
          is_system_role?: boolean;
        };
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          manager_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['teams']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          phone: string | null;
          source: string | null;
          lead_source_detail: string | null;
          industry: string | null;
          company_size: string | null;
          annual_revenue: number | null;
          website: string | null;
          linkedin_url: string | null;
          address: Record<string, any>;
          status: string;
          qualification_status: string;
          lead_temperature: string;
          score: number;
          expected_close_date: string | null;
          estimated_value: number | null;
          last_contact_date: string | null;
          next_follow_up: string | null;
          conversion_date: string | null;
          converted_to_contact_id: string | null;
          converted_to_account_id: string | null;
          converted_to_deal_id: string | null;
          tags: any[];
          custom_fields: Record<string, any>;
          notes: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          phone?: string | null;
          source?: string | null;
          lead_source_detail?: string | null;
          industry?: string | null;
          company_size?: string | null;
          annual_revenue?: number | null;
          website?: string | null;
          linkedin_url?: string | null;
          address?: Record<string, any>;
          status?: string;
          qualification_status?: string;
          lead_temperature?: string;
          score?: number;
          expected_close_date?: string | null;
          estimated_value?: number | null;
          last_contact_date?: string | null;
          next_follow_up?: string | null;
          tags?: any[];
          custom_fields?: Record<string, any>;
          notes?: string | null;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      lead_sources: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          is_active: boolean;
          cost_per_lead: number | null;
          conversion_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string;
          is_active?: boolean;
          cost_per_lead?: number | null;
          conversion_rate?: number | null;
        };
        Update: Partial<Database['public']['Tables']['lead_sources']['Insert']>;
      };
      lead_scoring_rules: {
        Row: {
          id: string;
          rule_name: string;
          rule_type: string;
          condition_field: string;
          condition_operator: string;
          condition_value: string;
          score_points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rule_name: string;
          rule_type: string;
          condition_field: string;
          condition_operator: string;
          condition_value: string;
          score_points: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['lead_scoring_rules']['Insert']>;
      };
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          activity_type: string;
          subject: string;
          description: string | null;
          activity_date: string;
          duration_minutes: number | null;
          outcome: string | null;
          next_action: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          activity_type: string;
          subject: string;
          description?: string | null;
          activity_date?: string;
          duration_minutes?: number | null;
          outcome?: string | null;
          next_action?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['lead_activities']['Insert']>;
      };
      lead_assignments: {
        Row: {
          id: string;
          lead_id: string;
          assigned_to: string | null;
          assigned_by: string | null;
          assignment_reason: string | null;
          assigned_at: string;
          is_current: boolean;
        };
        Insert: {
          id?: string;
          lead_id: string;
          assigned_to?: string | null;
          assigned_by?: string | null;
          assignment_reason?: string | null;
          assigned_at?: string;
          is_current?: boolean;
        };
        Update: Partial<Database['public']['Tables']['lead_assignments']['Insert']>;
      };
      accounts: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          website: string | null;
          phone: string | null;
          billing_address: Record<string, any> | null;
          shipping_address: Record<string, any> | null;
          annual_revenue: number | null;
          employee_count: number | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          billing_address?: Record<string, any> | null;
          shipping_address?: Record<string, any> | null;
          annual_revenue?: number | null;
          employee_count?: number | null;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>;
      };
      contacts: {
        Row: {
          id: string;
          account_id: string | null;
          email: string | null;
          first_name: string;
          last_name: string;
          title: string | null;
          phone: string | null;
          mobile: string | null;
          is_primary: boolean;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          email?: string | null;
          first_name: string;
          last_name: string;
          title?: string | null;
          phone?: string | null;
          mobile?: string | null;
          is_primary?: boolean;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
      };
      deals: {
        Row: {
          id: string;
          name: string;
          account_id: string | null;
          contact_id: string | null;
          amount: number | null;
          currency: string;
          stage: string;
          probability: number;
          expected_close_date: string | null;
          actual_close_date: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          account_id?: string | null;
          contact_id?: string | null;
          amount?: number | null;
          currency?: string;
          stage?: string;
          probability?: number;
          expected_close_date?: string | null;
          actual_close_date?: string | null;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['deals']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          account_id: string | null;
          deal_id: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          account_id?: string | null;
          deal_id?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      activities: {
        Row: {
          id: string;
          type: string;
          subject: string;
          description: string | null;
          due_date: string | null;
          completed_at: string | null;
          related_to_type: string | null;
          related_to_id: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          subject: string;
          description?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          related_to_type?: string | null;
          related_to_id?: string | null;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['activities']['Insert']>;
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          ip_address: string | null;
          user_agent: string | null;
          is_active: boolean;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
          expires_at: string;
        };
        Update: Partial<Database['public']['Tables']['user_sessions']['Insert']>;
      };
      user_activity_log: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          details: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_activity_log']['Insert']>;
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          notifications: Record<string, any>;
          dashboard_layout: Record<string, any>;
          default_filters: Record<string, any>;
          timezone: string;
          language: string;
          date_format: string;
          time_format: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          notifications?: Record<string, any>;
          dashboard_layout?: Record<string, any>;
          default_filters?: Record<string, any>;
          timezone?: string;
          language?: string;
          date_format?: string;
          time_format?: string;
          currency?: string;
        };
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>;
      };
      team_memberships: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          role: string;
          joined_at: string;
          left_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          role?: string;
          joined_at?: string;
          left_at?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['team_memberships']['Insert']>;
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_name: string;
          skill_level: string;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_name: string;
          skill_level?: string;
          verified_by?: string | null;
          verified_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_skills']['Insert']>;
      };
      user_territories: {
        Row: {
          id: string;
          user_id: string;
          territory_name: string;
          territory_type: string;
          territory_data: Record<string, any>;
          is_primary: boolean;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          territory_name: string;
          territory_type?: string;
          territory_data?: Record<string, any>;
          is_primary?: boolean;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_territories']['Insert']>;
      };
      lead_sources: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          is_active: boolean;
          cost_per_lead: number | null;
          conversion_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string;
          is_active?: boolean;
          cost_per_lead?: number | null;
          conversion_rate?: number | null;
        };
        Update: Partial<Database['public']['Tables']['lead_sources']['Insert']>;
      };
      lead_campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          campaign_type: string;
          status: string;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          target_leads: number | null;
          actual_leads: number;
          cost_per_lead: number | null;
          conversion_rate: number | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          campaign_type?: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          target_leads?: number | null;
          actual_leads?: number;
          cost_per_lead?: number | null;
          conversion_rate?: number | null;
          owner_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['lead_campaigns']['Insert']>;
      };
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          activity_type: string;
          subject: string | null;
          description: string | null;
          outcome: string | null;
          duration_minutes: number | null;
          scheduled_at: string | null;
          completed_at: string | null;
          created_by: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          activity_type: string;
          subject?: string | null;
          description?: string | null;
          outcome?: string | null;
          duration_minutes?: number | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          metadata?: Record<string, any>;
        };
        Update: Partial<Database['public']['Tables']['lead_activities']['Insert']>;
      };
      lead_scoring_rules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          rule_type: string;
          condition_field: string;
          condition_operator: string;
          condition_value: string;
          score_points: number;
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          rule_type: string;
          condition_field: string;
          condition_operator: string;
          condition_value: string;
          score_points: number;
          is_active?: boolean;
          priority?: number;
        };
        Update: Partial<Database['public']['Tables']['lead_scoring_rules']['Insert']>;
      };
      lead_assignments: {
        Row: {
          id: string;
          lead_id: string;
          assigned_to: string | null;
          assigned_by: string | null;
          assignment_reason: string | null;
          assigned_at: string;
          accepted_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          lead_id: string;
          assigned_to?: string | null;
          assigned_by?: string | null;
          assignment_reason?: string | null;
          assigned_at?: string;
          accepted_at?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['lead_assignments']['Insert']>;
      };
    };
    Functions: {
      get_user_role: {
        Args: { user_clerk_id: string };
        Returns: string;
      };
      user_has_permission: {
        Args: { 
          user_clerk_id: string;
          resource: string;
          action: string;
        };
        Returns: boolean;
      };
      get_user_team_id: {
        Args: { user_clerk_id: string };
        Returns: string;
      };
      is_team_manager: {
        Args: { 
          user_clerk_id: string;
          team_uuid: string;
        };
        Returns: boolean;
      };
      set_current_user_id: {
        Args: { user_clerk_id: string };
        Returns: void;
      };
      can_access_record: {
        Args: {
          user_clerk_id: string;
          record_owner_id: string;
          resource: string;
          action: string;
        };
        Returns: boolean;
      };
      log_user_activity: {
        Args: {
          p_user_id: string;
          p_action: string;
          p_resource_type?: string;
          p_resource_id?: string;
          p_details?: Record<string, any>;
          p_ip_address?: string;
          p_user_agent?: string;
        };
        Returns: string;
      };
      get_user_teams: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          team_id: string;
          team_name: string;
          team_description: string;
          membership_role: string;
          is_manager: boolean;
        }[];
      };
      get_user_profile: {
        Args: {
          p_clerk_user_id: string;
        };
        Returns: {
          user_id: string;
          clerk_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          mobile: string;
          title: string;
          department: string;
          image_url: string;
          role_name: string;
          role_permissions: Record<string, any>;
          team_name: string;
          preferences: Record<string, any>;
          is_active: boolean;
          last_login: string;
          last_activity: string;
          hire_date: string;
        };
      };
      update_user_activity: {
        Args: {
          p_clerk_user_id: string;
        };
        Returns: void;
      };
      calculate_lead_score: {
        Args: {
          p_lead_id: string;
        };
        Returns: number;
      };
      convert_lead: {
        Args: {
          p_lead_id: string;
          p_create_contact?: boolean;
          p_create_account?: boolean;
          p_create_deal?: boolean;
          p_deal_name?: string;
          p_deal_amount?: number;
        };
        Returns: Record<string, any>;
      };
      assign_lead: {
        Args: {
          p_lead_id: string;
          p_assigned_to: string;
          p_assigned_by: string;
          p_reason?: string;
        };
        Returns: boolean;
      };
      assign_lead_auto: {
        Args: {
          p_lead_id: string;
        };
        Returns: string;
      };
    };
  };
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T];