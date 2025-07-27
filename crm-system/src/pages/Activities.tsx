import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Task as TaskIcon,
  Phone as PhoneIcon,
  VideoCall as MeetingIcon,
  Email as EmailIcon,
  Note as NoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  PriorityHigh as PriorityHighIcon,
  KeyboardArrowDown as PriorityLowIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import { 
  useActivities, 
  useActivityStats, 
  useUpcomingActivities, 
  useOverdueActivities,
  useActivityMetadata 
} from '../hooks/useActivities';
import { PermissionGuard } from '../components/auth';
import { PERMISSIONS } from '../services/permissions';
import { LoadingSpinner } from '../components/common';
import type { Activity, ActivityType, ActivityStatus, ActivityPriority, RelatedEntityType } from '../types/activities';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`activities-tabpanel-${index}`}
      aria-labelledby={`activities-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Activities: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { activities, loading, error, total, applyFilters, refresh, createActivity, updateActivity, deleteActivity, completeActivity } = useActivities();
  const { stats, loading: statsLoading } = useActivityStats();
  const { activities: upcomingActivities, loading: upcomingLoading } = useUpcomingActivities(7);
  const { activities: overdueActivities, loading: overdueLoading } = useOverdueActivities();
  const { types, statuses, priorities, entityTypes, loading: metadataLoading } = useActivityMetadata();
  
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>('task');
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus>('pending');
  const [selectedPriority, setSelectedPriority] = useState<ActivityPriority>('medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [newActivity, setNewActivity] = useState({
    subject: '',
    description: '',
    due_date: '',
    priority: 'medium' as ActivityPriority,
    type: 'task' as ActivityType,
    related_to_type: '' as RelatedEntityType | '',
    related_to_id: '',
    duration_minutes: '',
    location: '',
  });

  const canCreateActivities = hasPermission('activities', 'create');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTypeFilter = (type: ActivityType) => {
    setSelectedType(type);
    applyFilters({ type });
  };

  const handleStatusFilter = (status: ActivityStatus) => {
    setSelectedStatus(status);
    applyFilters({ status });
  };

  const handlePriorityFilter = (priority: ActivityPriority) => {
    setSelectedPriority(priority);
    applyFilters({ priority });
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    applyFilters({ search });
  };

  const handleCreateActivity = async () => {
    try {
      await createActivity({
        type: newActivity.type,
        subject: newActivity.subject,
        description: newActivity.description || undefined,
        due_date: newActivity.due_date || undefined,
        priority: newActivity.priority,
        related_to_type: newActivity.related_to_type || undefined,
        related_to_id: newActivity.related_to_id || undefined,
        duration_minutes: newActivity.duration_minutes ? parseInt(newActivity.duration_minutes) : undefined,
        location: newActivity.location || undefined,
      });
      setCreateDialogOpen(false);
      setNewActivity({
        subject: '',
        description: '',
        due_date: '',
        priority: 'medium',
        type: 'task',
        related_to_type: '',
        related_to_id: '',
        duration_minutes: '',
        location: '',
      });
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await completeActivity(activityId);
      refresh();
    } catch (error) {
      console.error('Failed to complete activity:', error);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'task': return <TaskIcon />;
      case 'call': return <PhoneIcon />;
      case 'meeting': return <MeetingIcon />;
      case 'email': return <EmailIcon />;
      case 'note': return <NoteIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getPriorityIcon = (priority: ActivityPriority) => {
    switch (priority) {
      case 'urgent': return <PriorityHighIcon color="error" />;
      case 'high': return <PriorityHighIcon color="warning" />;
      case 'medium': return <PriorityHighIcon color="info" />;
      case 'low': return <PriorityLowIcon color="action" />;
      default: return <PriorityLowIcon />;
    }
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'deferred': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: ActivityPriority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!hasPermission('activities', 'read')) {
    return (
      <Box>
        <Alert severity="warning">
          You don't have permission to view activities.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Activities & Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your tasks, calls, meetings, and activities
          </Typography>
        </Box>
        <PermissionGuard permission={PERMISSIONS.ACTIVITIES.CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Activity
          </Button>
        </PermissionGuard>
      </Box>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalActivities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Activities
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.completedActivities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <WarningIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.overdueActivities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.productivityScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Productivity Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overdue Activities ({overdueActivities.length})
              </Typography>
              {overdueLoading ? (
                <LoadingSpinner message="Loading overdue activities..." />
              ) : overdueActivities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No overdue activities
                </Typography>
              ) : (
                <List dense>
                  {overdueActivities.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.subject}
                        secondary={`Due: ${formatDate(activity.due_date!)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleCompleteActivity(activity.id)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Activities ({upcomingActivities.length})
              </Typography>
              {upcomingLoading ? (
                <LoadingSpinner message="Loading upcoming activities..." />
              ) : upcomingActivities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No upcoming activities
                </Typography>
              ) : (
                <List dense>
                  {upcomingActivities.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.subject}
                        secondary={`Due: ${formatDate(activity.due_date!)}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={activity.priority} 
                          size="small" 
                          color={getPriorityColor(activity.priority) as any}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="activities tabs">
            <Tab label={`All Activities (${total})`} />
            <Tab label="Tasks" />
            <Tab label="Calls" />
            <Tab label="Meetings" />
            <Tab label="Emails" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Search activities"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by subject or description..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => handleStatusFilter(e.target.value as ActivityStatus)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={selectedPriority}
                  label="Priority"
                  onChange={(e) => handlePriorityFilter(e.target.value as ActivityPriority)}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedType}
                  label="Type"
                  onChange={(e) => handleTypeFilter(e.target.value as ActivityType)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Activities List */}
      <Card>
        <CardContent>
          {loading ? (
            <LoadingSpinner message="Loading activities..." />
          ) : activities.length === 0 ? (
            <Box textAlign="center" py={4}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No activities found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first activity'}
              </Typography>
            </Box>
          ) : (
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {activity.subject}
                          </Typography>
                          <Chip 
                            label={activity.type.toUpperCase()} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={activity.status.replace('_', ' ').toUpperCase()} 
                            size="small" 
                            color={getStatusColor(activity.status) as any}
                          />
                          {getPriorityIcon(activity.priority)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {activity.description}
                            </Typography>
                          )}
                          <Box display="flex" alignItems="center" gap={2}>
                            {activity.due_date && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  Due: {formatDate(activity.due_date)}
                                </Typography>
                              </Box>
                            )}
                            {activity.duration_minutes && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <ScheduleIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {activity.duration_minutes} min
                                </Typography>
                              </Box>
                            )}
                            {activity.location && (
                              <Typography variant="body2" color="text.secondary">
                                📍 {activity.location}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        {activity.status !== 'completed' && (
                          <Tooltip title="Mark as Complete">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleCompleteActivity(activity.id)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <PermissionGuard permission={PERMISSIONS.ACTIVITIES.UPDATE}>
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.ACTIVITIES.DELETE}>
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </PermissionGuard>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Activity Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Activity</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Subject"
                value={newActivity.subject}
                onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newActivity.type}
                  label="Type"
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as ActivityType })}
                >
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={newActivity.due_date}
                onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newActivity.priority}
                  label="Priority"
                  onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value as ActivityPriority })}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={newActivity.duration_minutes}
                onChange={(e) => setNewActivity({ ...newActivity, duration_minutes: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={newActivity.location}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateActivity} 
            variant="contained"
            disabled={!newActivity.subject}
          >
            Create Activity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Activities; 