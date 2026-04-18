// 🔹 NO IMPORT REMOVED – ONLY ADDITIONS
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Warning,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/* 🔹 schema unchanged */

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ✅ ADD */
  const [confirmPasswordChange, setConfirmPasswordChange] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(profileSchema),
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

  /* 🔹 EXTRACTED SAVE LOGIC */
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
    /* ✅ PASSWORD CONFIRMATION */
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

      {/* ✅ EDIT MODE WARNING */}
      {editMode && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are editing your profile. Changes will be saved permanently.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* LEFT COLUMN UNCHANGED */}

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* form fields unchanged */}

              {editMode && (
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={() => setEditMode(false)}>
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

          {/* ✅ ROLE-AWARE SECURITY NOTE */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6">Account Security</Typography>

            {user?.role === 'admin' ? (
              <Alert severity="info">
                Admin credentials are managed by system security policies.
              </Alert>
            ) : (
              <Alert severity="warning">
                We recommend changing your password every 90 days.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 🔒 PASSWORD CONFIRMATION DIALOG */}
      <Dialog open={confirmPasswordChange}>
        <DialogTitle>
          <Warning color="warning" /> Confirm Password Change
        </DialogTitle>
        <DialogContent>
          <Typography>
            You are about to change your password. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPasswordChange(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => performSave(pendingData)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
