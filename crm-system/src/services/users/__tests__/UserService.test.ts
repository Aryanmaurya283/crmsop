import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserService } from '../UserService';
import { supabase } from '../../supabase';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn(),
          })),
          limit: vi.fn(),
        })),
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          range: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      upsert: vi.fn(),
    })),
  },
}));

const mockSupabase = supabase as any;

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        user_id: 'user_123',
        clerk_user_id: 'user_123',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role_name: 'sales_executive',
        team_name: 'Sales Team',
        is_active: true,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await UserService.getUserProfile('user_123');

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_profile', {
        p_clerk_user_id: 'user_123',
      });
    });

    it('should return null on error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await UserService.getUserProfile('user_123');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        })),
      });

      const updates = {
        first_name: 'Johnny',
        title: 'Senior Sales Executive',
      };

      const result = await UserService.updateUserProfile('user_123', updates);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        })),
      });

      const result = await UserService.updateUserProfile('user_123', {
        first_name: 'Johnny',
      });

      expect(result).toBe(false);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const mockUser = { id: 'user_uuid_123' };
      const mockPreferences = {
        id: 'pref_123',
        user_id: 'user_uuid_123',
        theme: 'dark',
        notifications: { email: true, push: false },
        timezone: 'America/New_York',
      };

      // Mock user lookup
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          })),
        })),
      });

      // Mock preferences lookup
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockPreferences,
              error: null,
            }),
          })),
        })),
      });

      const result = await UserService.getUserPreferences('user_123');

      expect(result).toEqual(mockPreferences);
    });

    it('should return null when preferences not found', async () => {
      const mockUser = { id: 'user_uuid_123' };

      // Mock user lookup
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          })),
        })),
      });

      // Mock preferences lookup (not found)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // Not found
            }),
          })),
        })),
      });

      const result = await UserService.getUserPreferences('user_123');

      expect(result).toBeNull();
    });
  });

  describe('logActivity', () => {
    it('should log user activity successfully', async () => {
      const mockUser = { id: 'user_uuid_123' };
      const activityId = 'activity_123';

      // Mock user lookup
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          })),
        })),
      });

      // Mock activity logging
      mockSupabase.rpc.mockResolvedValue({
        data: activityId,
        error: null,
      });

      const activityData = {
        action: 'login',
        resource_type: 'user',
        details: { ip: '192.168.1.1' },
      };

      const result = await UserService.logActivity('user_123', activityData);

      expect(result).toBe(activityId);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_user_activity', {
        p_user_id: 'user_uuid_123',
        p_action: 'login',
        p_resource_type: 'user',
        p_resource_id: undefined,
        p_details: { ip: '192.168.1.1' },
        p_ip_address: undefined,
        p_user_agent: undefined,
      });
    });

    it('should return null on error', async () => {
      const mockUser = { id: 'user_uuid_123' };

      // Mock user lookup
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          })),
        })),
      });

      // Mock activity logging error
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Logging failed' },
      });

      const result = await UserService.logActivity('user_123', {
        action: 'login',
      });

      expect(result).toBeNull();
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity history', async () => {
      const mockUser = { id: 'user_uuid_123' };
      const mockActivities = [
        {
          id: 'activity_1',
          user_id: 'user_uuid_123',
          action: 'login',
          created_at: '2023-01-01T10:00:00Z',
        },
        {
          id: 'activity_2',
          user_id: 'user_uuid_123',
          action: 'view_lead',
          created_at: '2023-01-01T09:00:00Z',
        },
      ];

      // Mock user lookup
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          })),
        })),
      });

      // Mock activity lookup
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn().mockResolvedValue({
                data: mockActivities,
                error: null,
              }),
            })),
          })),
        })),
      });

      const result = await UserService.getUserActivity('user_123', 50, 0);

      expect(result).toEqual(mockActivities);
    });

    it('should return empty array on error', async () => {
      // Mock user lookup error
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          })),
        })),
      });

      const result = await UserService.getUserActivity('user_123');

      expect(result).toEqual([]);
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const mockUsers = [
        {
          id: 'user_1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          role: { name: 'sales_executive' },
        },
        {
          id: 'user_2',
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane.doe@example.com',
          role: { name: 'sales_manager' },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({
                data: mockUsers,
                error: null,
              }),
            })),
          })),
        })),
      });

      const result = await UserService.searchUsers('Doe', 20);

      expect(result).toEqual(mockUsers);
    });

    it('should return empty array on error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Search failed' },
              }),
            })),
          })),
        })),
      });

      const result = await UserService.searchUsers('test');

      expect(result).toEqual([]);
    });
  });

  describe('updateLastActivity', () => {
    it('should update user last activity', async () => {
      mockSupabase.rpc.mockResolvedValue({
        error: null,
      });

      const result = await UserService.updateLastActivity('user_123');

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_user_activity', {
        p_clerk_user_id: 'user_123',
      });
    });

    it('should return false on error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        error: { message: 'Update failed' },
      });

      const result = await UserService.updateLastActivity('user_123');

      expect(result).toBe(false);
    });
  });
});