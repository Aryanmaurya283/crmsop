import type { BaseEntity } from './common';

export interface Deal extends BaseEntity {
  name: string;
  account_id: string | null;
  contact_id: string | null;
  amount: number | null;
  currency: string;
  stage: DealStage;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  owner_id: string;
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Pipeline extends BaseEntity {
  name: string;
  stages: PipelineStage[];
  is_default: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  order: number;
}