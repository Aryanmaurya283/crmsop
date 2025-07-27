import { Typography, Box, Grid, Paper, Alert, Chip } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useUserSync } from '../hooks/useUserSync';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from '../components/auth';
import { PERMISSIONS } from '../services/permissions';

const Dashboard = () => {
  const { firstName } = useAuth();
  const { isSyncing } = useUserSync();
  const { userRole, isLoading: permissionsLoading } = usePermissions();

  const getRoleDisplayName = (role: string | null) => {
    if (!role) return 'No Role';
    return role.replace('_', ' ').toUpperCase();
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'sales_manager': return 'info';
      case 'sales_executive': return 'primary';
      case 'support_agent': return 'secondary';
      case 'customer': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" component="h1">
            Welcome back, {firstName || 'User'}!
          </Typography>
          {!permissionsLoading && (
            <Chip 
              label={getRoleDisplayName(userRole)} 
              color={getRoleColor(userRole)}
              size="small"
            />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your CRM activities
        </Typography>
      </Box>

      {isSyncing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Synchronizing user data...
        </Alert>
      )}

      <Grid container spacing={3}>
        <PermissionGuard permission={PERMISSIONS.LEADS.READ}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Leads
              </Typography>
              <Typography variant="h3" color="primary" fontWeight="bold">
                0
              </Typography>
            </Paper>
          </Grid>
        </PermissionGuard>

        <PermissionGuard permission={PERMISSIONS.DEALS.READ}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Active Deals
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                0
              </Typography>
            </Paper>
          </Grid>
        </PermissionGuard>

        <PermissionGuard permission={PERMISSIONS.CONTACTS.READ}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Contacts
              </Typography>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                0
              </Typography>
            </Paper>
          </Grid>
        </PermissionGuard>

        <PermissionGuard permission={PERMISSIONS.PROJECTS.READ}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Active Projects
              </Typography>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                0
              </Typography>
            </Paper>
          </Grid>
        </PermissionGuard>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <PermissionGuard permission={PERMISSIONS.LEADS.CREATE}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'grey.50' } }}>
                <Typography variant="h6">Add New Lead</Typography>
                <Typography variant="body2" color="text.secondary">
                  Capture a new potential customer
                </Typography>
              </Paper>
            </Grid>
          </PermissionGuard>

          <PermissionGuard permission={PERMISSIONS.DEALS.CREATE}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'grey.50' } }}>
                <Typography variant="h6">Create Deal</Typography>
                <Typography variant="body2" color="text.secondary">
                  Start tracking a new opportunity
                </Typography>
              </Paper>
            </Grid>
          </PermissionGuard>

          <PermissionGuard permission={PERMISSIONS.REPORTS.READ}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'grey.50' } }}>
                <Typography variant="h6">View Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyze your sales performance
                </Typography>
              </Paper>
            </Grid>
          </PermissionGuard>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;