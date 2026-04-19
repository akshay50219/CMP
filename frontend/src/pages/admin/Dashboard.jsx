import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Alert } from '@mui/material';
import {
  People,
  Description,
  Assessment,
  TrendingUp,
  Timer,
  CheckCircle,
  Warning,
  Assignment,
  BarChart,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { statsService, paperService, userService } from '../../services/api';
import { toast } from 'react-toastify';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    papers: 0,
    reviews: 0,
    pendingReviews: 0,
    acceptedPapers: 0,
    rejectedPapers: 0,
  });
  const [recentPapers, setRecentPapers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, papersResponse, usersResponse] = await Promise.all([
        statsService.getDashboardStats(),
        paperService.getAllPapers({ limit: 5 }),
        userService.getAllUsers({ limit: 5 }),
      ]);
      const data = statsResponse.data;
      setStats(data.summary);
      setRecentPapers(papersResponse.data);
      setRecentUsers(usersResponse.data);
      setChartData({
        submissionTrends: {
          labels: data.submissionTrends?.labels || [],
          datasets: [{ label: 'Paper Submissions', data: data.submissionTrends?.data || [], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }],
        },
        statusDistribution: {
          labels: data.statusDistribution?.labels || [],
          datasets: [{ data: data.statusDistribution?.data || [], backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'], borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'], borderWidth: 1 }],
        },
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => ({ submitted: 'info', under_review: 'warning', accepted: 'success', rejected: 'error', needs_revision: 'secondary' }[status] || 'default');

  const generateConferenceProgram = async () => {
    try {
      const response = await paperService.generateConferenceProgram();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'conference-program.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Conference program downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate conference program');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Download />} onClick={generateConferenceProgram}>Generate Program</Button>
          <Button variant="contained" onClick={() => navigate('/admin/settings')}>System Settings</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Users', value: stats.users, icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />, path: '/admin/users' },
          { label: 'Total Papers', value: stats.papers, icon: <Description sx={{ fontSize: 40, color: 'info.main' }} />, path: '/admin/papers' },
          { label: 'Total Reviews', value: stats.reviews, icon: <Assessment sx={{ fontSize: 40, color: 'warning.main' }} />, path: '/admin/stats' },
          { label: 'Pending Reviews', value: stats.pendingReviews, icon: <Timer sx={{ fontSize: 40, color: 'error.main' }} />, path: '/admin/assign' },
          { label: 'Accepted Papers', value: stats.acceptedPapers, icon: <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />, path: '/admin/papers?status=accepted' },
          { label: 'Rejected Papers', value: stats.rejectedPapers, icon: <Warning sx={{ fontSize: 40, color: 'error.main' }} />, path: '/admin/papers?status=rejected' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }} onClick={() => navigate(stat.path)}>
              <CardContent sx={{ textAlign: 'center' }}>{stat.icon}<Typography variant="h3" sx={{ mt: 1 }}>{stat.value}</Typography><Typography variant="body2" color="text.secondary">{stat.label}</Typography></CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Submission Trends</Typography><Box sx={{ height: 300 }}>{chartData.submissionTrends?.labels?.length > 0 ? <Bar data={chartData.submissionTrends} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /> : <Alert severity="info">No submission data available</Alert>}</Box></Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Paper Status Distribution</Typography><Box sx={{ height: 300 }}>{chartData.statusDistribution?.labels?.length > 0 ? <Pie data={chartData.statusDistribution} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /> : <Alert severity="info">No status distribution data</Alert>}</Box></Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}><Typography variant="h6">Recent Paper Submissions</Typography><Button variant="outlined" size="small" onClick={() => navigate('/admin/papers')}>View All</Button></Box>
            <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Author</TableCell><TableCell>Track</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead><TableBody>{recentPapers.map((paper) => (<TableRow key={paper._id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/papers/${paper._id}`)}><TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{paper.title}</Typography></TableCell><TableCell><Typography variant="body2">{paper.submitterName}</Typography></TableCell><TableCell><Chip label={paper.track} size="small" /></TableCell><TableCell><Chip label={paper.status.replace('_', ' ')} color={getStatusColor(paper.status)} size="small" /></TableCell><TableCell>{new Date(paper.submissionDate).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table></TableContainer></Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}><Typography variant="h6">Recent User Registrations</Typography><Button variant="outlined" size="small" onClick={() => navigate('/admin/users')}>View All</Button></Box>
            <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Role</TableCell><TableCell>Date</TableCell></TableRow></TableHead><TableBody>{recentUsers.map((user) => (<TableRow key={user._id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${user._id}`)}><TableCell><Typography variant="body2">{user.name}</Typography></TableCell><TableCell><Chip label={user.role} color={user.role === 'admin' ? 'error' : user.role === 'reviewer' ? 'warning' : 'info'} size="small" /></TableCell><TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table></TableContainer></Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light' }}>
        <Typography variant="h6" gutterBottom color="white">Quick Actions</Typography>
        <Grid container spacing={2}>
          {[{ label: 'Assign Reviewers', action: () => navigate('/admin/assign'), icon: <Assignment /> }, { label: 'View Statistics', action: () => navigate('/admin/stats'), icon: <BarChart /> }, { label: 'Manage Users', action: () => navigate('/admin/users'), icon: <People /> }, { label: 'Review Decisions', action: () => navigate('/admin/papers?status=under_review'), icon: <Assessment /> }].map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}><Button fullWidth variant="contained" startIcon={action.icon} onClick={action.action} sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>{action.label}</Button></Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;