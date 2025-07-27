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
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

const ActivitiesNew: React.FC = () => {
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
      await createActivity(newActivity);
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
      refresh();
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
                  <WarningIcon color="warning" sx={{ fontSize: 40 }} />
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
                  <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.upcomingActivities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
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
                Overdue Activities
              </Typography>
              {overdueLoading ? (
                <LoadingSpinner />
              ) : overdueActivities.length > 0 ? (
                <List dense>
                  {overdueActivities.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.subject}
                        secondary={`Due: ${formatDate(activity.due_date)}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={activity.priority}
                          color={getPriorityColor(activity.priority)}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No overdue activities
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Activities (Next 7 Days)
              </Typography>
              {upcomingLoading ? (
                <LoadingSpinner />
              ) : upcomingActivities.length > 0 ? (
                <List dense>
                  {upcomingActivities.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.subject}
                        secondary={`Due: ${formatDate(activity.due_date)}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={activity.status}
                          color={getStatusColor(activity.status)}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming activities
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Activities" />
              <Tab label="Tasks" />
              <Tab label="Calls" />
              <Tab label="Meetings" />
              <Tab label="Emails" />
            </Tabs>
          </Box>

          {/* Filters */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedType}
                    label="Type"
                    onChange={(e) => handleTypeFilter(e.target.value as ActivityType)}
                  >
                    {types.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => handleStatusFilter(e.target.value as ActivityStatus)}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={selectedPriority}
                    label="Priority"
                    onChange={(e) => handlePriorityFilter(e.target.value as ActivityPriority)}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Activities List */}
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : activities.length > 0 ? (
              <List>
                {activities.map((activity) => (
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
                            {getPriorityIcon(activity.priority)}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              <Chip
                                label={activity.status}
                                color={getStatusColor(activity.status)}
                                size="small"
                              />
                              <Chip
                                label={activity.priority}
                                color={getPriorityColor(activity.priority)}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                Due: {formatDate(activity.due_date)} at {formatTime(activity.due_date)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          {activity.status !== 'completed' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteActivity(activity.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No activities found
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography>Tasks content</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography>Calls content</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography>Meetings content</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography>Emails content</Typography>
          </TabPanel>
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
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Due Date"
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
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
          <Button onClick={handleCreateActivity} variant="contained">
            Create Activity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivitiesNew; 