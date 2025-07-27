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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import { useContacts, useAccounts } from '../hooks/useContacts';
import { PermissionGuard } from '../components/auth';
import { PERMISSIONS } from '../services/permissions';
import { LoadingSpinner } from '../components/common';
import type { Contact, Account } from '../types/contacts';

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
      id={`contacts-tabpanel-${index}`}
      aria-labelledby={`contacts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Contacts: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { contacts, loading: contactsLoading, error: contactsError, total: contactsTotal, applyFilters: applyContactFilters, refresh: refreshContacts, createContact, updateContact, deleteContact, setPrimaryContact } = useContacts();
  const { accounts, loading: accountsLoading, error: accountsError, total: accountsTotal, applyFilters: applyAccountFilters, refresh: refreshAccounts, createAccount, updateAccount, deleteAccount, getIndustries } = useAccounts();
  
  const [tabValue, setTabValue] = useState(0);
  const [contactSearch, setContactSearch] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);

  const canCreateContacts = hasPermission('contacts', 'create');
  const canCreateAccounts = hasPermission('accounts', 'create');

  React.useEffect(() => {
    const loadIndustries = async () => {
      try {
        const industryList = await getIndustries();
        setIndustries(industryList);
      } catch (error) {
        console.error('Failed to load industries:', error);
      }
    };
    loadIndustries();
  }, [getIndustries]);

  const handleContactSearch = (search: string) => {
    setContactSearch(search);
    applyContactFilters({ search });
  };

  const handleAccountSearch = (search: string) => {
    setAccountSearch(search);
    applyAccountFilters({ search });
  };

  const handleIndustryFilter = (industry: string) => {
    setSelectedIndustry(industry);
    applyAccountFilters({ industry: industry || undefined });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!hasPermission('contacts', 'read') && !hasPermission('accounts', 'read')) {
    return (
      <Box>
        <Alert severity="warning">
          You don't have permission to view contacts or accounts.
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
            Contacts & Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your contacts and company accounts
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <PermissionGuard permission={PERMISSIONS.CONTACTS.CREATE}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* TODO: Open create contact dialog */}}
            >
              Add Contact
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.ACCOUNTS.CREATE}>
            <Button
              variant="outlined"
              startIcon={<BusinessIcon />}
              onClick={() => {/* TODO: Open create account dialog */}}
            >
              Add Account
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="contacts tabs">
            <Tab label={`Contacts (${contactsTotal})`} />
            <Tab label={`Accounts (${accountsTotal})`} />
          </Tabs>
        </CardContent>
      </Card>

      {/* Contacts Tab */}
      <TabPanel value={tabValue} index={0}>
        <PermissionGuard permission={PERMISSIONS.CONTACTS.READ}>
          {/* Contact Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField
                fullWidth
                label="Search contacts"
                value={contactSearch}
                onChange={(e) => handleContactSearch(e.target.value)}
                placeholder="Search by name, email, or company..."
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>

          {contactsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {contactsError}
            </Alert>
          )}

          {/* Contacts List */}
          <Card>
            <CardContent>
              {contactsLoading ? (
                <LoadingSpinner message="Loading contacts..." />
              ) : contacts.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No contacts found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contactSearch ? 'Try adjusting your search criteria' : 'Get started by adding your first contact'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {contacts.map((contact) => (
                    <Grid key={contact.id} size={{ xs: 12, md: 6, lg: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {contact.first_name} {contact.last_name}
                              </Typography>
                              {contact.title && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {contact.title}
                                </Typography>
                              )}
                            </Box>
                            <Box display="flex" gap={1}>
                              {contact.is_primary && (
                                <Tooltip title="Primary Contact">
                                  <StarIcon color="primary" fontSize="small" />
                                </Tooltip>
                              )}
                              <PermissionGuard permission={PERMISSIONS.CONTACTS.UPDATE}>
                                <IconButton size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </PermissionGuard>
                              <PermissionGuard permission={PERMISSIONS.CONTACTS.DELETE}>
                                <IconButton size="small" color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </PermissionGuard>
                            </Box>
                          </Box>

                          <Box display="flex" flexDirection="column" gap={1}>
                            {contact.email && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">{contact.email}</Typography>
                              </Box>
                            )}
                            {contact.phone && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{contact.phone}</Typography>
                              </Box>
                            )}
                            {contact.account_id && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <BusinessIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {/* TODO: Show account name */}
                                  Account
                                </Typography>
                              </Box>
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
        </PermissionGuard>
      </TabPanel>

      {/* Accounts Tab */}
      <TabPanel value={tabValue} index={1}>
        <PermissionGuard permission={PERMISSIONS.ACCOUNTS.READ}>
          {/* Account Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Search accounts"
                    value={accountSearch}
                    onChange={(e) => handleAccountSearch(e.target.value)}
                    placeholder="Search by name or industry..."
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={selectedIndustry}
                      label="Industry"
                      onChange={(e) => handleIndustryFilter(e.target.value)}
                    >
                      <MenuItem value="">All Industries</MenuItem>
                      {industries.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {accountsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {accountsError}
            </Alert>
          )}

          {/* Accounts List */}
          <Card>
            <CardContent>
              {accountsLoading ? (
                <LoadingSpinner message="Loading accounts..." />
              ) : accounts.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No accounts found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accountSearch || selectedIndustry ? 'Try adjusting your search criteria' : 'Get started by adding your first account'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {accounts.map((account) => (
                    <Grid key={account.id} size={{ xs: 12, md: 6, lg: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {account.name}
                              </Typography>
                              {account.industry && (
                                <Chip 
                                  label={account.industry} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ mb: 1 }}
                                />
                              )}
                            </Box>
                            <Box display="flex" gap={1}>
                              <PermissionGuard permission={PERMISSIONS.ACCOUNTS.UPDATE}>
                                <IconButton size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </PermissionGuard>
                              <PermissionGuard permission={PERMISSIONS.ACCOUNTS.DELETE}>
                                <IconButton size="small" color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </PermissionGuard>
                            </Box>
                          </Box>

                          <Box display="flex" flexDirection="column" gap={1}>
                            {account.website && (
                              <Typography variant="body2" color="primary">
                                {account.website}
                              </Typography>
                            )}
                            {account.phone && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{account.phone}</Typography>
                              </Box>
                            )}
                            {account.annual_revenue && (
                              <Typography variant="body2" color="text.secondary">
                                Annual Revenue: {formatCurrency(account.annual_revenue)}
                              </Typography>
                            )}
                            {account.employee_count && (
                              <Typography variant="body2" color="text.secondary">
                                {account.employee_count} employees
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
        </PermissionGuard>
      </TabPanel>
    </Box>
  );
};

export default Contacts;