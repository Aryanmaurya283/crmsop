import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

const mockUseClerkAuth = useClerkAuth as any;
const mockUseUser = useUser as any;

describe('useAuth', () => {
  it('should return loading state when Clerk is not loaded', () => {
    mockUseClerkAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      signOut: vi.fn(),
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSignedIn).toBe(false);
  });

  it('should return user data when signed in', () => {
    const mockUser = {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      imageUrl: 'https://example.com/avatar.jpg',
    };

    mockUseClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      signOut: vi.fn(),
    });
    mockUseUser.mockReturnValue({
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.userId).toBe('user_123');
    expect(result.current.email).toBe('john.doe@example.com');
    expect(result.current.firstName).toBe('John');
    expect(result.current.lastName).toBe('Doe');
    expect(result.current.fullName).toBe('John Doe');
    expect(result.current.imageUrl).toBe('https://example.com/avatar.jpg');
    expect(result.current.user).toBe(mockUser);
  });

  it('should handle signed out state', () => {
    mockUseClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      signOut: vi.fn(),
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userId).toBeUndefined();
    expect(result.current.email).toBeUndefined();
    expect(result.current.user).toBeNull();
  });

  it('should provide signOut function', () => {
    const mockSignOut = vi.fn();
    
    mockUseClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      signOut: mockSignOut,
    });
    mockUseUser.mockReturnValue({
      user: { id: 'user_123' },
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.signOut).toBe(mockSignOut);
  });
});