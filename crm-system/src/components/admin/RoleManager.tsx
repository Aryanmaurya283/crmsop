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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionService, PERMISSIONS, type UserRole } from '../../services/permissions';
import { LoadingSpinner } from '../common';

interface RoleManagerProps {
  onRoleUpdated?: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ onRoleUpdated }) => {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, any>,
  });

  const canManageRoles = hasPermission('roles', 'create') || hasPermission('roles', 'update');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await PermissionService.getAllRoles();
      setRoles(rolesData);
      setError(null);
    } catch (err) {
      setError('Failed to load roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {},
    });
    setDialogOpen(true);
  };

  const handleEditRole = (role: UserRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
    });
    setDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        // Update existing role
        const success = await PermissionService.updateRole(
          '', // This would need the current user's clerk ID
          editingRole.id,
          {
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions,
          }
        );
        
        if (success) {
          await loadRoles();
          setDialogOpen(false);
          onRoleUpdated?.();
        } else {
          setError('Failed to update role');
        }
      } else {
        // Create new role
        const success = await PermissionService.createRole('', {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          is_system_role: false,
        });
        
        if (success) {
          await loadRoles();
          setDialogOpen(false);
          onRoleUpdated?.();
        } else {
          setError('Failed to create role');
        }
      }
    } catch (err) {
      setError('Failed to save role');
      console.error('Error saving role:', err);
    }
  };

  const getPermissionChips = (permissions: Record<string, any>) => {
    const permissionList: string[] = [];
    
    Object.entries(permissions).forEach(([resource, actions]) => {
      if (typeof actions === 'object' && actions !== null) {
        Object.entries(actions).forEach(([action, allowed]) => {
          if (allowed) {
            permissionList.push(`${resource}.${action}`);
          }
        });
      }
    });

    return permissionList.slice(0, 5); // Show first 5 permissions
  };

  const getRoleColor = (roleName: string) => {
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

  if (permissionsLoading || loading) {
    return <LoadingSpinner message="Loading roles..." />;
  }

  if (!canManageRoles) {
    return (
      <Alert severity="warning">
        You don't have permission to manage roles.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Role Management
          </Typography>
          {hasPermission('roles', 'create') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateRole}
            >
              Create Role
            </Button>
          )}
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
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SecurityIcon color="action" />
                      <Chip
                        label={role.name.replace('_', ' ').toUpperCase()}
                        color={getRoleColor(role.name) as any}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{role.description || 'No description'}</TableCell>
                  <TableCell>
                    <Chip
                      label={role.is_system_role ? 'System' : 'Custom'}
                      variant={role.is_system_role ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {getPermissionChips(role.permissions).map((permission) => (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {Object.keys(role.permissions).length > 5 && (
                        <Chip
                          label={`+${Object.keys(role.permissions).length - 5} more`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {hasPermission('roles', 'update') && (
                        <Tooltip title="Edit Role">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRole(role)}
                            disabled={role.is_system_role}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasPermission('roles', 'delete') && (
                        <Tooltip title="Delete Role">
                          <IconButton
                            size="small"
                            color="error"
                            disabled={role.is_system_role}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Role Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Role Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Permissions
              </Typography>
              
              {/* This would be a more complex permission editor in a real implementation */}
              <Alert severity="info">
                Permission editor would be implemented here with checkboxes for each resource and action.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} variant="contained">
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RoleManager;