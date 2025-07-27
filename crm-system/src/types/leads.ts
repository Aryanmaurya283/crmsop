import type { BaseEntity } from './common';

export interface Lead extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  company: string | null;
  phone: string | null;
  source: string;
  status: LeadStatus;
  score: number;
  owner_id: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface CreateLeadRequest {
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  source: string;
  owner_id: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  status?: LeadStatus;
  score?: number;
}