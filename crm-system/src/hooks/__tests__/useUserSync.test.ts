import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserSync } from '../useUserSync';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(),
}));

// Mock auth services
vi.mock('../../services/auth', () => ({
  syncUserWithSupabase: vi.fn(),
  getUserFromSupabase: vi.fn(),
}));

import { useUser } from '@clerk/clerk-react';
import { syncUserWithSupabase, getUserFromSupabase } from '../../services/auth';

const mockUseUser = useUser as any;
const mockSyncUserWithSupabase = syncUserWithSupabase as any;
const mockGetUserFromSupabase = getUserFromSupabase as any;

describe('useUserSync', () => {
  const mockClerkUser = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  };

  const mockSupabaseUser = {
    id: 'supabase_user_123',
    clerk_user_id: 'user_123',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: {
      id: 'role_123',
      name: 'sales_executive',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync user successfully when loaded', async () => {
    mockUseUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });

    mockSyncUserWithSupabase.mockResolvedValue({
      success: true,
      isNewUser: true,
      userId: 'supabase_user_123',
    });

    mockGetUserFromSupabase.mockResolvedValue(mockSupabaseUser);

    const { result } = renderHook(() => useUserSync());

    // Initially syncing
    expect(result.current.isSyncing).toBe(true);

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });

    expect(result.current.syncSuccess).toBe(true);
    expect(result.current.isNewUser).toBe(true);
    expect(result.current.supabaseUser).toEqual(mockSupabaseUser);
    expect(mockSyncUserWithSupabase).toHaveBeenCalledWith(mockClerkUser);
    expect(mockGetUserFromSupabase).toHaveBeenCalledWith('user_123');
  });

  it('should handle sync failure', async () => {
    mockUseUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });

    mockSyncUserWithSupabase.mockResolvedValue({
      success: false,
      isNewUser: false,
      error: 'Database connection failed',
    });

    const { result } = renderHook(() => useUserSync());

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });

    expect(result.current.syncSuccess).toBe(false);
    expect(result.current.syncError).toBe('Database connection failed');
    expect(result.current.supabaseUser).toBeNull();
    expect(mockGetUserFromSupabase).not.toHaveBeenCalled();
  });

  it('should not sync when user is not loaded', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
    });

    const { result } = renderHook(() => useUserSync());

    expect(result.current.isSyncing).toBe(false);
    expect(mockSyncUserWithSupabase).not.toHaveBeenCalled();
  });

  it('should not sync when user is null', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
    });

    const { result } = renderHook(() => useUserSync());

    expect(result.current.isSyncing).toBe(false);
    expect(mockSyncUserWithSupabase).not.toHaveBeenCalled();
  });

  it('should handle refetchUser function', async () => {
    mockUseUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });

    mockSyncUserWithSupabase.mockResolvedValue({
      success: true,
      isNewUser: false,
      userId: 'supabase_user_123',
    });

    mockGetUserFromSupabase.mockResolvedValue(mockSupabaseUser);

    const { result } = renderHook(() => useUserSync());

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });

    // Test refetchUser
    const updatedUser = { ...mockSupabaseUser, first_name: 'Johnny' };
    mockGetUserFromSupabase.mockResolvedValue(updatedUser);

    const refetchedUser = await result.current.refetchUser();

    expect(refetchedUser).toEqual(updatedUser);
    expect(result.current.supabaseUser).toEqual(updatedUser);
  });

  it('should handle refetchUser error', async () => {
    mockUseUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });

    mockSyncUserWithSupabase.mockResolvedValue({
      success: true,
      isNewUser: false,
      userId: 'supabase_user_123',
    });

    mockGetUserFromSupabase.mockResolvedValue(mockSupabaseUser);

    const { result } = renderHook(() => useUserSync());

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });

    // Test refetchUser error
    mockGetUserFromSupabase.mockRejectedValue(new Error('Fetch failed'));

    await expect(result.current.refetchUser()).rejects.toThrow('Fetch failed');
  });

  it('should handle sync exception', async () => {
    mockUseUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });

    mockSyncUserWithSupabase.mockRejectedValue(new Error('Sync failed'));

    const { result } = renderHook(() => useUserSync());

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });

    expect(result.current.syncSuccess).toBe(false);
    expect(result.current.syncError).toBe('Sync failed');
  });
});