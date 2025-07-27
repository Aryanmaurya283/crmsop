import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile } from '../useUserProfile';

// Mock useAuth hook
vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock UserService
vi.mock('../../services/users', () => ({
  UserService: {
    getUserProfile: vi.fn(),
    getUserPreferences: vi.fn(),
    updateUserProfile: vi.fn(),
    upsertUserPreferences: vi.fn(),
    logActivity: vi.fn(),
  },
}));

import { useAuth } from '../useAuth';
import { UserService } from '../../services/users';

const mockUseAuth = useAuth as any;
const mockUserService = UserService as any;

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not load profile when user is not signed in', () => {
    mockUseAuth.mockReturnValue({
      userId: null,
      isSignedIn: false,
    });

    const { result } = renderHook(() => useUserProfile());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.preferences).toBeNull();
  });

  it('should load user profile and preferences when signed in', async () => {
    const mockProfile = {
      user_id: 'user_123',
      clerk_user_id: 'user_123',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role_name: 'sales_executive',
      is_active: true,
    };

    const mockPreferences = {
      id: 'pref_123',
      user_id: 'user_123',
      theme: 'dark',
      notifications: { email: true },
      timezone: 'UTC',
    };

    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getUserPreferences.mockResolvedValue(mockPreferences);

    const { result } = renderHook(() => useUserProfile());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.preferences).toEqual(mockPreferences);
    expect(result.current.fullName).toBe('John Doe');
    expect(result.current.displayName).toBe('John');
    expect(result.current.isActive).toBe(true);
  });

  it('should handle loading errors', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockUserService.getUserProfile.mockRejectedValue(new Error('Network error'));
    mockUserService.getUserPreferences.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.profile).toBeNull();
    expect(result.current.preferences).toBeNull();
  });

  it('should update profile successfully', async () => {
    const mockProfile = {
      user_id: 'user_123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      is_active: true,
    };

    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getUserPreferences.mockResolvedValue(null);
    mockUserService.updateUserProfile.mockResolvedValue(true);

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updates = { first_name: 'Johnny' };
    const success = await result.current.updateProfile(updates);

    expect(success).toBe(true);
    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith('user_123', updates);
    expect(result.current.profile?.first_name).toBe('Johnny');
  });

  it('should update preferences successfully', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    const updatedPreferences = {
      theme: 'light',
      notifications: { email: false },
    };

    mockUserService.getUserProfile.mockResolvedValue({});
    mockUserService.getUserPreferences.mockResolvedValueOnce(null);
    mockUserService.upsertUserPreferences.mockResolvedValue(true);
    mockUserService.getUserPreferences.mockResolvedValueOnce(updatedPreferences);

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const success = await result.current.updatePreferences({ theme: 'light' });

    expect(success).toBe(true);
    expect(mockUserService.upsertUserPreferences).toHaveBeenCalledWith('user_123', { theme: 'light' });
    expect(result.current.preferences).toEqual(updatedPreferences);
  });

  it('should log activity successfully', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockUserService.getUserProfile.mockResolvedValue({});
    mockUserService.getUserPreferences.mockResolvedValue(null);
    mockUserService.logActivity.mockResolvedValue('activity_123');

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const activityData = {
      action: 'view_dashboard',
      resource_type: 'dashboard',
    };

    const activityId = await result.current.logActivity(activityData);

    expect(activityId).toBe('activity_123');
    expect(mockUserService.logActivity).toHaveBeenCalledWith('user_123', activityData);
  });

  it('should provide role checking helper', async () => {
    const mockProfile = {
      role_name: 'sales_manager',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
    };

    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getUserPreferences.mockResolvedValue(null);

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasRole('sales_manager')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
  });

  it('should refresh profile data', async () => {
    const initialProfile = { first_name: 'John', last_name: 'Doe' };
    const updatedProfile = { first_name: 'Johnny', last_name: 'Doe' };

    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockUserService.getUserProfile
      .mockResolvedValueOnce(initialProfile)
      .mockResolvedValueOnce(updatedProfile);
    mockUserService.getUserPreferences.mockResolvedValue(null);

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile?.first_name).toBe('John');

    await result.current.refreshProfile();

    expect(result.current.profile?.first_name).toBe('Johnny');
  });
});