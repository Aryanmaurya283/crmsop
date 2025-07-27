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
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import { useLeads, useLeadStats } from '../hooks/useLeads';
import { PermissionGuard } from '../components/auth';
import { PERMISSIONS } from '../services/permissions';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFilters } from '../components/leads/LeadFilters';
import { CreateLeadDialog } from '../components/leads/CreateLeadDialog';
import { LoadingSpinner } from '../components/common';

const Leads: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { leads, loading, error, total, applyFilters, refresh } = useLeads();
  const { stats, loading: statsLoading } = useLeadStats();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canCreateLeads = hasPermission('leads', 'create');

  const handleCreateLead = () => {
    setCreateDialogOpen(true);
  };

  const handleLeadCreated = () => {
    setCreateDialogOpen(false);
    refresh();
  };

  if (!hasPermission('leads', 'read')) {
    return (
      <Box>
        <Alert severity="warning">
          You don't have permission to view leads.
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
            Leads
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your sales leads
          </Typography>
        </Box>
        <PermissionGuard permission={PERMISSIONS.LEADS.CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLead}
          >
            Add Lead
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
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalLeads}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Leads
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
                  <StarIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.newLeads}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New Leads
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
                      {stats.qualifiedLeads}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qualified
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
                      {stats.convertedLeads}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Converted
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Conversion Rate */}
      {!statsLoading && stats && (
        <Box mb={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">Conversion Rate</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Percentage of leads converted to customers
                  </Typography>
                </Box>
                <Chip
                  label={`${stats.conversionRate.toFixed(1)}%`}
                  color={stats.conversionRate > 20 ? 'success' : stats.conversionRate > 10 ? 'warning' : 'default'}
                  size="large"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <LeadFilters onFiltersChange={applyFilters} />
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent>
          {loading ? (
            <LoadingSpinner message="Loading leads..." />
          ) : (
            <LeadTable 
              leads={leads} 
              total={total}
              onRefresh={refresh}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Lead Dialog */}
      <CreateLeadDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onLeadCreated={handleLeadCreated}
      />
    </Box>
  );
};

export default Leads;