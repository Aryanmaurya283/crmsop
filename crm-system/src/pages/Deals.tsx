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
  Slider,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import { useDeals, useDealStats, usePipelineStages, useForecast } from '../hooks/useDeals';
import { useAccounts } from '../hooks/useContacts';
import { PermissionGuard } from '../components/auth';
import { PERMISSIONS } from '../services/permissions';
import { LoadingSpinner } from '../components/common';
import type { Deal } from '../types/deals';

const Deals: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { deals, loading, error, total, applyFilters, refresh, createDeal, updateDeal, deleteDeal, updateDealStage, closeDeal } = useDeals();
  const { stats, loading: statsLoading } = useDealStats();
  const { stages, loading: stagesLoading } = usePipelineStages();
  const { forecast, loading: forecastLoading } = useForecast(6);
  const { accounts } = useAccounts();
  
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    account_id: '',
    amount: '',
    stage: 'prospecting',
    probability: 10,
    expected_close_date: '',
  });

  const canCreateDeals = hasPermission('deals', 'create');

  const handleStageFilter = (stage: string) => {
    setSelectedStage(stage);
    applyFilters({ stage: stage || undefined });
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    applyFilters({ search });
  };

  const handleCreateDeal = async () => {
    try {
      await createDeal({
        name: newDeal.name,
        account_id: newDeal.account_id || undefined,
        amount: newDeal.amount ? parseFloat(newDeal.amount) : undefined,
        stage: newDeal.stage,
        probability: newDeal.probability,
        expected_close_date: newDeal.expected_close_date || undefined,
      });
      setCreateDialogOpen(false);
      setNewDeal({
        name: '',
        account_id: '',
        amount: '',
        stage: 'prospecting',
        probability: 10,
        expected_close_date: '',
      });
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
  };

  const handleCloseDeal = async (dealId: string, won: boolean) => {
    try {
      if (won) {
        await closeDeal(dealId);
      } else {
        await updateDealStage(dealId, 'closed_lost', 0);
      }
      refresh();
    } catch (error) {
      console.error('Failed to close deal:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'default';
      case 'qualification': return 'info';
      case 'proposal': return 'warning';
      case 'negotiation': return 'primary';
      case 'closed_won': return 'success';
      case 'closed_lost': return 'error';
      default: return 'default';
    }
  };

  const getStageProbability = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 10;
      case 'qualification': return 25;
      case 'proposal': return 50;
      case 'negotiation': return 75;
      case 'closed_won': return 100;
      case 'closed_lost': return 0;
      default: return 0;
    }
  };

  if (!hasPermission('deals', 'read')) {
    return (
      <Box>
        <Alert severity="warning">
          You don't have permission to view deals.
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
            Deals & Pipeline
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your sales pipeline and track opportunities
          </Typography>
        </Box>
        <PermissionGuard permission={PERMISSIONS.DEALS.CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Deal
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
                  <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.totalValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Pipeline Value
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
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalDeals}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Deals
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
                  <CheckCircleIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.winRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Win Rate
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
                  <MoneyIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.averageDealSize)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Deal Size
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pipeline Stages */}
      {!stagesLoading && stages && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pipeline Overview
            </Typography>
            <Grid container spacing={2}>
              {stages.map((stage) => (
                <Grid key={stage.stage} size={{ xs: 12, sm: 6, md: 2 }}>
                  <Box textAlign="center">
                    <Chip 
                      label={stage.stage.replace('_', ' ').toUpperCase()} 
                      color={getStageColor(stage.stage) as any}
                      variant={selectedStage === stage.stage ? 'filled' : 'outlined'}
                      onClick={() => handleStageFilter(selectedStage === stage.stage ? '' : stage.stage)}
                      sx={{ mb: 1, cursor: 'pointer' }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {stage.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(stage.value)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stage.probability} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Forecast */}
      {!forecastLoading && forecast && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              6-Month Forecast
            </Typography>
            <Grid container spacing={2}>
              {forecast.map((month) => (
                <Grid key={month.month} size={{ xs: 12, sm: 6, md: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(month.expectedRevenue)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Deals List */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Deals ({total})
            </Typography>
            <TextField
              size="small"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>

          {loading ? (
            <LoadingSpinner message="Loading deals..." />
          ) : deals.length === 0 ? (
            <Box textAlign="center" py={4}>
              <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No deals found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || selectedStage ? 'Try adjusting your search criteria' : 'Get started by adding your first deal'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {deals.map((deal) => (
                <Grid key={deal.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom>
                            {deal.name}
                          </Typography>
                          <Chip 
                            label={deal.stage.replace('_', ' ').toUpperCase()} 
                            color={getStageColor(deal.stage) as any}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        <Box display="flex" gap={1}>
                          <PermissionGuard permission={PERMISSIONS.DEALS.UPDATE}>
                            <Tooltip title="Mark as Won">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleCloseDeal(deal.id, true)}
                                disabled={deal.stage === 'closed_won' || deal.stage === 'closed_lost'}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark as Lost">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleCloseDeal(deal.id, false)}
                                disabled={deal.stage === 'closed_won' || deal.stage === 'closed_lost'}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.DEALS.DELETE}>
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </PermissionGuard>
                        </Box>
                      </Box>

                      <Box display="flex" flexDirection="column" gap={1}>
                        {deal.amount && (
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatCurrency(deal.amount)}
                          </Typography>
                        )}
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            Probability: {deal.probability}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={deal.probability} 
                            sx={{ flex: 1, ml: 1 }}
                          />
                        </Box>
                        {deal.account_id && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {/* TODO: Show account name */}
                              Account
                            </Typography>
                          </Box>
                        )}
                        {deal.expected_close_date && (
                          <Typography variant="body2" color="text.secondary">
                            Expected Close: {new Date(deal.expected_close_date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Create Deal Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Deal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Deal Name"
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  value={newDeal.account_id}
                  label="Account"
                  onChange={(e) => setNewDeal({ ...newDeal, account_id: e.target.value })}
                >
                  <MenuItem value="">No Account</MenuItem>
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newDeal.amount}
                onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={newDeal.stage}
                  label="Stage"
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                >
                  <MenuItem value="prospecting">Prospecting</MenuItem>
                  <MenuItem value="qualification">Qualification</MenuItem>
                  <MenuItem value="proposal">Proposal</MenuItem>
                  <MenuItem value="negotiation">Negotiation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography gutterBottom>Probability: {newDeal.probability}%</Typography>
              <Slider
                value={newDeal.probability}
                onChange={(_, value) => setNewDeal({ ...newDeal, probability: value as number })}
                min={0}
                max={100}
                step={5}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Expected Close Date"
                type="date"
                value={newDeal.expected_close_date}
                onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateDeal} 
            variant="contained"
            disabled={!newDeal.name}
          >
            Create Deal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deals;