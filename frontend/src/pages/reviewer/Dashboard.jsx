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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  RateReview,
  Description,
  Timer,
  CheckCircle,
  Warning,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService, statsService } from '../../services/api';
import { toast } from 'react-toastify';

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    averageRating: 0,
  });
  const [pendingReviews, setPendingReviews] = useState([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assignedResponse, reviewsResponse, statsResponse] = await Promise.all([
        paperService.getAssignedPapers(),
        paperService.getMyReviews(),
        statsService.getDashboardStats(),
      ]);

      const assignedPapers = assignedResponse.data;
      const myReviews = reviewsResponse.data;
      
      // Calculate stats
      const now = new Date();
      const pending = assignedPapers.filter(p => !p.reviewSubmitted);
      const completed = assignedPapers.filter(p => p.reviewSubmitted);
      const overdue = assignedPapers.filter(p => {
        if (!p.reviewDeadline) return false;
        const deadline = new Date(p.reviewDeadline);
        return !p.reviewSubmitted && deadline < now;
      });

      const newStats = {
        assigned: assignedPapers.length,
        pending: pending.length,
        completed: completed.length,
        overdue: overdue.length,
        averageRating: statsResponse.data.averageRating || 0,
      };

      setStats(newStats);
      setPendingReviews(pending.slice(0, 5));
      setRecentlyReviewed(completed.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return 'info';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'error';
    if (diffDays <= 3) return 'warning';
    return 'success';
  };

  const getDeadlineText = (deadline) => {
    if (!deadline) return 'No deadline';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  const handleStartReview = (paperId) => {
    navigate(`/reviewer/review/${paperId}`);
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reviewer Dashboard
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'Assigned Papers', 
            value: stats.assigned, 
            icon: <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary' 
          },
          { 
            label: 'Pending Reviews', 
            value: stats.pending, 
            icon: <RateReview sx={{ fontSize: 40, color: 'warning.main' }} />,
            color: 'warning' 
          },
          { 
            label: 'Completed Reviews', 
            value: stats.completed, 
            icon: <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />,
            color: 'success' 
          },
          { 
            label: 'Overdue Reviews', 
            value: stats.overdue, 
            icon: <Warning sx={{ fontSize: 40, color: 'error.main' }} />,
            color: 'error' 
          },
          { 
            label: 'Avg Rating', 
            value: stats.averageRating.toFixed(1), 
            icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
            color: 'info' 
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {stat.icon}
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Reviews Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Pending Reviews ({stats.pending})
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/reviewer/papers')}
              >
                View All
              </Button>
            </Box>

            {pendingReviews.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No pending reviews
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Paper</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingReviews.map((paper) => (
                      <TableRow key={paper._id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {paper.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {paper.track}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getDeadlineText(paper.reviewDeadline)}
                            size="small"
                            color={getDeadlineStatus(paper.reviewDeadline)}
                            icon={<Timer fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleStartReview(paper._id)}
                          >
                            Start Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Recently Reviewed Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Recently Reviewed ({stats.completed})
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/reviewer/reviews')}
              >
                View All
              </Button>
            </Box>

            {recentlyReviewed.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No reviews submitted yet
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Paper</TableCell>
                      <TableCell>Your Rating</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentlyReviewed.map((paper) => (
                      <TableRow key={paper._id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {paper.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${paper.myReview?.overallRating || 'N/A'}/10`}
                            size="small"
                            color={
                              (paper.myReview?.overallRating || 0) >= 8 ? 'success' :
                              (paper.myReview?.overallRating || 0) >= 6 ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {paper.myReview?.submittedAt ? 
                              new Date(paper.myReview.submittedAt).toLocaleDateString() : 
                              'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Tips */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          📝 Review Guidelines
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Evaluate originality and contribution</li>
              <li>Assess technical soundness</li>
              <li>Check clarity and organization</li>
              <li>Verify references and citations</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Provide constructive feedback</li>
              <li>Maintain professional tone</li>
              <li>Submit before deadline</li>
              <li>Use confidential comments for committee</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReviewerDashboard;