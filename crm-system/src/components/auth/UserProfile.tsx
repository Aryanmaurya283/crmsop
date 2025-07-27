import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useUserSync } from '../../hooks/useUserSync';

interface UserProfileProps {
  showActions?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ showActions = true }) => {
  const { signOut } = useAuth();
  const { 
    supabaseUser, 
    syncSuccess, 
    syncError, 
    isSyncing, 
    refetchUser 
  } = useUserSync();

  const handleRefresh = async () => {
    try {
      await refetchUser();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  if (isSyncing) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Loading user profile...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!syncSuccess) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load user profile: {syncError}
          </Alert>
          {showActions && (
            <Button variant="outlined" onClick={handleRefresh}>
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!supabaseUser) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            User profile not found. Please contact support.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            src={supabaseUser.image_url}
            alt={`${supabaseUser.first_name} ${supabaseUser.last_name}`}
            sx={{ width: 64, height: 64 }}
          >
            {supabaseUser.first_name?.[0]}{supabaseUser.last_name?.[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">
              {supabaseUser.first_name} {supabaseUser.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {supabaseUser.email}
            </Typography>
            {supabaseUser.role && (
              <Chip
                label={supabaseUser.role.name.replace('_', ' ').toUpperCase()}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        {supabaseUser.team && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Team: {supabaseUser.team.name}
            </Typography>
          </Box>
        )}

        {showActions && (
          <Box display="flex" gap={1}>
            <Button variant="outlined" size="small" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              color="error" 
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;