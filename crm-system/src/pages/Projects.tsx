import React from 'react';
import { Typography, Box } from '@mui/material';

const Projects: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Projects
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Project management functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default Projects;