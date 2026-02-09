import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import {
  Dashboard,
  Description,
  People,
  Assessment,
  Settings,
  CloudUpload,
  RateReview,
  AdminPanelSettings,
  InsertChart,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = ({ open }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const authorMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/author' },
    { text: 'Submit Paper', icon: <CloudUpload />, path: '/author/submit' },
    { text: 'My Papers', icon: <Description />, path: '/author/papers' },
  ];

  const reviewerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/reviewer' },
    { text: 'Assigned Papers', icon: <RateReview />, path: '/reviewer/papers' },
    { text: 'My Reviews', icon: <Description />, path: '/reviewer/reviews' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'All Papers', icon: <Description />, path: '/admin/papers' },
    { text: 'Manage Users', icon: <People />, path: '/admin/users' },
    { text: 'Review Assignment', icon: <RateReview />, path: '/admin/assign' },
    { text: 'Statistics', icon: <InsertChart />, path: '/admin/stats' },
    { text: 'Conference Program', icon: <CalendarToday />, path: '/admin/program' },
    { text: 'System Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'reviewer':
        return reviewerMenuItems;
      default:
        return authorMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px',
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Role: <strong>{user?.role?.toUpperCase()}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.affiliation}
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname.startsWith(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;