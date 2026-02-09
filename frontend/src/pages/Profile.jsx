import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Alert,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Save,
  Person,
  Email,
  School,
  Badge,
  Visibility,
  VisibilityOff,
  Edit,
  Cancel,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  affiliation: yup.string().required('Affiliation is required'),
  expertise: yup.string(),
  currentPassword: yup.string(),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .when('currentPassword', {
      is: (val) => val && val.length > 0,
      then: yup.string().required('New password is required when changing password'),
    }),
  confirmPassword: yup.string()
    .when('newPassword', {
      is: (val) => val && val.length > 0,
      then: yup.string()
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
});

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      affiliation: '',
      expertise: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        affiliation: user.affiliation || '',
        expertise: user.expertise || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // Prepare update data
      const updateData = {
        name: data.name,
        email: data.email,
        affiliation: data.affiliation,
        expertise: data.expertise,
      };

      // Add password change if provided
      if (data.currentPassword && data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      await updateProfile(updateData);
      
      // Reset password fields
      reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      affiliation: user?.affiliation || '',
      expertise: user?.expertise || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditMode(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Profile
        </Typography>
        <Button
          variant={editMode ? "outlined" : "contained"}
          startIcon={editMode ? <Cancel /> : <Edit />}
          onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: 'primary.main',
                margin: '0 auto 16px',
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            
            <Chip
              label={user?.role?.toUpperCase()}
              color={
                user?.role === 'admin' ? 'error' :
                user?.role === 'reviewer' ? 'warning' : 'info'
              }
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" />
                {user?.email}
              </Typography>
              
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <School fontSize="small" />
                {user?.affiliation}
              </Typography>
              
              {user?.expertise && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge fontSize="small" />
                  {user?.expertise}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="caption" color="text.secondary">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Paper>

          {/* Account Statistics */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Papers Submitted
                  </Typography>
                  <Typography variant="h6">0</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reviews Completed
                  </Typography>
                  <Typography variant="h6">0</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Affiliation"
                    {...register('affiliation')}
                    error={!!errors.affiliation}
                    helperText={errors.affiliation?.message}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <School />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                {user?.role === 'reviewer' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Expertise Areas"
                      {...register('expertise')}
                      error={!!errors.expertise}
                      helperText={errors.expertise?.message || "Comma-separated list of your expertise areas"}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Password Change Section */}
              {editMode && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Change Password
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Leave password fields blank if you don't want to change your password.
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('currentPassword')}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword?.message}
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
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        {...register('newPassword')}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Save Button */}
              {editMode && (
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </form>
          </Paper>

          {/* Account Security */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Security
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Last password change:</strong> Never
              </Typography>
              <Typography variant="body2">
                <strong>Last login:</strong> {new Date().toLocaleDateString()}
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              For security reasons, we recommend changing your password every 90 days.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;