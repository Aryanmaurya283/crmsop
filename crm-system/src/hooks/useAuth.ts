import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

export const useAuth = () => {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();

  return {
    isLoading: !isLoaded,
    isSignedIn: isSignedIn ?? false,
    signOut,
    // Additional user properties
    userId: user?.id,
    email: user?.emailAddresses?.[0]?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
    // Include the full user object
    user,
  };
};