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
import { paperService, reviewerService } from '../../services/api';
import { toast } from 'react-toastify';
import SkeletonLoader from '../../components/SkeletonLoader';

const AssignedPapers = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  useEffect(() => {
    fetchAssignedPapers();
  }, []);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  // ✅ Corrected download function using reviewId
  const handleDownloadPaper = async (reviewId, title) => {
    try {
      const response = await reviewerService.downloadPaperForReview(reviewId);
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
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.track.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'pending') return matchesSearch && !paper.reviewSubmitted;
    if (filterStatus === 'completed') return matchesSearch && paper.reviewSubmitted;
    if (filterStatus === 'overdue') {
      if (!paper.reviewDeadline || paper.reviewSubmitted) return false;
      return matchesSearch && new Date(paper.reviewDeadline) < new Date();
    }
    return matchesSearch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Assigned Papers</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchAssignedPapers} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Search />
          <TextField
            size="small"
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <FilterList />
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {loading && (
        <Paper sx={{ p: 2 }}>
          <SkeletonLoader rows={6} />
        </Paper>
      )}

      {!loading && (
        <Paper>
          {filteredPapers.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No papers assigned to you.</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Track</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPapers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((paper) => (
                        <TableRow key={paper._id}>
                          <TableCell>{paper.title}</TableCell>
                          <TableCell>{paper.track}</TableCell>
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
                              label={paper.reviewSubmitted ? 'Completed' : 'Pending'}
                              color={paper.reviewSubmitted ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View">
                              <IconButton onClick={() => navigate(`/reviewer/papers/${paper._id}`)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton onClick={() => handleDownloadPaper(paper.reviewId, paper.title)}>
                                <Download />
                              </IconButton>
                            </Tooltip>
                            {!paper.reviewSubmitted && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<RateReview />}
                                onClick={() => navigate(`/reviewer/review/${paper._id}`)}
                              >
                                Review
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredPapers.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AssignedPapers;