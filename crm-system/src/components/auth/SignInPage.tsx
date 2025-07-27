import { SignIn } from '@clerk/clerk-react';
import { Box, Paper, Typography } from '@mui/material';

const SignInPage = () => {
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
          Welcome to CRM System
        </Typography>
        <SignIn 
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

export default SignInPage;