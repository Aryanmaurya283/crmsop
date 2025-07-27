import { useState, useEffect, useCallback } from 'react';
import { LeadService, type Lead, type LeadFilters, type CreateLeadData, type UpdateLeadData, type LeadStats } from '../services/leads';

export const useLeads = (initialFilters: LeadFilters = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>(initialFilters);

  const fetchLeads = useCallback(async (
    newFilters: LeadFilters = filters,
    limit: number = 50,
    offset: number = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await LeadService.getLeads(newFilters, limit, offset);
      
      if (offset === 0) {
        setLeads(result.leads);
      } else {
        setLeads(prev => [...prev, ...result.leads]);
      }
      setTotal(result.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (leadData: CreateLeadData): Promise<Lead | null> => {
    try {
      const newLead = await LeadService.createLead(leadData);
      if (newLead) {
        setLeads(prev => [newLead, ...prev]);
        setTotal(prev => prev + 1);
      }
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lead';
      setError(errorMessage);
      return null;
    }
  };

  const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead | null> => {
    try {
      const updatedLead = await LeadService.updateLead(id, updates);
      if (updatedLead) {
        setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      }
      return updatedLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead';
      setError(errorMessage);
      return null;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      const success = await LeadService.deleteLead(id);
      if (success) {
        setLeads(prev => prev.filter(lead => lead.id !== id));
        setTotal(prev => prev - 1);
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(errorMessage);
      return false;
    }
  };

  const convertLead = async (
    id: string,
    options: {
      createContact?: boolean;
      createAccount?: boolean;
      createDeal?: boolean;
      dealAmount?: number;
    } = {}
  ): Promise<any> => {
    try {
      const result = await LeadService.convertLead(id, options);
      if (result?.success) {
        // Update the lead status to converted
        await updateLead(id, { status: 'converted' });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert lead';
      setError(errorMessage);
      return null;
    }
  };

  const bulkUpdateLeads = async (leadIds: string[], updates: UpdateLeadData): Promise<boolean> => {
    try {
      const success = await LeadService.bulkUpdateLeads(leadIds, updates);
      if (success) {
        // Refresh leads to get updated data
        await fetchLeads();
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update leads';
      setError(errorMessage);
      return false;
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && leads.length < total) {
      fetchLeads(filters, 50, leads.length);
    }
  }, [loading, leads.length, total, filters, fetchLeads]);

  const applyFilters = useCallback((newFilters: LeadFilters) => {
    setFilters(newFilters);
    fetchLeads(newFilters, 50, 0);
  }, [fetchLeads]);

  const refresh = useCallback(() => {
    fetchLeads(filters, 50, 0);
  }, [fetchLeads, filters]);

  return {
    leads,
    total,
    loading,
    error,
    filters,
    // Actions
    createLead,
    updateLead,
    deleteLead,
    convertLead,
    bulkUpdateLeads,
    loadMore,
    applyFilters,
    refresh,
    // Computed properties
    hasMore: leads.length < total,
    isEmpty: leads.length === 0 && !loading,
  };
};

export const useLeadStats = (filters: LeadFilters = {}) => {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (newFilters: LeadFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await LeadService.getLeadStats(newFilters);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats(filters);
  }, [fetchStats, filters]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};

export const useLead = (leadId: string | null) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const leadData = await LeadService.getLead(id);
      setLead(leadData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
    } else {
      setLead(null);
      setLoading(false);
    }
  }, [leadId, fetchLead]);

  const refresh = useCallback(() => {
    if (leadId) {
      fetchLead(leadId);
    }
  }, [leadId, fetchLead]);

  return {
    lead,
    loading,
    error,
    refresh,
  };
};