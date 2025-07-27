import { supabase } from '../supabase';
import type { Database } from '../supabase/types';

export type Lead = Database['public']['Tables']['leads']['Row'] & {
  lead_source?: Database['public']['Tables']['lead_sources']['Row'];
  campaign?: Database['public']['Tables']['lead_campaigns']['Row'];
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  activities?: Database['public']['Tables']['lead_activities']['Row'][];
};

export type LeadSource = Database['public']['Tables']['lead_sources']['Row'];
export type LeadCampaign = Database['public']['Tables']['lead_campaigns']['Row'];
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row'];
export type LeadScoringRule = Database['public']['Tables']['lead_scoring_rules']['Row'];

export interface CreateLeadData {
  email?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  source?: string;
  lead_source_detail?: string;
  campaign_id?: string;
  website?: string;
  industry?: string;
  annual_revenue?: number;
  employee_count?: number;
  address?: Record<string, any>;
  social_profiles?: Record<string, any>;
  tags?: string[];
  custom_fields?: Record<string, any>;
  temperature?: 'cold' | 'warm' | 'hot';
  notes?: string;
  owner_id?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: string;
  qualification_score?: number;
  next_follow_up?: string;
  last_contacted?: string;
}

export interface LeadFilters {
  status?: string[];
  source?: string[];
  temperature?: string[];
  owner_id?: string[];
  campaign_id?: string[];
  score_min?: number;
  score_max?: number;
  created_after?: string;
  created_before?: string;
  search?: string;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  conversionRate: number;
  averageScore: number;
}

