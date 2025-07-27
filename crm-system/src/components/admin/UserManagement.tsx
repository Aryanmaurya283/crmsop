import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  Alert,
  Avatar,
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
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import { UserService } from '../../services/users';
import { PermissionService } from '../../services/permissions';
import { LoadingSpinner } from '../common';

interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  title?: string;
  department?: string;
  image_url?: string;
  is_active: boolean;
  role?: {
    id: string;
    name: string;
    description: string;
  };
  team?: {
    id: string;
    name: string;
  };
  created_at: string;
  last_login?: string;
}

interface UserManagementProps {
  onUserUpdated?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserUpdated }) => {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    title: '',
    department: '',
    role_id: '',
    is_active: true,
  });

  const canManageUsers = hasPermission('users', 'update');
  const canCreateUsers = hasPermission('users', 'create');
  const canDeleteUsers = hasPermission('users', 'delete');

  useEffect(() => {
    if (canManageUsers) {
      loadData();
    }
  }, [canManageUsers]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, rolesData] = await Promise.all([
        UserService.getAllUsers(),
        PermissionService.getAllRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      title: user.title || '',
      department: user.department || '',
      role_id: user.role?.id || '',
      is_active: user.is_active,
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const success = await UserService.updateUserProfile(selectedUser.clerk_user_id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        title: editForm.title,
        department: editForm.department,
      });

      if (success && editForm.role_id !== selectedUser.role?.id) {
        await PermissionService.assignRole(selectedUser.clerk_user_id, editForm.role_id);
      }

      if (success && editForm.is_active !== selectedUser.is_active) {
        await UserService.updateUserStatus(selectedUser.clerk_user_id, editForm.is_active);
      }

      if (success) {
        await loadData();
        setEditDialogOpen(false);
        setSelectedUser(null);
        onUserUpdated?.();
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const success = await UserService.updateUserStatus(user.clerk_user_id, !user.is_active);
      if (success) {
        await loadData();
        onUserUpdated?.();
      } else {
        setError('Failed to update user status');
      }
    } catch (err) {
      setError('Failed to update user status');
      console.error('Error updating user status:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (roleName?: string) => {
    switch (roleName) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'sales_manager': return 'info';
      case 'sales_executive': return 'success';
      case 'support_agent': return 'secondary';
      case 'customer': return 'default';
      default: return 'default';
    }
  };

  const formatRoleName = (roleName?: string) => {
    if (!roleName) return 'No Role';
    return roleName.replace('_', ' ').toUpperCase();
  };

  if (permissionsLoading || loading) {
    return <LoadingSpinner message="Loading user management..." />;
  }

  if (!canManageUsers) {
    return (
      <Alert severity="warning">
        You don't have permission to manage users.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            User Management
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={loadData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {canCreateUsers && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {/* TODO: Implement user creation */}}
              >
                Add User
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={user.image_url}
                          alt={`${user.first_name} ${user.last_name}`}
                          sx={{ width: 32, height: 32 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.first_name} {user.last_name}
                          </Typography>
                          {user.title && (
                            <Typography variant="caption" color="text.secondary">
                              {user.title}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatRoleName(user.role?.name)}
                        color={getRoleColor(user.role?.name) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.is_active}
                            onChange={() => handleToggleUserStatus(user)}
                            size="small"
                          />
                        }
                        label={user.is_active ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {canDeleteUsers && (
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {/* TODO: Implement user deletion */}}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Edit User: {selectedUser?.first_name} {selectedUser?.last_name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editForm.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Department"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editForm.role_id}
                    onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                    label="Role"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {formatRoleName(role.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    />
                  }
                  label="Active User"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;