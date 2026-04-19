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
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Download,
  Refresh,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';
import SkeletonLoader from '../../components/SkeletonLoader';

const MyPapers = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await paperService.getMyPapers();
      setPapers(response.data);
    } catch (error) {
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (paper) => {
    setPaperToDelete(paper);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paperToDelete) return;
    try {
      setDeleting(true);
      await paperService.withdrawPaper(paperToDelete._id);
      toast.success('Paper deleted successfully');
      fetchPapers(); // refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPaperToDelete(null);
    }
  };

  const handleDownload = async (paperId, title) => {
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
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || paper.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
      needs_revision: 'Needs Revision',
    };
    return labels[status] || status;
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Papers</Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchPapers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
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
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="needs_revision">Needs Revision</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Skeleton Loader */}
      {loading && (
        <Paper sx={{ p: 2 }}>
          <SkeletonLoader rows={6} />
        </Paper>
      )}

      {/* Table */}
      {!loading && (
        <Paper>
          {filteredPapers.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No papers found. Submit your first paper.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPapers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((paper) => (
                        <TableRow key={paper._id}>
                          <TableCell>{paper.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(paper.status)}
                              color={getStatusColor(paper.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(paper.submissionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View">
                              <IconButton onClick={() => navigate(`/author/papers/${paper._id}`)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton onClick={() => handleDownload(paper._id, paper.title)}>
                                <Download />
                              </IconButton>
                            </Tooltip>
                            {paper.status === 'submitted' && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    onClick={() => navigate(`/author/papers/${paper._id}/edit`)}
                                    color="primary"
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={() => handleDeleteClick(paper)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "<strong>{paperToDelete?.title}</strong>"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPapers;