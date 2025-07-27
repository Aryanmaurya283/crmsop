import { ReactNode, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserWithSupabase, SyncResult } from '../services/auth';

interface UserSyncProviderProps {
  children: ReactNode;
}

export const UserSyncProvider = ({ children }: UserSyncProviderProps) => {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        try {
          const result = await syncUserWithSupabase(user);
          setSyncStatus(result);
          
          if (result.success) {
            console.log(
              `User ${result.isNewUser ? 'created' : 'updated'} successfully in Supabase`,
              { userId: result.userId }
            );
          } else {
            console.error('User sync failed:', result.error);
            // In a production app, you might want to show a toast notification
            // or retry the sync operation
          }
        } catch (error) {
          console.error('Unexpected error during user sync:', error);
          setSyncStatus({
            success: false,
            isNewUser: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    syncUser();
  }, [user, isLoaded]);

  // You could expose syncStatus through a context if needed by child components
  return <>{children}</>;
};