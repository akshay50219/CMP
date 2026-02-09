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
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Pending,
  Error,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

const AuthorDashboard = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [papersResponse] = await Promise.all([
        paperService.getMyPapers(),
      ]);

      const papers = papersResponse.data;
      
      // Calculate stats
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
      toast.error('Failed to load dashboard data');
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
      default:
        return <Pending color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      case 'needs_revision':
        return 'warning.main';
      default:
        return 'info.main';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Author Dashboard
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Submit New Paper
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your research paper for conference consideration
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/author/submit')}
            >
              Submit Paper
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              View My Papers
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Track the status of all your submissions
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/author/papers')}
            >
              View Papers
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Submission Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
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
      <Grid container spacing={2}>
        {recentPapers.map((paper) => (
          <Grid item xs={12} key={paper._id}>
            <Card>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    {getStatusIcon(paper.status)}
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">
                      {paper.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted: {new Date(paper.submissionDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getStatusColor(paper.status),
                        fontWeight: 'bold',
                      }}
                    >
                      {paper.status.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      size="small"
                      onClick={() => navigate(`/author/papers/${paper._id}`)}
                    >
                      View Details
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AuthorDashboard;