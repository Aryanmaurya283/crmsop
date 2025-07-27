import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncUserWithSupabase, getUserFromSupabase, deactivateUser } from '../userSync';
import { supabase } from '../../supabase';
import type { UserResource } from '@clerk/types';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

const mockSupabase = supabase as any;

describe('userSync', () => {
  const mockClerkUser: UserResource = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    imageUrl: 'https://example.com/avatar.jpg',
    emailAddresses: [
      {
        id: 'email_123',
        emailAddress: 'john.doe@example.com',
      },
    ],
    primaryEmailAddressId: 'email_123',
  } as UserResource;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('syncUserWithSupabase', () => {
    it('should create a new user when user does not exist', async () => {
      // Mock role fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'role_123' },
              error: null,
            }),
          })),
        })),
      });

      // Mock user existence check (user not found)
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

      // Mock user insertion
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new_user_123' },
              error: null,
            }),
          })),
        })),
      });

      const result = await syncUserWithSupabase(mockClerkUser);

      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(true);
      expect(result.userId).toBe('new_user_123');
    });

    it('should update existing user when user exists', async () => {
      // Mock role fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'role_123' },
              error: null,
            }),
          })),
        })),
      });

      // Mock user existence check (user found)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'existing_user_123', role_id: 'role_123' },
              error: null,
            }),
          })),
        })),
      });

      // Mock user update
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        })),
      });

      const result = await syncUserWithSupabase(mockClerkUser);

      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(false);
      expect(result.userId).toBe('existing_user_123');
    });

    it('should handle missing Clerk user ID', async () => {
      const invalidUser = { ...mockClerkUser, id: '' };

      const result = await syncUserWithSupabase(invalidUser as UserResource);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clerk user ID is required');
    });

    it('should handle missing email address', async () => {
      const userWithoutEmail = {
        ...mockClerkUser,
        emailAddresses: [],
        primaryEmailAddressId: null,
      };

      const result = await syncUserWithSupabase(userWithoutEmail as UserResource);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User must have a primary email address');
    });

    it('should handle database errors gracefully', async () => {
      // Mock role fetch failure
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          })),
        })),
      });

      // Mock user existence check
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          })),
        })),
      });

      // Mock user insertion failure
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          })),
        })),
      });

      const result = await syncUserWithSupabase(mockClerkUser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create user');
    });
  });

  describe('getUserFromSupabase', () => {
    it('should fetch user with role and team data', async () => {
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
        team: {
          id: 'team_123',
          name: 'Sales Team',
          description: 'Main sales team',
        },
      };

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockUserData,
                error: null,
              }),
            })),
          })),
        })),
      });

      const result = await getUserFromSupabase('user_123');

      expect(result).toEqual(mockUserData);
    });

    it('should handle user not found', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }, // Not found
              }),
            })),
          })),
        })),
      });

      const result = await getUserFromSupabase('nonexistent_user');

      expect(result).toBeNull();
    });

    it('should handle missing user ID', async () => {
      await expect(getUserFromSupabase('')).rejects.toThrow('Clerk user ID is required');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        })),
      });

      const result = await deactivateUser('user_123');

      expect(result).toBe(true);
    });

    it('should handle deactivation errors', async () => {
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        })),
      });

      const result = await deactivateUser('user_123');

      expect(result).toBe(false);
    });

    it('should handle missing user ID', async () => {
      const result = await deactivateUser('');

      expect(result).toBe(false);
    });
  });
});