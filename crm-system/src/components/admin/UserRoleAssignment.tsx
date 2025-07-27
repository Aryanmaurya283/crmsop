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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Box,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionService, type UserRole, type UserWithRole } from '../../services/permissions';
import { LoadingSpinner } from '../common';

interface UserRoleAssignmentProps {
  onRoleAssigned?: () => void;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({ onRoleAssigned }) => {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const canManageUsers = hasPermission('users', 'update');

  useEffect(() => {
    if (canManageUsers) {
      loadData();
    }
  }, [canManageUsers]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        loadUsers(),
        PermissionService.getAllRoles(),
      ]);
      setRoles(rolesData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    // This would need to be implemented in the PermissionService
    // For now, return empty array
    return [];
  };

  const handleEditUserRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.id || '');
    setDialogOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      const success = await PermissionService.assignRole(
        selectedUser.clerk_user_id,
        selectedRoleId
      );

      if (success) {
        await loadData();
        setDialogOpen(false);
        setSelectedUser(null);
        setSelectedRoleId('');
        onRoleAssigned?.();
      } else {
        setError('Failed to assign role');
      }
    } catch (err) {
      setError('Failed to assign role');
      console.error('Error assigning role:', err);
    }
  };

  const getRoleColor = (roleName?: string) => {
    if (!roleName) return 'default';
    
    switch (roleName) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'sales_manager':
        return 'info';
      case 'sales_executive':
        return 'success';
      case 'support_agent':
        return 'secondary';
      case 'customer':
        return 'default';
      default:
        return 'primary';
    }
  };

  const formatRoleName = (roleName?: string) => {
    if (!roleName) return 'No Role';
    return roleName.replace('_', ' ').toUpperCase();
  };

  if (permissionsLoading || loading) {
    return <LoadingSpinner message="Loading users and roles..." />;
  }

  if (!canManageUsers) {
    return (
      <Alert severity="warning">
        You don't have permission to manage user roles.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          User Role Assignment
        </Typography>

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
                <TableCell>Current Role</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={user.image_url || undefined}
                          alt={`${user.first_name} ${user.last_name}`}
                          sx={{ width: 32, height: 32 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.first_name} {user.last_name}
                          </Typography>
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
                      {/* Team information would be loaded here */}
                      <Typography variant="body2" color="text.secondary">
                        No team
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditUserRole(user)}
                      >
                        Edit Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Role Assignment Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Assign Role to {selectedUser?.first_name} {selectedUser?.last_name}
          </DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <FormControl fullWidth>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  label="Select Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={formatRoleName(role.name)}
                          color={getRoleColor(role.name) as any}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAssignRole} 
              variant="contained"
              disabled={!selectedRoleId}
            >
              Assign Role
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserRoleAssignment;