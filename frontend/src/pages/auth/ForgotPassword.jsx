import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post('/api/auth/forgot-password', { email });
    toast.success('Reset link sent to your email');
    setSubmitted(true);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to send reset email');
  }
};

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        Forgot Password
      </Typography>

      {submitted ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Password reset functionality is currently under development.
          Once enabled, you will receive a reset link via email.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your registered email address. This feature will be available soon.
          </Typography>

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Continue
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
    </Box>
  );
};

export default ForgotPassword;
