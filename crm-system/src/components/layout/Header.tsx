import { UserButton } from '@clerk/clerk-react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { isSignedIn, firstName, lastName } = useAuth();

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CRM System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isSignedIn ? (
            <>
              <Chip
                avatar={<Avatar sx={{ width: 24, height: 24 }}>{firstName?.charAt(0)}</Avatar>}
                label={`${firstName} ${lastName}`}
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: {
                      width: '32px',
                      height: '32px',
                    }
                  }
                }}
              />
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/sign-in">
                Sign In
              </Button>
              <Button color="inherit" component={Link} to="/sign-up">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;