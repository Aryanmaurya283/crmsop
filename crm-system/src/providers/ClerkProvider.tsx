import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { UserSyncProvider } from './UserSyncProvider';

interface ClerkProviderProps {
  children: ReactNode;
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export const ClerkProvider = ({ children }: ClerkProviderProps) => {
  return (
    <BaseClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <UserSyncProvider>
        {children}
      </UserSyncProvider>
    </BaseClerkProvider>
  );
};