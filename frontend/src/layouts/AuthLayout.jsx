import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        {/* Home Link Button */}
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            variant="outlined"
            size="small"
          >
            Back to Home
          </Button>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Conference Management System
          </Typography>

          <Outlet />

        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;