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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem, // ✅ FIX
} from '@mui/material';
import {
  Visibility,
  Edit,
  Search,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../../services/api';
import { toast } from 'react-toastify';

/* ✅ ADD */
import SkeletonLoader from '../../components/SkeletonLoader';

const MyReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  /* ✅ DEFINE BEFORE useEffect */
  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getMyReviews();
      setReviews(response.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  /* ✅ FIX: pagination handlers */
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'accept': return 'success';
      case 'revision': return 'warning';
      case 'reject': return 'error';
      default: return 'default';
    }
  };

  const getRecommendationLabel = (rec) => {
    switch (rec) {
      case 'accept': return 'Accept';
      case 'revision': return 'Revision';
      case 'reject': return 'Reject';
      default: return rec;
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.paperTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comments?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRecommendation =
      filterRecommendation === 'all' ||
      review.recommendation === filterRecommendation;

    return matchesSearch && matchesRecommendation;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Reviews</Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchMyReviews}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Search sx={{ mr: 1 }} />
            <TextField
              size="small"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </Box>

          <TextField
            select
            size="small"
            value={filterRecommendation}
            onChange={(e) => setFilterRecommendation(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="accept">Accept</MenuItem>
            <MenuItem value="revision">Revision</MenuItem>
            <MenuItem value="reject">Reject</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        {loading ? (
          <SkeletonLoader rows={6} />
        ) : filteredReviews.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            You haven’t submitted any reviews yet.
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Paper</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Recommendation</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReviews
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((review) => (
                      <TableRow key={review._id}>
                        <TableCell>{review.paperTitle}</TableCell>
                        <TableCell>
                          {review.overallRating}/10
                          <Rating value={review.overallRating} max={10} readOnly size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRecommendationLabel(review.recommendation)}
                            color={getRecommendationColor(review.recommendation)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(review.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleViewReview(review)}>
                            <Visibility />
                          </IconButton>

                          {/* ❌ EDIT DISABLED */}
                          <IconButton disabled>
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredReviews.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedReview && (
          <>
            <DialogTitle>{selectedReview.paperTitle}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2">{selectedReview.comments}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyReviews;
