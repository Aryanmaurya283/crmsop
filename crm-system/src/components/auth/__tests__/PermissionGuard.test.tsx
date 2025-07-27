import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PermissionGuard from '../PermissionGuard';

// Mock usePermissions hook
vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

// Mock LoadingSpinner component
vi.mock('../../common', () => ({
  LoadingSpinner: ({ message }: { message: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

import { usePermissions } from '../../../hooks/usePermissions';

const mockUsePermissions = usePermissions as any;

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
const FallbackComponent = () => <div data-testid="fallback-content">Access Denied</div>;

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when permissions are loading', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isLoading: true,
    });

    render(
      <PermissionGuard
        permission={{ resource: 'leads', action: 'read' }}
        showLoading={true}
      >
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Checking permissions...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user has single permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn((resource, action) => 
        resource === 'leads' && action === 'read'
      ),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isLoading: false,
    });

    render(
      <PermissionGuard permission={{ resource: 'leads', action: 'read' }}>
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument();
  });

  it('should render fallback when user lacks single permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isLoading: false,
    });

    render(
      <PermissionGuard
        permission={{ resource: 'leads', action: 'delete' }}
        fallback={<FallbackComponent />}
      >
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
  });

  it('should render children when user has any of multiple permissions', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(),
      isLoading: false,
    });

    render(
      <PermissionGuard
        permissions={[
          { resource: 'leads', action: 'read' },
          { resource: 'contacts', action: 'read' },
        ]}
        requireAll={false}
      >
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render children when user has all required permissions', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(() => true),
      isLoading: false,
    });

    render(
      <PermissionGuard
        permissions={[
          { resource: 'leads', action: 'read' },
          { resource: 'leads', action: 'update' },
        ]}
        requireAll={true}
      >
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks all required permissions', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(() => false),
      isLoading: false,
    });

    render(
      <PermissionGuard
        permissions={[
          { resource: 'leads', action: 'read' },
          { resource: 'leads', action: 'delete' },
        ]}
        requireAll={true}
        fallback={<FallbackComponent />}
      >
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
  });

  it('should render children when no permissions are specified', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isLoading: false,
    });

    render(
      <PermissionGuard>
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should not show loading spinner by default', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isLoading: true,
    });

    render(
      <PermissionGuard permission={{ resource: 'leads', action: 'read' }}>
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render null fallback by default', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      isLoading: false,
    });

    render(
      <PermissionGuard permission={{ resource: 'leads', action: 'delete' }}>
        <TestComponent />
      </PermissionGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument();
  });
});