import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  MenuItem,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Save,
  Notifications,
  Email,
  Schedule,
  Security,
  CloudUpload,
  Description,
  Refresh,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Conference Settings
    conferenceName: 'International Conference on Computing 2024',
    conferenceDate: '2024-11-15',
    submissionDeadline: '2024-09-30',
    reviewDeadline: 14, // days
    notificationEmails: true,
    
    // Review Settings
    minReviewersPerPaper: 2,
    maxReviewersPerPaper: 3,
    reviewCriteria: ['Originality', 'Technical Soundness', 'Clarity', 'Significance', 'References'],
    
    // Email Settings
    emailFrom: 'noreply@conference.org',
    emailSubjectPrefix: '[Conference] ',
    sendSubmissionConfirmations: true,
    sendReviewAssignments: true,
    sendDecisionNotifications: true,
    
    // File Upload Settings
    maxFileSize: 10, // MB
    allowedFileTypes: ['.pdf'],
    enableFileCompression: true,
    
    // System Settings
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: 60, // minutes
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to initial state
      setSettings({
        conferenceName: 'International Conference on Computing 2024',
        conferenceDate: '2024-11-15',
        submissionDeadline: '2024-09-30',
        reviewDeadline: 14,
        notificationEmails: true,
        minReviewersPerPaper: 2,
        maxReviewersPerPaper: 3,
        reviewCriteria: ['Originality', 'Technical Soundness', 'Clarity', 'Significance', 'References'],
        emailFrom: 'noreply@conference.org',
        emailSubjectPrefix: '[Conference] ',
        sendSubmissionConfirmations: true,
        sendReviewAssignments: true,
        sendDecisionNotifications: true,
        maxFileSize: 10,
        allowedFileTypes: ['.pdf'],
        enableFileCompression: true,
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: true,
        sessionTimeout: 60,
      });
      toast.info('Settings reset to default values');
    }
  };

  const handleTestEmail = () => {
    toast.info('Test email would be sent to administrators');
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          System Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetSettings}
            disabled={loading}
          >
            Reset to Default
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Conference Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule />
              Conference Settings
            </Typography>
            
            <TextField
              fullWidth
              label="Conference Name"
              value={settings.conferenceName}
              onChange={(e) => handleSettingChange('conferenceName', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Conference Date"
                  type="date"
                  value={settings.conferenceDate}
                  onChange={(e) => handleSettingChange('conferenceDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Submission Deadline"
                  type="date"
                  value={settings.submissionDeadline}
                  onChange={(e) => handleSettingChange('submissionDeadline', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="Review Deadline (days)"
              type="number"
              value={settings.reviewDeadline}
              onChange={(e) => handleSettingChange('reviewDeadline', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 30 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationEmails}
                  onChange={(e) => handleSettingChange('notificationEmails', e.target.checked)}
                />
              }
              label="Enable Email Notifications"
            />
          </Paper>
        </Grid>

        {/* Review Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description />
              Review Settings
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Min Reviewers per Paper"
                  type="number"
                  value={settings.minReviewersPerPaper}
                  onChange={(e) => handleSettingChange('minReviewersPerPaper', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Reviewers per Paper"
                  type="number"
                  value={settings.maxReviewersPerPaper}
                  onChange={(e) => handleSettingChange('maxReviewersPerPaper', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 5 }}
                />
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" gutterBottom>
              Review Criteria
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {settings.reviewCriteria.map((criteria, index) => (
                <Chip key={index} label={criteria} size="small" />
              ))}
            </Box>
            
            <Alert severity="info">
              Reviewers will evaluate papers based on these criteria with scores from 1-10.
            </Alert>
          </Paper>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email />
              Email Settings
            </Typography>
            
            <TextField
              fullWidth
              label="Sender Email"
              type="email"
              value={settings.emailFrom}
              onChange={(e) => handleSettingChange('emailFrom', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email Subject Prefix"
              value={settings.emailSubjectPrefix}
              onChange={(e) => handleSettingChange('emailSubjectPrefix', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sendSubmissionConfirmations}
                    onChange={(e) => handleSettingChange('sendSubmissionConfirmations', e.target.checked)}
                  />
                }
                label="Send Submission Confirmations"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sendReviewAssignments}
                    onChange={(e) => handleSettingChange('sendReviewAssignments', e.target.checked)}
                  />
                }
                label="Send Review Assignments"
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sendDecisionNotifications}
                  onChange={(e) => handleSettingChange('sendDecisionNotifications', e.target.checked)}
                />
              }
              label="Send Decision Notifications"
            />
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleTestEmail}
              sx={{ mt: 2 }}
            >
              Send Test Email
            </Button>
          </Paper>
        </Grid>

        {/* File Upload Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload />
              File Upload Settings
            </Typography>
            
            <TextField
              fullWidth
              label="Maximum File Size (MB)"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 100 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">MB</InputAdornment>,
              }}
            />
            
            <TextField
              select
              fullWidth
              label="Allowed File Types"
              value={settings.allowedFileTypes[0]}
              onChange={(e) => handleSettingChange('allowedFileTypes', [e.target.value])}
              sx={{ mb: 2 }}
            >
              <MenuItem value=".pdf">PDF only</MenuItem>
              <MenuItem value=".pdf,.doc,.docx">PDF and Word documents</MenuItem>
              <MenuItem value=".pdf,.zip">PDF and Zip archives</MenuItem>
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableFileCompression}
                  onChange={(e) => handleSettingChange('enableFileCompression', e.target.checked)}
                />
              }
              label="Enable File Compression"
            />
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              Larger file sizes may affect upload performance and storage usage.
            </Alert>
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security />
              System Settings
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Access Control
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.allowNewRegistrations}
                            onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
                          />
                        }
                        label="Allow New Registrations"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.requireEmailVerification}
                            onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                          />
                        }
                        label="Require Email Verification"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Session & Security
                    </Typography>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                      inputProps={{ min: 15, max: 480 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleClearCache}
                    >
                      Clear System Cache
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* System Status */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  Online
                </Typography>
                <Typography variant="caption">System Status</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6">24.7 GB</Typography>
                <Typography variant="caption">Storage Used</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6">1,248</Typography>
                <Typography variant="caption">Active Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6">98.7%</Typography>
                <Typography variant="caption">Uptime</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Last Backup:</strong> Today at 02:00 AM
          </Typography>
          <Typography variant="body2">
            <strong>Next Backup:</strong> Tomorrow at 02:00 AM
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default SystemSettings;