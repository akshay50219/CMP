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
  Alert,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  Download,
  Search,
  Refresh,
  Assignment,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import SkeletonLoader from '../../components/SkeletonLoader';

const AllPapers = () => {
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersRes, usersRes] = await Promise.all([
        paperService.getAllPapers(),
        userService.getAllUsers(),
      ]);

      setPapers(papersRes.data);
      setReviewers(usersRes.data.filter(u => u.role === 'reviewer'));
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = e => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const getStatusColor = status => ({
    submitted: 'info',
    under_review: 'warning',
    accepted: 'success',
    rejected: 'error',
    needs_revision: 'secondary',
  }[status] || 'default');

  const handleConfirmedAction = async () => {
    try {
      if (confirmType === 'assign') {
        await paperService.assignReviewer(selectedPaper._id, selectedReviewer);
        toast.success('Reviewer assigned successfully');
        setAssignDialogOpen(false);
      }

      if (confirmType === 'decision') {
        await paperService.makeDecision(selectedPaper._id, {
          decision,
          comments: decisionComments,
        });
        toast.success(`Paper ${decision} successfully`);
        setDecisionDialogOpen(false);
      }

      fetchData();
    } catch {
      toast.error('Action failed');
    } finally {
      setConfirmOpen(false);
      setConfirmType(null);
    }
  };

  const filteredPapers = papers.filter(p =>
    (p.title + p.abstract + p.submitterName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || p.status === filterStatus) &&
    (filterTrack === 'all' || p.track === filterTrack)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">All Papers</Typography>
        <Button startIcon={<Refresh />} variant="contained" onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth size="small" value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth size="small" value={filterTrack}
              onChange={e => setFilterTrack(e.target.value)}>
              <MenuItem value="all">All Tracks</MenuItem>
              {tracks.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 2 }}><SkeletonLoader rows={8} /></Paper>
      ) : (
        <Paper>
          {filteredPapers.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No papers found</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Track</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPapers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map(paper => (
                        <TableRow key={paper._id}>
                          <TableCell>{paper.title}</TableCell>
                          <TableCell>{paper.submitterName}</TableCell>
                          <TableCell>{paper.track}</TableCell>
                          <TableCell>
                            <Chip
                              label={paper.status.replace('_', ' ')}
                              color={getStatusColor(paper.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => navigate(`/admin/papers/${paper._id}`)}>
                              <Visibility />
                            </IconButton>
                            <IconButton onClick={() => {
                              setSelectedPaper(paper);
                              setConfirmType('assign');
                              setConfirmOpen(true);
                            }}>
                              <Assignment />
                            </IconButton>
                            <IconButton onClick={() => {
                              setSelectedPaper(paper);
                              setConfirmType('decision');
                              setConfirmOpen(true);
                            }}>
                              <CheckCircle />
                            </IconButton>
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

      {/* 🔒 CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          <Warning color="warning" /> Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to proceed with this action?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmedAction}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllPapers;
