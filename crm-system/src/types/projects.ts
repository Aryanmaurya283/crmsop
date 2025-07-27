import type { BaseEntity } from './common';

export interface Project extends BaseEntity {
  name: string;
  description: string | null;
  account_id: string;
  deal_id: string | null;
  status: ProjectStatus;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  actual_cost: number | null;
  manager_id: string;
  team_members: string[];
  tags: string[];
  priority: ProjectPriority;
  progress_percentage: number;
  risk_level: RiskLevel;
  client_contact_id: string | null;
}

export interface ProjectTask extends BaseEntity {
  project_id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  depends_on: string[] | null;
  tags: string[];
  parent_task_id: string | null;
  order_index: number;
}

export interface Milestone extends BaseEntity {
  project_id: string;
  name: string;
  description: string | null;
  due_date: string;
  completed_at: string | null;
  is_completed: boolean;
  deliverables: string[];
  dependencies: string[];
}

export interface ProjectResource extends BaseEntity {
  project_id: string;
  user_id: string;
  role: ResourceRole;
  allocation_percentage: number;
  start_date: string;
  end_date: string | null;
  hourly_rate: number | null;
  total_hours: number | null;
}

export interface ProjectBudget extends BaseEntity {
  project_id: string;
  category: BudgetCategory;
  budgeted_amount: number;
  actual_amount: number;
  description: string | null;
}

export interface ProjectTimeline extends BaseEntity {
  project_id: string;
  phase_name: string;
  start_date: string;
  end_date: string;
  status: TimelineStatus;
  description: string | null;
  deliverables: string[];
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ResourceRole = 'project_manager' | 'developer' | 'designer' | 'analyst' | 'tester' | 'consultant';
export type BudgetCategory = 'labor' | 'materials' | 'equipment' | 'travel' | 'software' | 'other';
export type TimelineStatus = 'planned' | 'in_progress' | 'completed' | 'delayed';

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  account_id?: string;
  manager_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  risk_level?: RiskLevel;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalBudget: number;
  actualCost: number;
  averageProgress: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByPriority: Record<ProjectPriority, number>;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  account_id: string;
  deal_id?: string;
  status?: ProjectStatus;
  start_date: string;
  end_date?: string;
  budget?: number;
  manager_id: string;
  team_members?: string[];
  tags?: string[];
  priority?: ProjectPriority;
  risk_level?: RiskLevel;
  client_contact_id?: string;
}

export interface ProjectUpdateData extends Partial<ProjectCreateData> {
  progress_percentage?: number;
  actual_cost?: number;
}

export interface TaskCreateData {
  project_id: string;
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  depends_on?: string[];
  tags?: string[];
  parent_task_id?: string;
}

export interface TaskUpdateData extends Partial<TaskCreateData> {
  completed_at?: string;
  actual_hours?: number;
}

export interface MilestoneCreateData {
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
  deliverables?: string[];
  dependencies?: string[];
}

export interface MilestoneUpdateData extends Partial<MilestoneCreateData> {
  completed_at?: string;
  is_completed?: boolean;
}