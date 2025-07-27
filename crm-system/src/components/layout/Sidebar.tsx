import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Typography,
  Divider 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Contacts as ContactsIcon,
  TrendingUp as DealsIcon,
  Assignment as ActivitiesIcon,
  Work as ProjectsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { PermissionGuard } from '../auth';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../services/permissions';

const menuItems = [
  { 
    text: 'Dashboard', 
    path: '/dashboard', 
    icon: <DashboardIcon />,
    permission: null // Dashboard is always accessible
  },
  { 
    text: 'Leads', 
    path: '/leads', 
    icon: <PeopleIcon />,
    permission: PERMISSIONS.LEADS.READ
  },
  { 
    text: 'Contacts', 
    path: '/contacts', 
    icon: <ContactsIcon />,
    permission: PERMISSIONS.CONTACTS.READ
  },
  { 
    text: 'Deals', 
    path: '/deals', 
    icon: <DealsIcon />,
    permission: PERMISSIONS.DEALS.READ
  },
  { 
    text: 'Activities', 
    path: '/activities', 
    icon: <ActivitiesIcon />,
    permission: PERMISSIONS.ACTIVITIES.READ
  },
  { 
    text: 'Projects', 
    path: '/projects', 
    icon: <ProjectsIcon />,
    permission: PERMISSIONS.PROJECTS.READ
  },
  { 
    text: 'Reports', 
    path: '/reports', 
    icon: <ReportsIcon />,
    permission: PERMISSIONS.REPORTS.READ
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = usePermissions();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'primary.dark',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          CRM System
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ overflow: 'auto', mt: 1 }}>
        <List>
          {menuItems.map((item) => {
            const menuItem = (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    color: 'white',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );

            // If no permission required, show the item
            if (!item.permission) {
              return menuItem;
            }

            // Otherwise, wrap with permission guard
            return (
              <PermissionGuard key={item.text} permission={item.permission}>
                {menuItem}
              </PermissionGuard>
            );
          })}

          {/* Admin Settings - only for admins */}
          {isAdmin && (
            <>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/admin"
                  selected={location.pathname.startsWith('/admin')}
                  sx={{
                    color: 'white',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;