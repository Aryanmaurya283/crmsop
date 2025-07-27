import React from 'react';
import { Typography, Box } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Reporting and analytics functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default Reports;