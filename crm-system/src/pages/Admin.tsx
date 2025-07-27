import {
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { usePermissions } from '../hooks/usePermissions';
import { UserManagement, DatabaseStatus } from '../components/admin';

const Admin = () => {
  const { isSuperAdmin, isAdmin } = usePermissions();

  const handleRoleAssigned = () => {
    // Callback for when user roles are updated
    console.log('User role updated');
  };

  if (!isAdmin) {
    return (
      <Box>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, roles, and system settings
        </Typography>
      </Box>



      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <DatabaseStatus />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <UserManagement onUserUpdated={handleRoleAssigned} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Your Role: <Chip label={isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'} color="warning" size="small" />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Database: Supabase (Configure connection in .env)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Authentication: Clerk
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Users: Loading...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Active Users: Loading...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Roles Configured: 6
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>


    </Box>
  );
};

export default Admin;