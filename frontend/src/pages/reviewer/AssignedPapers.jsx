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
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  RateReview,
  Download,
  Timer,
  Search,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

const AssignedPapers = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAssignedPapers();
  }, []);

  const fetchAssignedPapers = async () => {
    try {
      setLoading(true);
      const response = await paperService.getAssignedPapers();
      setPapers(response.data);
    } catch (error) {
      toast.error('Failed to load assigned papers');
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline, reviewSubmitted) => {
    if (reviewSubmitted) return 'success';
    
    if (!deadline) return 'info';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'error';
    if (diffDays <= 3) return 'warning';
    return 'info';
  };

  const getDeadlineText = (deadline, reviewSubmitted) => {
    if (reviewSubmitted) return 'Completed';
    
    if (!deadline) return 'No deadline';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
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
                         paper.track.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = !paper.reviewSubmitted;
    } else if (filterStatus === 'completed') {
      matchesStatus = paper.reviewSubmitted;
    } else if (filterStatus === 'overdue') {
      const now = new Date();
      const deadlineDate = new Date(paper.reviewDeadline);
      matchesStatus = !paper.reviewSubmitted && deadlineDate < now;
    }
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: papers.length,
    pending: papers.filter(p => !p.reviewSubmitted).length,
    completed: papers.filter(p => p.reviewSubmitted).length,
    overdue: papers.filter(p => {
      if (p.reviewSubmitted) return false;
      if (!p.reviewDeadline) return false;
      const now = new Date();
      const deadlineDate = new Date(p.reviewDeadline);
      return deadlineDate < now;
    }).length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Assigned Papers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchAssignedPapers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Search sx={{ mr: 1, color: 'action.active' }} />
            <TextField
              variant="outlined"
              placeholder="Search papers by title, abstract, or track..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {[
                { value: 'all', label: `All Papers (${statusCounts.all})` },
                { value: 'pending', label: `Pending (${statusCounts.pending})` },
                { value: 'completed', label: `Completed (${statusCounts.completed})` },
                { value: 'overdue', label: `Overdue (${statusCounts.overdue})` },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Status Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Paper key={status} sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {status} Papers
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Papers Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <LinearProgress />
        ) : filteredPapers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No papers assigned to you.
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Paper Title</TableCell>
                    <TableCell>Track</TableCell>
                    <TableCell>Deadline</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPapers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((paper) => (
                      <TableRow key={paper._id} hover>
                        <TableCell>
                          <Typography variant="body1" noWrap sx={{ maxWidth: 300 }}>
                            {paper.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            Authors: {paper.authors?.slice(0, 2).join(', ')}
                            {paper.authors?.length > 2 && '...'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={paper.track} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<Timer />}
                            label={getDeadlineText(paper.reviewDeadline, paper.reviewSubmitted)}
                            color={getDeadlineStatus(paper.reviewDeadline, paper.reviewSubmitted)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={paper.reviewSubmitted ? 'Review Submitted' : 'Pending Review'}
                            color={paper.reviewSubmitted ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(paper.assignmentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Paper">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/reviewer/papers/${paper._id}`)}
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
                            
                            {!paper.reviewSubmitted && (
                              <Tooltip title="Submit Review">
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<RateReview />}
                                  onClick={() => navigate(`/reviewer/review/${paper._id}`)}
                                >
                                  Review
                                </Button>
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

      {/* Review Guidelines */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Review Instructions:
        </Typography>
        <Typography variant="body2">
          1. Download and read the paper thoroughly<br />
          2. Evaluate based on originality, technical soundness, and clarity<br />
          3. Submit your review before the deadline<br />
          4. Use the "Review" button to submit your evaluation
        </Typography>
      </Alert>
    </Box>
  );
};

export default AssignedPapers;