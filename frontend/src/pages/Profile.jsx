import { useState, useEffect } from 'react';
import { Grid, Box, Typography, Paper, TextField, Button, Avatar, Alert, LinearProgress, Divider, Card, CardContent, Chip, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  Warning,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Validation schema
const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  affiliation: yup.string(),
  expertise: yup.string(),
  currentPassword: yup.string().min(6, 'Password must be at least 6 characters'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmPasswordChange, setConfirmPasswordChange] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
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

  const performSave = async (data) => {
    try {
      setSaving(true);
      const updateData = {
        name: data.name,
        email: data.email,
        affiliation: data.affiliation,
        expertise: data.expertise,
      };
      if (data.currentPassword && data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      await updateProfile(updateData);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setConfirmPasswordChange(false);
    }
  };

  const onSubmit = async (data) => {
    if (data.currentPassword && data.newPassword) {
      setPendingData(data);
      setConfirmPasswordChange(true);
      return;
    }
    performSave(data);
  };

  if (authLoading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        <Button
          variant={editMode ? 'outlined' : 'contained'}
          startIcon={editMode ? <Cancel /> : <Edit />}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      {editMode && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are editing your profile. Changes will be saved permanently.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Avatar & Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.role?.toUpperCase()}</Typography>
            <Divider sx={{ my: 2 }} />
            <Chip icon={<Email />} label={user?.email} sx={{ mb: 1, width: '100%', justifyContent: 'flex-start' }} />
            {user?.affiliation && (
              <Chip icon={<School />} label={user.affiliation} sx={{ mb: 1, width: '100%', justifyContent: 'flex-start' }} />
            )}
            {user?.expertise && (
              <Chip icon={<Badge />} label={`Expertise: ${user.expertise}`} sx={{ width: '100%', justifyContent: 'flex-start' }} />
            )}
          </Paper>
        </Grid>

        {/* Right Column - Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Affiliation"
                margin="normal"
                {...register('affiliation')}
                error={!!errors.affiliation}
                helperText={errors.affiliation?.message}
                disabled={!editMode}
              />
              {user?.role === 'reviewer' && (
                <TextField
                  fullWidth
                  label="Expertise Areas"
                  margin="normal"
                  {...register('expertise')}
                  error={!!errors.expertise}
                  helperText={errors.expertise?.message}
                  disabled={!editMode}
                />
              )}

              {editMode && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Change Password (optional)</Typography>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    margin="normal"
                    {...register('currentPassword')}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    margin="normal"
                    {...register('newPassword')}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    margin="normal"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </>
              )}

              {editMode && (
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </form>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6">Account Security</Typography>
            {user?.role === 'admin' ? (
              <Alert severity="info">Admin credentials are managed by system security policies.</Alert>
            ) : (
              <Alert severity="warning">We recommend changing your password every 90 days.</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Password Change Confirmation Dialog */}
      <Dialog open={confirmPasswordChange}>
        <DialogTitle><Warning color="warning" /> Confirm Password Change</DialogTitle>
        <DialogContent>
          <Typography>You are about to change your password. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPasswordChange(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => performSave(pendingData)}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;