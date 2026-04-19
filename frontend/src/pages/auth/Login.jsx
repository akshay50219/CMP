import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const result = await login(data.email, data.password);

      if (result.success) {
        const userRole = result.user?.role || 'author';
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'reviewer':
            navigate('/reviewer');
            break;
          case 'author':
            navigate('/author');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      {/* Home link */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          component={Link}
          to="/"
          startIcon={<HomeIcon />}
          variant="text"
          size="small"
        >
          Back to Home
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom align="center">
        Sign In
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email Address"
        margin="normal"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        autoComplete="email"
        disabled={isSubmitting}
      />

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="current-password"
        disabled={isSubmitting}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={isSubmitting}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* ❌ Forgot Password Link - Disabled (backend missing) */}
      {/* <Box sx={{ textAlign: 'right', mt: 1 }}>
        <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary">
            Forgot password?
          </Typography>
        </Link>
      </Box> */}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="text" color="primary" disabled={isSubmitting}>
              Sign Up
            </Button>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;