import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { dealService, type DealFilters, type DealCreateData, type DealStats, type PipelineStage, type ForecastData } from '../services/deals';
import type { Deal } from '../types/deals';

export const useDeals = () => {
  const { userId } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DealFilters>({});

  const fetchDeals = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getDeals(filters, page);
      setDeals(result.deals);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, page]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const applyFilters = useCallback((newFilters: DealFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    fetchDeals();
  }, [fetchDeals]);

  const createDeal = useCallback(async (dealData: DealCreateData) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newDeal = await dealService.createDeal(dealData, userId);
      setDeals(prev => [newDeal, ...prev]);
      return newDeal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
      throw err;
    }
  }, [userId]);

  const updateDeal = useCallback(async (id: string, dealData: Partial<DealCreateData>) => {
    try {
      const updatedDeal = await dealService.updateDeal(id, dealData);
      setDeals(prev => prev.map(deal => 
        deal.id === id ? updatedDeal : deal
      ));
      return updatedDeal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal');
      throw err;
    }
  }, []);

  const deleteDeal = useCallback(async (id: string) => {
    try {
      await dealService.deleteDeal(id);
      setDeals(prev => prev.filter(deal => deal.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deal');
      throw err;
    }
  }, []);

  const updateDealStage = useCallback(async (id: string, stage: string, probability?: number) => {
    try {
      const updatedDeal = await dealService.updateDealStage(id, stage, probability);
      setDeals(prev => prev.map(deal => 
        deal.id === id ? updatedDeal : deal
      ));
      return updatedDeal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal stage');
      throw err;
    }
  }, []);

  const closeDeal = useCallback(async (id: string, actualCloseDate?: string, finalAmount?: number) => {
    try {
      const updatedDeal = await dealService.closeDeal(id, actualCloseDate, finalAmount);
      setDeals(prev => prev.map(deal => 
        deal.id === id ? updatedDeal : deal
      ));
      return updatedDeal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close deal');
      throw err;
    }
  }, []);

  return {
    deals,
    loading,
    error,
    total,
    page,
    filters,
    applyFilters,
    refresh,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStage,
    closeDeal,
    setPage
  };
};

export const useDealStats = () => {
  const { userId } = useAuth();
  const [stats, setStats] = useState<DealStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getDealStats(userId);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deal stats');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

export const usePipelineStages = () => {
  const { userId } = useAuth();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getPipelineStages(userId);
      setStages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline stages');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  return {
    stages,
    loading,
    error,
    refresh: fetchStages
  };
};

export const useForecast = (months: number = 12) => {
  const { userId } = useAuth();
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getForecast(months, userId);
      setForecast(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  }, [userId, months]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    loading,
    error,
    refresh: fetchForecast
  };
};

export const useDeal = (dealId: string) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeal = useCallback(async () => {
    if (!dealId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getDeal(dealId);
      setDeal(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deal');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  return {
    deal,
    loading,
    error,
    refresh: fetchDeal
  };
};

export const useDealsByAccount = (accountId: string) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getDealsByAccount(accountId);
      setDeals(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals for account');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    refresh: fetchDeals
  };
};

export const useDealsByContact = (contactId: string) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dealService.getDealsByContact(contactId);
      setDeals(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals for contact');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    refresh: fetchDeals
  };
};