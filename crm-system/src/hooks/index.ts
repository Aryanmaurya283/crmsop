export { useAuth } from './useAuth';
export { usePermissions } from './usePermissions';
export { useUserSync } from './useUserSync';
export { useUserProfile } from './useUserProfile';
export { useUserActivity } from './useUserActivity';
export { useUserTeams } from './useUserTeams';
export { useUsers } from './useUsers';
export { useSupabase } from './useSupabase';

// Lead management
export { useLeads, useLeadStats } from './useLeads';

// Contact and Account management
export { 
  useContacts, 
  useAccounts, 
  useContact, 
  useAccount 
} from './useContacts';

// Deal management
export { 
  useDeals, 
  useDealStats, 
  usePipelineStages, 
  useForecast, 
  useDeal, 
  useDealsByAccount, 
  useDealsByContact 
} from './useDeals';

// Activity and Task management
export { 
  useActivities, 
  useActivityStats, 
  useUpcomingActivities, 
  useOverdueActivities, 
  useActivitiesByEntity, 
  useActivity, 
  useActivitiesByDateRange, 
  useActivityMetadata 
} from './useActivities';

// Project management
export { useProjects } from './useProjects';