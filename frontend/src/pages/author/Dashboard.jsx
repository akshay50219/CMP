import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Pending,
  Error,
  HourglassEmpty,
  Visibility,
  Add,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    revisions: 0,
  });
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [papersResponse] = await Promise.all([
        paperService.getMyPapers(),
      ]);

      const papers = papersResponse?.data || [];
      
      // Calculate stats - Fixed to match your backend status values
      const newStats = {
        total: papers.length,
        submitted: papers.filter(p => p.status === 'submitted').length,
        underReview: papers.filter(p => p.status === 'under_review').length,
        accepted: papers.filter(p => p.status === 'accepted').length,
        rejected: papers.filter(p => p.status === 'rejected').length,
        revisions: papers.filter(p => p.status === 'needs_revision').length,
      };
      
      setStats(newStats);
      setRecentPapers(papers.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Error color="error" />;
      case 'needs_revision':
        return <Pending color="warning" />;
      case 'under_review':
        return <HourglassEmpty color="info" />;
      default:
        return <Pending color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'warning';
      case 'under_review':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatStatusText = (status) => {
    return status
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Author Dashboard
        </Typography>
        {user && (
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.name}! Manage your conference submissions.
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Submit New Paper
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your research paper for conference consideration
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/author/submit-paper')}
              sx={{ mt: 'auto' }}
            >
              Submit Paper
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              View My Papers
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Track the status of all your submissions
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => navigate('/author/papers')}
              sx={{ mt: 'auto' }}
            >
              View All Papers ({stats.total})
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics Overview */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Submission Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <Card 
              elevation={1}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { 
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ 
                textAlign: 'center',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                  {value}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textTransform: 'capitalize',
                    fontWeight: 500,
                    mt: 1
                  }}
                >
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Papers */}
      <Typography variant="h5" gutterBottom>
        Recent Papers
      </Typography>
      
      {recentPapers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            No Papers Submitted Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Start your conference journey by submitting your first paper
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/author/submit-paper')}
            sx={{ mt: 2 }}
          >
            Submit Your First Paper
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {recentPapers.map((paper) => (
              <Grid item xs={12} key={paper._id}>
                <Card
                  elevation={1}
                  sx={{
                    '&:hover': {
                      boxShadow: 3,
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        {getStatusIcon(paper.status)}
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6" noWrap>
                          {paper.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Submitted: {new Date(paper.createdAt || paper.submissionDate).toLocaleDateString()}
                        </Typography>
                        {paper.keywords && paper.keywords.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {paper.keywords.slice(0, 3).map((keyword, index) => (
                              <Chip
                                key={index}
                                label={keyword}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                            {paper.keywords.length > 3 && (
                              <Chip
                                label={`+${paper.keywords.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
                      </Grid>
                      <Grid item>
                        <Chip
                          label={formatStatusText(paper.status)}
                          color={getStatusColor(paper.status)}
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: 120 }}
                        />
                        {paper.finalDecision && paper.finalDecision !== 'pending' && (
                          <Chip
                            label={`Final: ${paper.finalDecision}`}
                            color={paper.finalDecision === 'accept' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, fontWeight: 'bold' }}
                          />
                        )}
                      </Grid>
                      <Grid item>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/author/papers/${paper._id}`)}
                          variant="outlined"
                        >
                          Details
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {stats.total > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                component={Link}
                to="/author/papers"
                variant="text"
                sx={{ textTransform: 'none' }}
              >
                View All Papers ({stats.total})
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Performance Tips */}
      {recentPapers.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mt: 4 }}
          icon={<CheckCircle />}
        >
          <Typography variant="body2">
            <strong>Submission Tips:</strong> Ensure your papers follow the conference guidelines. 
            Papers with complete abstracts and relevant keywords typically receive faster reviews.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default AuthorDashboard;