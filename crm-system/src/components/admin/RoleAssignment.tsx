import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PermissionService, type UserRole } from '../../services/permissions';

interface RoleAssignmentProps {
  open: boolean;
  onClose: () => void;
  userClerkId: string;
  userName: string;
  currentRoleId?: string;
  onRoleAssigned?: () => void;
}

const RoleAssignment = ({
  open,
  onClose,
  userClerkId,
  userName,
  currentRoleId,
  onRoleAssigned,
}: RoleAssignmentProps) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      if (!open) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const rolesData = await PermissionService.getAllRoles();
        setRoles(rolesData);
      } catch (err) {
        setError('Failed to load roles');
        console.error('Error loading roles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [open]);

  useEffect(() => {
    setSelectedRoleId(currentRoleId || '');
  }, [currentRoleId]);

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    setIsAssigning(true);
    setError(null);

    try {
      const success = await PermissionService.assignRole(userClerkId, selectedRoleId);
      
      if (success) {
        onRoleAssigned?.();
        onClose();
      } else {
        setError('Failed to assign role');
      }
    } catch (err) {
      setError('Failed to assign role');
      console.error('Error assigning role:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    if (!isAssigning) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Role to {userName}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRoleId}
              label="Role"
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={isAssigning}
            >
              <MenuItem value="">
                <em>No Role</em>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name.replace('_', ' ').toUpperCase()}
                  {role.description && ` - ${role.description}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isAssigning}>
          Cancel
        </Button>
        <Button
          onClick={handleAssignRole}
          variant="contained"
          disabled={!selectedRoleId || isAssigning || isLoading}
        >
          {isAssigning ? <CircularProgress size={20} /> : 'Assign Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleAssignment;