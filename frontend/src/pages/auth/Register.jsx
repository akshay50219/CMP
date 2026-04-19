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
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// ✅ FIXED: Use function-based when() to avoid "branch is not a function"
const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: yup.string().oneOf(['author', 'reviewer']).required('Role is required'),
  affiliation: yup.string().required('Affiliation is required'),
  expertise: yup.string().when('role', {
    is: (val) => val === 'reviewer',
    then: (schema) => schema.required('Expertise is required for reviewers'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'author',      // ✅ ensures select is controlled from start
      affiliation: '',
      expertise: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setError('');
      await registerUser(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button component={Link} to="/" startIcon={<HomeIcon />} variant="text" size="small">
          Back to Home
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom align="center">
        Create Account
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField fullWidth label="Full Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Email Address" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Role" {...register('role')} error={!!errors.role} helperText={errors.role?.message}>
            <MenuItem value="author">Author</MenuItem>
            <MenuItem value="reviewer">Reviewer</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Affiliation" {...register('affiliation')} error={!!errors.affiliation} helperText={errors.affiliation?.message} />
        </Grid>
        {selectedRole === 'reviewer' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Expertise Areas (comma separated)"
              placeholder="e.g., AI, Machine Learning, Data Science"
              {...register('expertise')}
              error={!!errors.expertise}
              helperText={errors.expertise?.message}
            />
          </Grid>
        )}
      </Grid>

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="text" color="primary">Sign In</Button>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;