import { useState, useEffect } from 'react';
import { Grid, Box, Typography, Paper, Card, CardContent, LinearProgress, FormControl, InputLabel, Select, MenuItem, Alert, Button } from '@mui/material';
import { TrendingUp, People, Description, Assessment, Timer, CheckCircle, Download } from '@mui/icons-material';
import { statsService, paperService } from '../../services/api';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [summaryStats, setSummaryStats] = useState({});
  const [submissionTrends, setSubmissionTrends] = useState({ labels: [], counts: [] });
  const [statusDistribution, setStatusDistribution] = useState({ labels: [], data: [] });
  const [trackDistribution, setTrackDistribution] = useState({ labels: [], data: [] });
  const [decisionDistribution, setDecisionDistribution] = useState({ labels: [], data: [] });
  const [acceptanceByTrack, setAcceptanceByTrack] = useState({ labels: [], data: [] });
  const [avgReviewScores, setAvgReviewScores] = useState({});

  useEffect(() => { fetchStatistics(); }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [dashboardRes, submissionRes] = await Promise.all([statsService.getDashboardStats(), statsService.getSubmissionStats({ range: timeRange })]);
      const data = dashboardRes.data;
      setSummaryStats(data.summary || {});
      setSubmissionTrends({ labels: submissionRes.data.dates || [], counts: submissionRes.data.counts || [] });
      const statusDist = data.statusDistribution || [];
      setStatusDistribution({ labels: statusDist.map(item => item.status?.replace('_', ' ') || 'Unknown'), data: statusDist.map(item => item.count) });
      const trackDist = data.trackDistribution || [];
      setTrackDistribution({ labels: trackDist.map(item => item.track || 'Other'), data: trackDist.map(item => item.count) });
      const acceptByTrack = data.acceptanceByTrack || [];
      setAcceptanceByTrack({ labels: acceptByTrack.map(item => item.track), data: acceptByTrack.map(item => item.rate) });
      setAvgReviewScores(data.avgReviewScores || {});
    } catch (error) { console.error('Stats error:', error); toast.error('Failed to load statistics'); } finally { setLoading(false); }
  };

  const exportStatistics = async () => {
    try {
      const response = await statsService.getDashboardStats();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `conference-statistics-${new Date().toISOString().split('T')[0]}.json`);
      linkElement.click();
      toast.success('Statistics exported successfully');
    } catch (error) { toast.error('Failed to export statistics'); }
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
    } catch (error) { toast.error('Failed to generate report'); }
  };

  if (loading) return <LinearProgress />;

  const submissionChartData = { labels: submissionTrends.labels, datasets: [{ label: 'Paper Submissions', data: submissionTrends.counts, backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1, fill: false, tension: 0.1 }] };
  const statusChartData = { labels: statusDistribution.labels, datasets: [{ data: statusDistribution.data, backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336', '#9c27b0'] }] };
  const trackChartData = { labels: trackDistribution.labels, datasets: [{ label: 'Papers by Track', data: trackDistribution.data, backgroundColor: 'rgba(153, 102, 255, 0.5)' }] };
  const acceptanceChartData = { labels: acceptanceByTrack.labels, datasets: [{ label: 'Acceptance Rate (%)', data: acceptanceByTrack.data, backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Statistics Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Time Range</InputLabel><Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range"><MenuItem value="week">Last Week</MenuItem><MenuItem value="month">Last Month</MenuItem><MenuItem value="quarter">Last Quarter</MenuItem><MenuItem value="year">Last Year</MenuItem></Select></FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<Download />} onClick={exportStatistics}>Export Data</Button><Button variant="contained" startIcon={<Download />} onClick={generateReport}>Generate Report</Button></Box>
        </Box>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[{ label: 'Total Submissions', value: summaryStats.papers || 0, icon: <Description sx={{ fontSize: 40, color: 'primary.main' }} /> }, { label: 'Total Reviews', value: summaryStats.reviews || 0, icon: <Assessment sx={{ fontSize: 40, color: 'info.main' }} /> }, { label: 'Active Users', value: summaryStats.users || 0, icon: <People sx={{ fontSize: 40, color: 'success.main' }} /> }, { label: 'Acceptance Rate', value: `${((summaryStats.accepted || 0) / (summaryStats.papers || 1) * 100).toFixed(1)}%`, icon: <CheckCircle sx={{ fontSize: 40, color: 'warning.main' }} /> }, { label: 'Avg Review Score', value: `${summaryStats.avgReviewScore || 0}/10`, icon: <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} /> }, { label: 'Review Completion', value: `${((summaryStats.completedReviews || 0) / (summaryStats.assignedReviews || 1) * 100).toFixed(1)}%`, icon: <Timer sx={{ fontSize: 40, color: 'error.main' }} /> }].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={idx}><Card><CardContent sx={{ textAlign: 'center' }}>{stat.icon}<Typography variant="h3" sx={{ mt: 1 }}>{stat.value}</Typography><Typography variant="body2" color="text.secondary">{stat.label}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Submission Trends ({timeRange})</Typography><Box sx={{ height: 300 }}>{submissionTrends.labels?.length ? <Line data={submissionChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /> : <Alert severity="info">No submission data available</Alert>}</Box></Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Paper Status</Typography><Box sx={{ height: 300 }}>{statusDistribution.labels?.length ? <Pie data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} /> : <Alert severity="info">No status data</Alert>}</Box></Paper></Grid>
        <Grid item xs={12} md={6}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Papers by Track</Typography><Box sx={{ height: 300 }}>{trackDistribution.labels?.length ? <Bar data={trackChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} /> : <Alert severity="info">No track data</Alert>}</Box></Paper></Grid>
        <Grid item xs={12} md={6}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Acceptance Rate by Track</Typography><Box sx={{ height: 300 }}>{acceptanceByTrack.labels?.length ? <Bar data={acceptanceChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } } } }} /> : <Alert severity="info">No acceptance data</Alert>}</Box></Paper></Grid>
      </Grid>
      <Paper sx={{ p: 3, mt: 4 }}><Typography variant="h6" gutterBottom>Detailed Statistics</Typography><Grid container spacing={3}><Grid item xs={12} md={6}><Typography variant="subtitle2" gutterBottom>Paper Status Counts</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>{[{ status: 'Submitted', count: summaryStats.submitted || 0, color: 'info.main' }, { status: 'Under Review', count: summaryStats.underReview || 0, color: 'warning.main' }, { status: 'Accepted', count: summaryStats.accepted || 0, color: 'success.main' }, { status: 'Rejected', count: summaryStats.rejected || 0, color: 'error.main' }].map((item, idx) => (<Box key={idx} sx={{ textAlign: 'center', minWidth: 100 }}><Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 1 }}><Typography variant="h6" color="white">{item.count}</Typography></Box><Typography variant="caption">{item.status}</Typography></Box>))}</Box></Grid><Grid item xs={12} md={6}><Typography variant="subtitle2" gutterBottom>Reviewer Performance</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>{[{ metric: 'Avg Overall Score', value: `${avgReviewScores.avgOverall?.toFixed(1) || 0}/10`, color: 'primary.main' }, { metric: 'Avg Originality', value: `${avgReviewScores.avgOriginality?.toFixed(1) || 0}/10`, color: 'info.main' }, { metric: 'Avg Technical', value: `${avgReviewScores.avgTechnical?.toFixed(1) || 0}/10`, color: 'success.main' }, { metric: 'Avg Clarity', value: `${avgReviewScores.avgClarity?.toFixed(1) || 0}/10`, color: 'warning.main' }].map((item, idx) => (<Box key={idx} sx={{ textAlign: 'center', minWidth: 120 }}><Typography variant="h5" color={item.color}>{item.value}</Typography><Typography variant="caption">{item.metric}</Typography></Box>))}</Box></Grid></Grid></Paper>
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}><Typography variant="h6" gutterBottom color="white">📊 Insights & Recommendations</Typography><Grid container spacing={2}><Grid item xs={12} md={6}><Alert severity="success"><Typography variant="subtitle2">Strong Performance</Typography><Typography variant="body2">Review completion rate: {((summaryStats.completedReviews || 0) / (summaryStats.assignedReviews || 1) * 100).toFixed(1)}%</Typography></Alert></Grid><Grid item xs={12} md={6}><Alert severity="warning"><Typography variant="subtitle2">Areas for Improvement</Typography><Typography variant="body2">Average review score: {summaryStats.avgReviewScore || 0}/10. Encourage more detailed feedback.</Typography></Alert></Grid><Grid item xs={12} md={6}><Alert severity="info"><Typography variant="subtitle2">Growth Opportunity</Typography><Typography variant="body2">Total users: {summaryStats.users || 0}. Promote the conference to attract more submissions.</Typography></Alert></Grid><Grid item xs={12} md={6}><Alert severity={((summaryStats.accepted || 0) / (summaryStats.papers || 1) * 100) < 30 ? 'error' : 'success'}><Typography variant="subtitle2">Acceptance Rate</Typography><Typography variant="body2">Current: {((summaryStats.accepted || 0) / (summaryStats.papers || 1) * 100).toFixed(1)}%</Typography></Alert></Grid></Grid></Paper>
    </Box>
  );
};

export default Statistics;