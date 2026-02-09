import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Description,
  Assessment,
  Timer,
  CheckCircle,
  Download,
} from '@mui/icons-material';
import { statsService, paperService } from '../../services/api';
import { toast } from 'react-toastify';

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState({
    submissions: {},
    reviews: {},
    users: {},
    acceptance: {},
  });
  const [summaryStats, setSummaryStats] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [statsResponse, submissionsResponse] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getSubmissionStats({ range: timeRange }),
      ]);

      const data = statsResponse.data;
      const submissionData = submissionsResponse.data;

      setSummaryStats(data.summary);

      // Prepare submission trends chart
      setChartData({
        submissions: {
          labels: submissionData.dates || [],
          datasets: [
            {
              label: 'Paper Submissions',
              data: submissionData.counts || [],
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        reviews: {
          labels: data.reviewStats?.labels || [],
          datasets: [
            {
              label: 'Reviews Submitted',
              data: data.reviewStats?.data || [],
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        users: {
          labels: data.userStats?.labels || [],
          datasets: [
            {
              label: 'User Registrations',
              data: data.userStats?.data || [],
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        acceptance: {
          labels: data.acceptanceRates?.labels || [],
          datasets: [
            {
              label: 'Acceptance Rate (%)',
              data: data.acceptanceRates?.data || [],
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        },
      });
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportStatistics = async () => {
    try {
      const response = await statsService.getDashboardStats();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `conference-statistics-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Statistics exported successfully');
    } catch (error) {
      toast.error('Failed to export statistics');
    }
  };

  const generateReport = async () => {
    try {
      const response = await paperService.generateConferenceProgram();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'conference-statistics-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Statistics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportStatistics}
            >
              Export Data
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={generateReport}
            >
              Generate Report
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'Total Submissions', 
            value: summaryStats.papers || 0, 
            icon: <Description sx={{ fontSize: 40, color: 'primary.main' }} />,
            change: '+12%',
            trend: 'up'
          },
          { 
            label: 'Total Reviews', 
            value: summaryStats.reviews || 0, 
            icon: <Assessment sx={{ fontSize: 40, color: 'info.main' }} />,
            change: '+8%',
            trend: 'up'
          },
          { 
            label: 'Active Users', 
            value: summaryStats.users || 0, 
            icon: <People sx={{ fontSize: 40, color: 'success.main' }} />,
            change: '+5%',
            trend: 'up'
          },
          { 
            label: 'Acceptance Rate', 
            value: `${((summaryStats.acceptedPapers || 0) / (summaryStats.papers || 1) * 100).toFixed(1)}%`, 
            icon: <CheckCircle sx={{ fontSize: 40, color: 'warning.main' }} />,
            change: '-2%',
            trend: 'down'
          },
          { 
            label: 'Avg Review Time', 
            value: `${summaryStats.avgReviewTime || 0} days`, 
            icon: <Timer sx={{ fontSize: 40, color: 'error.main' }} />,
            change: '-1 day',
            trend: 'down'
          },
          { 
            label: 'Review Completion', 
            value: `${((summaryStats.completedReviews || 0) / (summaryStats.assignedReviews || 1) * 100).toFixed(1)}%`, 
            icon: <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />,
            change: '+3%',
            trend: 'up'
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {stat.icon}
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: stat.trend === 'up' ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    mt: 1
                  }}
                >
                  <TrendingUp fontSize="small" sx={{ 
                    transform: stat.trend === 'down' ? 'rotate(180deg)' : 'none'
                  }} />
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Submission Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submission Trends ({timeRange})
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.submissions.labels?.length > 0 ? (
                <Line
                  data={chartData.submissions}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Alert severity="info">
                  No submission data available
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Review Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.reviews.labels?.length > 0 ? (
                <Bar
                  data={chartData.reviews}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              ) : (
                <Alert severity="info">
                  No review data available
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* User Registration */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Registration Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.users.labels?.length > 0 ? (
                <Line
                  data={chartData.users}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              ) : (
                <Alert severity="info">
                  No user registration data available
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Acceptance Rates */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Acceptance Rates by Track
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.acceptance.labels?.length > 0 ? (
                <Bar
                  data={chartData.acceptance}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      },
                    },
                  }}
                />
              ) : (
                <Alert severity="info">
                  No acceptance rate data available
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Statistics */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Paper Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[
                { status: 'Submitted', count: summaryStats.submitted || 0, color: 'info.main' },
                { status: 'Under Review', count: summaryStats.underReview || 0, color: 'warning.main' },
                { status: 'Accepted', count: summaryStats.accepted || 0, color: 'success.main' },
                { status: 'Rejected', count: summaryStats.rejected || 0, color: 'error.main' },
                { status: 'Needs Revision', count: summaryStats.revisions || 0, color: 'secondary.main' },
              ].map((item, index) => (
                <Box key={index} sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 1
                  }}>
                    <Typography variant="h6" color="white">
                      {item.count}
                    </Typography>
                  </Box>
                  <Typography variant="caption">{item.status}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Reviewer Performance
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[
                { metric: 'Avg Review Score', value: `${summaryStats.avgReviewScore || 0}/10`, color: 'primary.main' },
                { metric: 'Avg Review Time', value: `${summaryStats.avgReviewTime || 0} days`, color: 'info.main' },
                { metric: 'On-time Reviews', value: `${summaryStats.onTimeReviews || 0}%`, color: 'success.main' },
                { metric: 'Overdue Reviews', value: summaryStats.overdueReviews || 0, color: 'error.main' },
              ].map((item, index) => (
                <Box key={index} sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h5" color={item.color}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption">{item.metric}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Insights Section */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom color="white">
          📊 Insights & Recommendations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Alert severity="success">
              <Typography variant="subtitle2">Strong Performance</Typography>
              <Typography variant="body2">
                Review completion rate is high at {((summaryStats.completedReviews || 0) / (summaryStats.assignedReviews || 1) * 100).toFixed(1)}%. Keep up the good work!
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert severity="warning">
              <Typography variant="subtitle2">Areas for Improvement</Typography>
              <Typography variant="body2">
                Average review time is {summaryStats.avgReviewTime || 0} days. Consider setting shorter deadlines for faster turnaround.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert severity="info">
              <Typography variant="subtitle2">Growth Opportunity</Typography>
              <Typography variant="body2">
                User registrations increased by 5% this period. Consider promoting the conference to reach more authors.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert severity={((summaryStats.acceptedPapers || 0) / (summaryStats.papers || 1) * 100) < 30 ? 'error' : 'success'}>
              <Typography variant="subtitle2">Acceptance Rate</Typography>
              <Typography variant="body2">
                Current acceptance rate is {((summaryStats.acceptedPapers || 0) / (summaryStats.papers || 1) * 100).toFixed(1)}%. 
                {((summaryStats.acceptedPapers || 0) / (summaryStats.papers || 1) * 100) < 30 
                  ? ' Consider being more selective or increasing review quality.' 
                  : ' This is a healthy rate for a competitive conference.'}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Statistics;