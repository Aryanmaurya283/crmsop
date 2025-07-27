import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PermissionService } from '../index';
import { supabase } from '../../supabase';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

const mockSupabase = supabase as any;

describe('PermissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await PermissionService.hasPermission('user_123', 'leads', 'read');

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('user_has_permission', {
        user_clerk_id: 'user_123',
        resource: 'leads',
        action: 'read',
      });
    });

    it('should return false when user does not have permission', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await PermissionService.hasPermission('user_123', 'leads', 'delete');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await PermissionService.hasPermission('user_123', 'leads', 'read');

      expect(result).toBe(false);
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await PermissionService.hasPermission('user_123', 'leads', 'read');

      expect(result).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('should return user role', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'sales_executive',
        error: null,
      });

      const result = await PermissionService.getUserRole('user_123');

      expect(result).toBe('sales_executive');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_role', {
        user_clerk_id: 'user_123',
      });
    });

    it('should return null on error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await PermissionService.getUserRole('user_123');

      expect(result).toBeNull();
    });
  });

  describe('getUserWithRole', () => {
    it('should return user with role information', async () => {
      const mockUserData = {
        id: 'user_123',
        clerk_user_id: 'user_123',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: {
          id: 'role_123',
          name: 'sales_executive',
          description: 'Sales Executive',
          permissions: {},
        },
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      });

      const result = await PermissionService.getUserWithRole('user_123');

      expect(result).toEqual(mockUserData);
    });

    it('should return null on error', async () => {
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

      const result = await PermissionService.getUserWithRole('user_123');

      expect(result).toBeNull();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        {
          id: 'role_1',
          name: 'admin',
          description: 'Administrator',
          permissions: {},
          is_system_role: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        {
          id: 'role_2',
          name: 'sales_executive',
          description: 'Sales Executive',
          permissions: {},
          is_system_role: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: mockRoles,
            error: null,
          }),
        })),
      });

      const result = await PermissionService.getAllRoles();

      expect(result).toEqual(mockRoles);
    });

    it('should return empty array on error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        })),
      });

      const result = await PermissionService.getAllRoles();

      expect(result).toEqual([]);
    });
  });

  describe('assignRole', () => {
    it('should assign role successfully', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        })),
      });

      const result = await PermissionService.assignRole('user_123', 'role_123');

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

      const result = await PermissionService.assignRole('user_123', 'role_123');

      expect(result).toBe(false);
    });
  });

  describe('isTeamManager', () => {
    it('should return true when user is team manager', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await PermissionService.isTeamManager('user_123', 'team_123');

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('is_team_manager', {
        user_clerk_id: 'user_123',
        team_uuid: 'team_123',
      });
    });

    it('should return false when user is not team manager', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await PermissionService.isTeamManager('user_123', 'team_123');

      expect(result).toBe(false);
    });
  });

  describe('canAccessRecord', () => {
    it('should return true when user can access record', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await PermissionService.canAccessRecord(
        'user_123',
        'owner_123',
        'leads',
        'read'
      );

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('can_access_record', {
        user_clerk_id: 'user_123',
        record_owner_id: 'owner_123',
        resource: 'leads',
        action: 'read',
      });
    });

    it('should return false when user cannot access record', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await PermissionService.canAccessRecord(
        'user_123',
        'owner_123',
        'leads',
        'delete'
      );

      expect(result).toBe(false);
    });
  });

  describe('setCurrentUser', () => {
    it('should set current user context', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      await PermissionService.setCurrentUser('user_123');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('set_current_user_id', {
        user_clerk_id: 'user_123',
      });
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(PermissionService.setCurrentUser('user_123')).resolves.toBeUndefined();
    });
  });
});