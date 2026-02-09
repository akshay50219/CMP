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
  LinearProgress,
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paperToEdit, setPaperToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAbstract, setEditAbstract] = useState('');

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const handleViewPaper = (paperId) => {
    navigate(`/author/papers/${paperId}`);
  };

  const handleEditPaper = (paper) => {
    setPaperToEdit(paper);
    setEditTitle(paper.title);
    setEditAbstract(paper.abstract);
    setEditDialogOpen(true);
  };

  const handleUpdatePaper = async () => {
    try {
      await paperService.updatePaper(paperToEdit._id, {
        title: editTitle,
        abstract: editAbstract,
      });
      toast.success('Paper updated successfully');
      setEditDialogOpen(false);
      fetchPapers();
    } catch (error) {
      toast.error('Failed to update paper');
    }
  };

  const handleDeleteClick = (paper) => {
    setPaperToDelete(paper);
    setDeleteDialogOpen(true);
  };

  const handleDeletePaper = async () => {
    try {
      await paperService.deletePaper(paperToDelete._id);
      toast.success('Paper deleted successfully');
      setDeleteDialogOpen(false);
      fetchPapers();
    } catch (error) {
      toast.error('Failed to delete paper');
    }
  };

  const handleDownloadPaper = async (paperId) => {
    try {
      const response = await paperService.downloadPaper(paperId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paper-${paperId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download paper');
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || paper.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'needs_revision', label: 'Needs Revision' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Papers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchPapers}
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
              placeholder="Search papers by title or abstract..."
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
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Statistics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {statusOptions.slice(1).map((status) => {
          const count = papers.filter(p => p.status === status.value).length;
          return (
            <Paper key={status.value} sx={{ p: 2, minWidth: 150, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {status.label}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Papers Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <LinearProgress />
        ) : filteredPapers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No papers found. Submit your first paper to get started!
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Track</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Last Updated</TableCell>
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
                          <Typography variant="caption" color="text.secondary">
                            {paper.authors?.slice(0, 3).join(', ')}
                            {paper.authors?.length > 3 && '...'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={paper.track} size="small" />
                        </TableCell>
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
                        <TableCell>
                          {new Date(paper.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPaper(paper._id)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {paper.status === 'submitted' && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditPaper(paper)}
                                  color="info"
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadPaper(paper._id)}
                                color="secondary"
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            
                            {paper.status === 'submitted' && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(paper)}
                                  color="error"
                                >
                                  <Delete />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Paper</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Paper Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Abstract"
            fullWidth
            multiline
            rows={8}
            value={editAbstract}
            onChange={(e) => setEditAbstract(e.target.value)}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Note: You can only edit papers that are in "Submitted" status. 
            Once a paper is under review, editing is disabled.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdatePaper} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Paper</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this paper? This action cannot be undone.
          </Alert>
          <Typography>
            <strong>Title:</strong> {paperToDelete?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This paper was submitted on {paperToDelete && new Date(paperToDelete.submissionDate).toLocaleDateString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePaper} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPapers;