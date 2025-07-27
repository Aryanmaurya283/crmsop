import { supabase } from '../supabase';
import type { Deal } from '../../types/deals';

export interface DealFilters {
  search?: string;
  stage?: string;
  account_id?: string;
  contact_id?: string;
  owner_id?: string;
  min_amount?: number;
  max_amount?: number;
  expected_close_date_from?: string;
  expected_close_date_to?: string;
}

export interface DealCreateData {
  name: string;
  account_id?: string;
  contact_id?: string;
  amount?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expected_close_date?: string;
}

export interface DealUpdateData extends Partial<DealCreateData> {}

export interface DealStats {
  totalDeals: number;
  totalValue: number;
  averageDealSize: number;
  winRate: number;
  stageBreakdown: Record<string, { count: number; value: number }>;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  probability: number;
}

export interface ForecastData {
  month: string;
  expectedRevenue: number;
  probability: number;
}

class DealService {
  async getDeals(filters: DealFilters = {}, page = 1, limit = 20): Promise<{ deals: Deal[], total: number }> {
    let query = supabase
      .from('deals')
      .select('*, accounts(name), contacts(first_name, last_name)', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%`);
    }
    if (filters.stage) {
      query = query.eq('stage', filters.stage);
    }
    if (filters.account_id) {
      query = query.eq('account_id', filters.account_id);
    }
    if (filters.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters.min_amount) {
      query = query.gte('amount', filters.min_amount);
    }
    if (filters.max_amount) {
      query = query.lte('amount', filters.max_amount);
    }
    if (filters.expected_close_date_from) {
      query = query.gte('expected_close_date', filters.expected_close_date_from);
    }
    if (filters.expected_close_date_to) {
      query = query.lte('expected_close_date', filters.expected_close_date_to);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    return {
      deals: data || [],
      total: count || 0
    };
  }

  async getDeal(id: string): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .select('*, accounts(*), contacts(*)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch deal: ${error.message}`);
    }

    return data;
  }

  async createDeal(dealData: DealCreateData, ownerId: string): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...dealData,
        owner_id: ownerId,
        stage: dealData.stage || 'prospecting',
        probability: dealData.probability || 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    return data;
  }

  async updateDeal(id: string, dealData: DealUpdateData): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update(dealData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    return data;
  }

  async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete deal: ${error.message}`);
    }
  }

  async updateDealStage(id: string, stage: string, probability?: number): Promise<Deal> {
    const updateData: DealUpdateData = { stage };
    if (probability !== undefined) {
      updateData.probability = probability;
    }

    return this.updateDeal(id, updateData);
  }

  async closeDeal(id: string, actualCloseDate?: string, finalAmount?: number): Promise<Deal> {
    const updateData: DealUpdateData = {
      stage: 'closed_won',
      probability: 100,
      actual_close_date: actualCloseDate || new Date().toISOString().split('T')[0]
    };

    if (finalAmount !== undefined) {
      updateData.amount = finalAmount;
    }

    return this.updateDeal(id, updateData);
  }

  async getDealsByAccount(accountId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch deals for account: ${error.message}`);
    }

    return data || [];
  }

  async getDealsByContact(contactId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch deals for contact: ${error.message}`);
    }

    return data || [];
  }

  async getDealStats(ownerId?: string): Promise<DealStats> {
    let query = supabase.from('deals').select('*');
    
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch deal stats: ${error.message}`);
    }

    const deals = data || [];
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    
    const closedWonDeals = deals.filter(deal => deal.stage === 'closed_won');
    const winRate = totalDeals > 0 ? (closedWonDeals.length / totalDeals) * 100 : 0;

    const stageBreakdown: Record<string, { count: number; value: number }> = {};
    deals.forEach(deal => {
      const stage = deal.stage || 'unknown';
      if (!stageBreakdown[stage]) {
        stageBreakdown[stage] = { count: 0, value: 0 };
      }
      stageBreakdown[stage].count++;
      stageBreakdown[stage].value += deal.amount || 0;
    });

    return {
      totalDeals,
      totalValue,
      averageDealSize,
      winRate,
      stageBreakdown
    };
  }

  async getPipelineStages(ownerId?: string): Promise<PipelineStage[]> {
    let query = supabase.from('deals').select('*');
    
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch pipeline stages: ${error.message}`);
    }

    const deals = data || [];
    const stageMap = new Map<string, PipelineStage>();

    deals.forEach(deal => {
      const stage = deal.stage || 'unknown';
      if (!stageMap.has(stage)) {
        stageMap.set(stage, {
          stage,
          count: 0,
          value: 0,
          probability: 0
        });
      }

      const stageData = stageMap.get(stage)!;
      stageData.count++;
      stageData.value += deal.amount || 0;
      stageData.probability += deal.probability || 0;
    });

    // Calculate average probability for each stage
    stageMap.forEach(stageData => {
      if (stageData.count > 0) {
        stageData.probability = stageData.probability / stageData.count;
      }
    });

    return Array.from(stageMap.values()).sort((a, b) => {
      const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
      const aIndex = stageOrder.indexOf(a.stage);
      const bIndex = stageOrder.indexOf(b.stage);
      return aIndex - bIndex;
    });
  }

  async getForecast(months: number = 12, ownerId?: string): Promise<ForecastData[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('amount, probability, expected_close_date')
      .not('expected_close_date', 'is', null)
      .not('stage', 'in', '(closed_won,closed_lost)');

    if (error) {
      throw new Error(`Failed to fetch forecast data: ${error.message}`);
    }

    const deals = data || [];
    const forecast: Record<string, { expectedRevenue: number; probability: number }> = {};

    deals.forEach(deal => {
      if (deal.expected_close_date && deal.amount && deal.probability) {
        const month = deal.expected_close_date.substring(0, 7); // YYYY-MM format
        if (!forecast[month]) {
          forecast[month] = { expectedRevenue: 0, probability: 0 };
        }
        forecast[month].expectedRevenue += (deal.amount * deal.probability) / 100;
        forecast[month].probability += deal.probability;
      }
    });

    // Generate forecast for next N months
    const forecastData: ForecastData[] = [];
    const today = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const month = date.toISOString().substring(0, 7);
      const monthData = forecast[month] || { expectedRevenue: 0, probability: 0 };
      
      forecastData.push({
        month,
        expectedRevenue: monthData.expectedRevenue,
        probability: monthData.probability
      });
    }

    return forecastData;
  }

  async getStages(): Promise<string[]> {
    return [
      'prospecting',
      'qualification', 
      'proposal',
      'negotiation',
      'closed_won',
      'closed_lost'
    ];
  }
}

export const dealService = new DealService();