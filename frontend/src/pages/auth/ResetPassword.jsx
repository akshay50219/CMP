import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  // Token will be used later when backend is ready
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`/api/auth/reset-password/${token}`, { password });
    toast.success('Password reset successful. Please login.');
    navigate('/login');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Reset failed');
  }
};

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        Reset Password
      </Typography>

      {submitted ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Password reset functionality is currently under development.
          Once enabled, this page will securely update your password.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your new password below.
          </Typography>

          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Reset Password
          </Button>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary">
            Back to Login
          </Typography>
        </Link>
      </Box>

      {/* 🔍 Token debug (remove later) */}
      {process.env.NODE_ENV === 'development' && token && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          Reset token detected (dev mode)
        </Typography>
      )}
    </Box>
  );
};

export default ResetPassword;
