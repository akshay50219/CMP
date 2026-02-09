import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Download,
  Search,
  FilterList,
  Refresh,
  Assignment,
  CheckCircle,
  Close,
  RateReview,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService, userService } from '../../services/api';
import { toast } from 'react-toastify';

const AllPapers = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [reviewers, setReviewers] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [decision, setDecision] = useState('');
  const [decisionComments, setDecisionComments] = useState('');

  const tracks = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Computer Vision',
    'Natural Language Processing',
    'Robotics',
    'Cybersecurity',
    'Software Engineering',
    'Cloud Computing',
    'Internet of Things',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersResponse, usersResponse] = await Promise.all([
        paperService.getAllPapers(),
        userService.getAllUsers(),
      ]);

      setPapers(papersResponse.data);
      setReviewers(usersResponse.data.filter(user => user.role === 'reviewer'));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'info',
      under_review: 'warning',
      accepted: 'success',
      rejected: 'error',
      needs_revision: 'secondary',
    };
    return colors[status] || 'default';
  };

  const handleAssignReviewer = async () => {
    try {
      await paperService.assignReviewer(selectedPaper._id, selectedReviewer);
      toast.success('Reviewer assigned successfully');
      setAssignDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign reviewer');
    }
  };

  const handleMakeDecision = async () => {
    try {
      await paperService.makeDecision(selectedPaper._id, {
        decision,
        comments: decisionComments,
      });
      toast.success(`Paper ${decision} successfully`);
      setDecisionDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to make decision');
    }
  };

  const handleDownloadPaper = async (paperId, title) => {
    try {
      const response = await paperService.downloadPaper(paperId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paper-${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download paper');
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.submitterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || paper.status === filterStatus;
    const matchesTrack = filterTrack === 'all' || paper.track === filterTrack;
    
    return matchesSearch && matchesStatus && matchesTrack;
  });

  const statusCounts = {
    all: papers.length,
    submitted: papers.filter(p => p.status === 'submitted').length,
    under_review: papers.filter(p => p.status === 'under_review').length,
    accepted: papers.filter(p => p.status === 'accepted').length,
    rejected: papers.filter(p => p.status === 'rejected').length,
    needs_revision: papers.filter(p => p.status === 'needs_revision').length,
  };

  const trackCounts = tracks.reduce((acc, track) => {
    acc[track] = papers.filter(p => p.track === track).length;
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          All Papers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Search sx={{ mr: 1, color: 'action.active' }} />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search papers by title, abstract, or author..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <TextField
                select
                fullWidth
                size="small"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="needs_revision">Needs Revision</MenuItem>
              </TextField>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              label="Track"
            >
              <MenuItem value="all">All Tracks</MenuItem>
              {tracks.map((track) => (
                <MenuItem key={track} value={track}>
                  {track} ({trackCounts[track] || 0})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Paper Status Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <Box key={status} sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="h6" color="primary">
                {count}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                {status.replace('_', ' ')}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Papers Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <LinearProgress />
        ) : filteredPapers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No papers found matching your criteria.
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Track</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reviewers</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPapers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((paper) => (
                      <TableRow key={paper._id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {paper.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {paper.submitterName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={paper.track} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={paper.status.replace('_', ' ')}
                            color={getStatusColor(paper.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {paper.assignedReviewers?.map((reviewer, index) => (
                              <Chip
                                key={index}
                                label={reviewer.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(paper.submissionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/papers/${paper._id}`)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Download Paper">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadPaper(paper._id, paper.title)}
                                color="secondary"
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            
                            {paper.status === 'submitted' && (
                              <Tooltip title="Assign Reviewer">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedPaper(paper);
                                    setAssignDialogOpen(true);
                                  }}
                                  color="warning"
                                >
                                  <Assignment />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {paper.status === 'under_review' && (
                              <Tooltip title="Make Decision">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedPaper(paper);
                                    setDecisionDialogOpen(true);
                                  }}
                                  color="info"
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPapers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Assign Reviewer Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Reviewer
          <Typography variant="subtitle2" color="text.secondary">
            {selectedPaper?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Reviewer</InputLabel>
            <Select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              label="Select Reviewer"
            >
              {reviewers.map((reviewer) => (
                <MenuItem key={reviewer._id} value={reviewer._id}>
                  {reviewer.name} ({reviewer.expertise})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="info" sx={{ mt: 2 }}>
            This paper will be assigned to the selected reviewer for evaluation.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignReviewer}
            variant="contained"
            disabled={!selectedReviewer}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Make Decision Dialog */}
      <Dialog open={decisionDialogOpen} onClose={() => setDecisionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Make Decision
          <Typography variant="subtitle2" color="text.secondary">
            {selectedPaper?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Decision</InputLabel>
            <Select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              label="Decision"
            >
              <MenuItem value="accept">Accept</MenuItem>
              <MenuItem value="reject">Reject</MenuItem>
              <MenuItem value="needs_revision">Needs Revision</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Decision Comments"
            value={decisionComments}
            onChange={(e) => setDecisionComments(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Provide comments explaining your decision..."
          />
          
          {selectedPaper?.reviews?.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This paper has {selectedPaper.reviews.length} review(s). Average rating: {
                (selectedPaper.reviews.reduce((acc, r) => acc + r.overallRating, 0) / selectedPaper.reviews.length).toFixed(1)
              }/10
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMakeDecision}
            variant="contained"
            disabled={!decision}
            color={decision === 'accept' ? 'success' : decision === 'reject' ? 'error' : 'warning'}
          >
            {decision === 'accept' && 'Accept Paper'}
            {decision === 'reject' && 'Reject Paper'}
            {decision === 'needs_revision' && 'Request Revision'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllPapers;