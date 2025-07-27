import type { BaseEntity } from './common';

export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  team_id: string | null;
  is_active: boolean;
}

export interface Role extends BaseEntity {
  name: string;
  description: string | null;
  permissions: Record<string, boolean>;
}

export interface Team extends BaseEntity {
  name: string;
  description: string | null;
  manager_id: string;
}

export type UserRole = 'super_admin' | 'admin' | 'sales_manager' | 'sales_executive' | 'support_agent' | 'customer';