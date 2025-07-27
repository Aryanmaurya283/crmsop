import type { BaseEntity } from './common';

export interface Activity extends BaseEntity {
  type: ActivityType;
  subject: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  related_to_type?: RelatedEntityType;
  related_to_id?: string;
  owner_id: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  duration_minutes?: number;
  location?: string;
  attendees?: string[];
  reminder_sent?: boolean;
  reminder_date?: string;
}

export interface Task extends Activity {
  type: 'task';
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
  tags?: string[];
}

export interface Call extends Activity {
  type: 'call';
  phone_number?: string;
  call_duration?: number;
  call_result?: CallResult;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

export interface Meeting extends Activity {
  type: 'meeting';
  meeting_type: MeetingType;
  attendees: string[];
  meeting_link?: string;
  agenda?: string;
  notes?: string;
}

export interface Email extends Activity {
  type: 'email';
  email_subject: string;
  email_body?: string;
  recipients: string[];
  cc_recipients?: string[];
  bcc_recipients?: string[];
  email_status: EmailStatus;
  opened?: boolean;
  replied?: boolean;
}

export interface Reminder extends BaseEntity {
  activity_id: string;
  reminder_date: string;
  reminder_type: ReminderType;
  sent: boolean;
  sent_at?: string;
  notification_method: NotificationMethod;
}

export type ActivityType = 'task' | 'call' | 'meeting' | 'email' | 'note';
export type RelatedEntityType = 'lead' | 'contact' | 'deal' | 'account' | 'project';
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';
export type CallResult = 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'wrong_number' | 'scheduled';
export type MeetingType = 'in_person' | 'video_call' | 'phone_call' | 'webinar' | 'conference';
export type EmailStatus = 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
export type ReminderType = 'email' | 'sms' | 'push' | 'calendar';
export type NotificationMethod = 'email' | 'sms' | 'push' | 'in_app';

export interface ActivityFilters {
  type?: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  related_to_type?: RelatedEntityType;
  related_to_id?: string;
  owner_id?: string;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  completed?: boolean;
}

export interface ActivityStats {
  totalActivities: number;
  completedActivities: number;
  overdueActivities: number;
  upcomingActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByStatus: Record<ActivityStatus, number>;
  averageCompletionTime: number;
  productivityScore: number;
}

export interface ActivityCreateData {
  type: ActivityType;
  subject: string;
  description?: string;
  due_date?: string;
  related_to_type?: RelatedEntityType;
  related_to_id?: string;
  priority?: ActivityPriority;
  status?: ActivityStatus;
  duration_minutes?: number;
  location?: string;
  attendees?: string[];
  reminder_date?: string;
  // Type-specific fields
  phone_number?: string;
  meeting_type?: MeetingType;
  meeting_link?: string;
  agenda?: string;
  email_subject?: string;
  email_body?: string;
  recipients?: string[];
  cc_recipients?: string[];
  bcc_recipients?: string[];
  assigned_to?: string;
  estimated_hours?: number;
  dependencies?: string[];
  tags?: string[];
}

export interface ActivityUpdateData extends Partial<ActivityCreateData> {
  completed_at?: string;
  reminder_sent?: boolean;
  call_duration?: number;
  call_result?: CallResult;
  follow_up_required?: boolean;
  follow_up_date?: string;
  opened?: boolean;
  replied?: boolean;
  actual_hours?: number;
} 