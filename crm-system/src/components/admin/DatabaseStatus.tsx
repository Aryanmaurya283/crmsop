import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { DatabaseTester, type DatabaseTestResult } from '../../utils/testDatabase';

const DatabaseStatus: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Record<string, DatabaseTestResult> | null>(null);
  const [overall, setOverall] = useState<boolean | null>(null);

  const runTests = async () => {
    setTesting(true);
    try {
      const testResults = await DatabaseTester.runAllTests();
      setResults(testResults.results);
      setOverall(testResults.overall);
    } catch (error) {
      console.error('Database tests failed:', error);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <StorageIcon color="primary" />
            <Typography variant="h6">Database Status</Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={testing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={runTests}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Again'}
          </Button>
        </Box>

        {overall !== null && (
          <Alert 
            severity={overall ? 'success' : 'error'} 
            sx={{ mb: 2 }}
          >
            {overall 
              ? '✅ Database is properly configured and ready to use!'
              : '❌ Database setup issues detected. Please check the details below.'
            }
          </Alert>
        )}

        {results && (
          <List>
            <ListItem>
              <ListItemIcon>
                {getStatusIcon(results.connection.success)}
              </ListItemIcon>
              <ListItemText
                primary="Database Connection"
                secondary={results.connection.message}
              />
              <Chip
                label={results.connection.success ? 'Connected' : 'Failed'}
                color={getStatusColor(results.connection.success) as any}
                size="small"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                {getStatusIcon(results.tables.success)}
              </ListItemIcon>
              <ListItemText
                primary="Required Tables"
                secondary={results.tables.message}
              />
              <Chip
                label={results.tables.success ? 'All Present' : 'Missing'}
                color={getStatusColor(results.tables.success) as any}
                size="small"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                {getStatusIcon(results.defaultData.success)}
              </ListItemIcon>
              <ListItemText
                primary="Default Data"
                secondary={results.defaultData.message}
              />
              <Chip
                label={results.defaultData.success ? 'Loaded' : 'Missing'}
                color={getStatusColor(results.defaultData.success) as any}
                size="small"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                {getStatusIcon(results.functions.success)}
              </ListItemIcon>
              <ListItemText
                primary="Database Functions"
                secondary={results.functions.message}
              />
              <Chip
                label={results.functions.success ? 'Working' : 'Error'}
                color={getStatusColor(results.functions.success) as any}
                size="small"
              />
            </ListItem>
          </List>
        )}

        {!overall && results && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Setup Instructions:
            </Typography>
            <Typography variant="body2">
              1. Go to your Supabase dashboard → SQL Editor<br/>
              2. Run all migration files in order (001 through 007)<br/>
              3. Check the DATABASE_SETUP.md file for detailed instructions<br/>
              4. Refresh this page to test again
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;