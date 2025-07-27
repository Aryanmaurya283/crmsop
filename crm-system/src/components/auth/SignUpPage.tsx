import { SignUp } from '@clerk/clerk-react';
import { Box, Paper, Typography } from '@mui/material';

const SignUpPage = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: 'grey.50' }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Join CRM System
        </Typography>
        <SignUp 
          appearance={{
            elements: {
              rootBox: {
                width: '100%',
              },
              card: {
                boxShadow: 'none',
                border: 'none',
              }
            }
          }}
          redirectUrl="/dashboard"
        />
      </Paper>
    </Box>
  );
};

export default SignUpPage;