import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserWithSupabase, getUserFromSupabase, SyncResult } from '../services/auth';

export const useUserSync = () => {
  const { user, isLoaded } = useUser();
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        setIsSyncing(true);
        try {
          // Sync user with Supabase
          const result = await syncUserWithSupabase(user);
          setSyncResult(result);

          if (result.success) {
            // Fetch the complete user data from Supabase
            const userData = await getUserFromSupabase(user.id);
            setSupabaseUser(userData);
          }
        } catch (error) {
          console.error('Failed to sync user with Supabase:', error);
          setSyncResult({
            success: false,
            isNewUser: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncUser();
  }, [user, isLoaded]);

  const refetchUser = async () => {
    if (user?.id) {
      try {
        const userData = await getUserFromSupabase(user.id);
        setSupabaseUser(userData);
        return userData;
      } catch (error) {
        console.error('Failed to refetch user data:', error);
        throw error;
      }
    }
  };

  return {
    // Clerk user data
    clerkUser: user,
    isLoaded,
    
    // Supabase user data
    supabaseUser,
    
    // Sync status
    syncResult,
    isSyncing,
    
    // Utility functions
    refetchUser,
    
    // Computed properties
    isNewUser: syncResult?.isNewUser ?? false,
    syncSuccess: syncResult?.success ?? false,
    syncError: syncResult?.error,
  };
};