export class LeadService {
  /**
   * Get all leads with filters and pagination
   */
  static async getLeads(
    filters: LeadFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{ leads: Lead[]; total: number }> {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          lead_source:lead_sources(name, category),
          campaign:lead_campaigns(name, campaign_type),
          owner:users(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.source?.length) {
        query = query.in('source', filters.source);
      }
      if (filters.temperature?.length) {
        query = query.in('temperature', filters.temperature);
      }
      if (filters.owner_id?.length) {
        query = query.in('owner_id', filters.owner_id);
      }
      if (filters.campaign_id?.length) {
        query = query.in('campaign_id', filters.campaign_id);
      }
      if (filters.score_min !== undefined) {
        query = query.gte('qualification_score', filters.score_min);
      }
      if (filters.score_max !== undefined) {
        query = query.lte('qualification_score', filters.score_max);
      }
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching leads:', error);
        return { leads: [], total: 0 };
      }

      return { leads: data as Lead[] || [], total: count || 0 };
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      return { leads: [], total: 0 };
    }
  }

  /**
   * Get a single lead by ID
   */
  static async getLead(id: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_source:lead_sources(name, category),
          campaign:lead_campaigns(name, campaign_type),
          owner:users(id, first_name, last_name, email),
          activities:lead_activities(
            id, activity_type, subject, description, outcome,
            duration_minutes, scheduled_at, completed_at, created_at,
            created_by:users(first_name, last_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching lead:', error);
        return null;
      }

      return data as Lead;
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      return null;
    }
  }

  /**
   * Create a new lead
   */
  static async createLead(leadData: CreateLeadData): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          status: 'new',
          qualification_score: 0,
        })
        .select(`
          *,
          lead_source:lead_sources(name, category),
          campaign:lead_campaigns(name, campaign_type),
          owner:users(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        return null;
      }

      // Auto-assign if no owner specified
      if (!leadData.owner_id && data) {
        await this.autoAssignLead(data.id);
      }

      // Calculate initial score
      if (data) {
        await this.calculateLeadScore(data.id);
      }

      return data as Lead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      return null;
    }
  }

  /**
   * Update a lead
   */
  static async updateLead(id: string, updates: UpdateLeadData): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          lead_source:lead_sources(name, category),
          campaign:lead_campaigns(name, campaign_type),
          owner:users(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating lead:', error);
        return null;
      }

      // Recalculate score if relevant fields changed
      if (updates.annual_revenue || updates.employee_count || updates.industry) {
        await this.calculateLeadScore(id);
      }

      return data as Lead;
    } catch (error) {
      console.error('Failed to update lead:', error);
      return null;
    }
  }

  /**
   * Delete a lead
   */
  static async deleteLead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lead:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete lead:', error);
      return false;
    }
  }

  /**
   * Calculate lead score
   */
  static async calculateLeadScore(leadId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_lead_score', {
        p_lead_id: leadId,
      });

      if (error) {
        console.error('Error calculating lead score:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Failed to calculate lead score:', error);
      return 0;
    }
  }

  /**
   * Auto-assign lead using round-robin
   */
  static async autoAssignLead(leadId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('assign_lead_auto', {
        p_lead_id: leadId,
      });

      if (error) {
        console.error('Error auto-assigning lead:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to auto-assign lead:', error);
      return null;
    }
  }

  /**
   * Convert lead to contact/account/deal
   */
  static async convertLead(
    leadId: string,
    options: {
      createContact?: boolean;
      createAccount?: boolean;
      createDeal?: boolean;
      dealAmount?: number;
    } = {}
  ): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('convert_lead', {
        p_lead_id: leadId,
        p_create_contact: options.createContact ?? true,
        p_create_account: options.createAccount ?? true,
        p_create_deal: options.createDeal ?? false,
        p_deal_amount: options.dealAmount,
      });

      if (error) {
        console.error('Error converting lead:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to convert lead:', error);
      return null;
    }
  }

  /**
   * Add activity to lead
   */
  static async addLeadActivity(
    leadId: string,
    activity: {
      activity_type: string;
      subject?: string;
      description?: string;
      outcome?: string;
      duration_minutes?: number;
      scheduled_at?: string;
      completed_at?: string;
      created_by?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<LeadActivity | null> {
    try {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          ...activity,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding lead activity:', error);
        return null;
      }

      // Update last contacted if it's a contact activity
      if (['call', 'email', 'meeting'].includes(activity.activity_type)) {
        await this.updateLead(leadId, {
          last_contacted: new Date().toISOString(),
        });
      }

      return data as LeadActivity;
    } catch (error) {
      console.error('Failed to add lead activity:', error);
      return null;
    }
  }

  /**
   * Get lead activities
   */
  static async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    try {
      const { data, error } = await supabase
        .from('lead_activities')
        .select(`
          *,
          created_by:users(first_name, last_name, email)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead activities:', error);
        return [];
      }

      return data as LeadActivity[] || [];
    } catch (error) {
      console.error('Failed to fetch lead activities:', error);
      return [];
    }
  }

  /**
   * Get lead sources
   */
  static async getLeadSources(): Promise<LeadSource[]> {
    try {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching lead sources:', error);
        return [];
      }

      return data as LeadSource[] || [];
    } catch (error) {
      console.error('Failed to fetch lead sources:', error);
      return [];
    }
  }

  /**
   * Get lead campaigns
   */
  static async getLeadCampaigns(): Promise<LeadCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('lead_campaigns')
        .select('*')
        .in('status', ['active', 'paused'])
        .order('name');

      if (error) {
        console.error('Error fetching lead campaigns:', error);
        return [];
      }

      return data as LeadCampaign[] || [];
    } catch (error) {
      console.error('Failed to fetch lead campaigns:', error);
      return [];
    }
  }

  /**
   * Get lead statistics
   */
  static async getLeadStats(
    filters: Omit<LeadFilters, 'search'> = {}
  ): Promise<LeadStats> {
    try {
      let query = supabase
        .from('leads')
        .select('id, status, source, qualification_score, created_at, converted_at');

      // Apply filters (same as getLeads but without search)
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.source?.length) {
        query = query.in('source', filters.source);
      }
      if (filters.temperature?.length) {
        query = query.in('temperature', filters.temperature);
      }
      if (filters.owner_id?.length) {
        query = query.in('owner_id', filters.owner_id);
      }
      if (filters.campaign_id?.length) {
        query = query.in('campaign_id', filters.campaign_id);
      }
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lead stats:', error);
        return this.getEmptyStats();
      }

      const leads = data || [];
      const totalLeads = leads.length;
      const newLeads = leads.filter(l => l.status === 'new').length;
      const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
      const convertedLeads = leads.filter(l => l.status === 'converted').length;

      // Group by source
      const leadsBySource: Record<string, number> = {};
      leads.forEach(lead => {
        const source = lead.source || 'unknown';
        leadsBySource[source] = (leadsBySource[source] || 0) + 1;
      });

      // Group by status
      const leadsByStatus: Record<string, number> = {};
      leads.forEach(lead => {
        const status = lead.status || 'unknown';
        leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
      });

      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const averageScore = leads.length > 0 
        ? leads.reduce((sum, lead) => sum + (lead.qualification_score || 0), 0) / leads.length 
        : 0;

      return {
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        leadsBySource,
        leadsByStatus,
        conversionRate,
        averageScore,
      };
    } catch (error) {
      console.error('Failed to fetch lead stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Bulk update leads
   */
  static async bulkUpdateLeads(
    leadIds: string[],
    updates: UpdateLeadData
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .in('id', leadIds);

      if (error) {
        console.error('Error bulk updating leads:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to bulk update leads:', error);
      return false;
    }
  }

  /**
   * Get leads assigned to user
   */
  static async getMyLeads(
    userId: string,
    filters: LeadFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{ leads: Lead[]; total: number }> {
    return this.getLeads(
      { ...filters, owner_id: [userId] },
      limit,
      offset
    );
  }

  private static getEmptyStats(): LeadStats {
    return {
      totalLeads: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      convertedLeads: 0,
      leadsBySource: {},
      leadsByStatus: {},
      conversionRate: 0,
      averageScore: 0,
    };
  }
}