import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

// Mock useAuth hook
vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock PermissionService
vi.mock('../../services/permissions', () => ({
  PermissionService: {
    setCurrentUser: vi.fn(),
    getUserRole: vi.fn(),
    hasPermission: vi.fn(),
  },
}));

import { useAuth } from '../useAuth';
import { PermissionService } from '../../services/permissions';

const mockUseAuth = useAuth as any;
const mockPermissionService = PermissionService as any;

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not load permissions when user is not signed in', () => {
    mockUseAuth.mockReturnValue({
      userId: null,
      isSignedIn: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.userRole).toBeNull();
    expect(result.current.permissions).toEqual({});
  });

  it('should load user permissions when signed in', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockPermissionService.setCurrentUser.mockResolvedValue(undefined);
    mockPermissionService.getUserRole.mockResolvedValue('sales_executive');
    mockPermissionService.hasPermission.mockImplementation((userId, resource, action) => {
      // Mock some permissions
      if (resource === 'leads' && action === 'read') return Promise.resolve(true);
      if (resource === 'leads' && action === 'create') return Promise.resolve(true);
      if (resource === 'leads' && action === 'delete') return Promise.resolve(false);
      return Promise.resolve(false);
    });

    const { result } = renderHook(() => usePermissions());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBe('sales_executive');
    expect(result.current.hasPermission('leads', 'read')).toBe(true);
    expect(result.current.hasPermission('leads', 'create')).toBe(true);
    expect(result.current.hasPermission('leads', 'delete')).toBe(false);
    expect(result.current.isSalesExecutive).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should handle permission loading errors', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockPermissionService.setCurrentUser.mockRejectedValue(new Error('Network error'));
    mockPermissionService.getUserRole.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBeNull();
    expect(result.current.permissions).toEqual({});
  });

  it('should provide role-based helpers', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockPermissionService.setCurrentUser.mockResolvedValue(undefined);
    mockPermissionService.getUserRole.mockResolvedValue('super_admin');
    mockPermissionService.hasPermission.mockResolvedValue(true);

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isSalesManager).toBe(false);
    expect(result.current.isSalesExecutive).toBe(false);
    expect(result.current.isCustomer).toBe(false);
  });

  it('should handle hasAnyPermission correctly', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockPermissionService.setCurrentUser.mockResolvedValue(undefined);
    mockPermissionService.getUserRole.mockResolvedValue('sales_executive');
    mockPermissionService.hasPermission.mockImplementation((userId, resource, action) => {
      if (resource === 'leads' && action === 'read') return Promise.resolve(true);
      if (resource === 'contacts' && action === 'read') return Promise.resolve(true);
      if (resource === 'deals' && action === 'delete') return Promise.resolve(false);
      return Promise.resolve(false);
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const hasAnyRead = result.current.hasAnyPermission([
      { resource: 'leads', action: 'read' },
      { resource: 'deals', action: 'delete' },
    ]);

    const hasAnyDelete = result.current.hasAnyPermission([
      { resource: 'deals', action: 'delete' },
      { resource: 'projects', action: 'delete' },
    ]);

    expect(hasAnyRead).toBe(true);
    expect(hasAnyDelete).toBe(false);
  });

  it('should handle hasAllPermissions correctly', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockPermissionService.setCurrentUser.mockResolvedValue(undefined);
    mockPermissionService.getUserRole.mockResolvedValue('sales_executive');
    mockPermissionService.hasPermission.mockImplementation((userId, resource, action) => {
      if (resource === 'leads' && action === 'read') return Promise.resolve(true);
      if (resource === 'contacts' && action === 'read') return Promise.resolve(true);
      if (resource === 'deals' && action === 'delete') return Promise.resolve(false);
      return Promise.resolve(false);
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const hasAllRead = result.current.hasAllPermissions([
      { resource: 'leads', action: 'read' },
      { resource: 'contacts', action: 'read' },
    ]);

    const hasAllMixed = result.current.hasAllPermissions([
      { resource: 'leads', action: 'read' },
      { resource: 'deals', action: 'delete' },
    ]);

    expect(hasAllRead).toBe(true);
    expect(hasAllMixed).toBe(false);
  });

  it('should handle checkPermission with caching', async () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    });

    mockPermissionService.setCurrentUser.mockResolvedValue(undefined);
    mockPermissionService.getUserRole.mockResolvedValue('sales_executive');
    mockPermissionService.hasPermission.mockResolvedValue(true);

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First call should make API request
    const hasPermission1 = await result.current.checkPermission('projects', 'create');
    expect(hasPermission1).toBe(true);

    // Second call should use cached result
    const hasPermission2 = await result.current.checkPermission('projects', 'create');
    expect(hasPermission2).toBe(true);

    // Should only be called once due to caching
    expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(1);
  });
});