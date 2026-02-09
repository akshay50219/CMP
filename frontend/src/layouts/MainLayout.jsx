import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/common/Navbar'; // Fixed import path
import Sidebar from '../components/common/Sidebar'; // Fixed import path
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Fixed import path

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Don't show sidebar on home page
  const showSidebar = isAuthenticated && location.pathname !== '/';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isAuthenticated && (
        <Navbar 
          sidebarOpen={sidebarOpen && showSidebar} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
      )}
      
      {showSidebar && <Sidebar open={sidebarOpen} />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isAuthenticated ? 3 : 0,
          marginTop: isAuthenticated ? '64px' : 0,
          width: showSidebar && sidebarOpen ? 'calc(100% - 240px)' : '100%',
          transition: isAuthenticated ? 'width 0.3s' : 'none'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;