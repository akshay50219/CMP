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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Search,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { reviewService, paperService } from '../../services/api';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getMyReviews();
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleEditReview = (paperId) => {
    navigate(`/reviewer/review/${paperId}`);
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
    const matchesSearch = review.paperTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comments?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRecommendation = filterRecommendation === 'all' || 
                                 review.recommendation === filterRecommendation;
    
    return matchesSearch && matchesRecommendation;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Reviews
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchMyReviews}
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
              placeholder="Search reviews by paper title or comments..."
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
              value={filterRecommendation}
              onChange={(e) => setFilterRecommendation(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {[
                { value: 'all', label: 'All Recommendations' },
                { value: 'accept', label: 'Accept' },
                { value: 'revision', label: 'Revision' },
                { value: 'reject', label: 'Reject' },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Reviews Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <LinearProgress />
        ) : filteredReviews.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            You haven't submitted any reviews yet.
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Paper Title</TableCell>
                    <TableCell>Track</TableCell>
                    <TableCell>Overall Rating</TableCell>
                    <TableCell>Recommendation</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReviews
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((review) => (
                      <TableRow key={review._id} hover>
                        <TableCell>
                          <Typography variant="body1" noWrap sx={{ maxWidth: 300 }}>
                            {review.paperTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={review.paperTrack} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {review.overallRating}/10
                            </Typography>
                            <Rating
                              value={review.overallRating}
                              max={10}
                              size="small"
                              readOnly
                              precision={0.5}
                            />
                          </Box>
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
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewReview(review)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                            
                            <IconButton
                              size="small"
                              onClick={() => handleEditReview(review.paperId)}
                              color="info"
                            >
                              <Edit />
                            </IconButton>
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
              count={filteredReviews.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Review Statistics */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Reviews', value: reviews.length },
            { label: 'Average Rating', value: (reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length || 0).toFixed(1) },
            { label: 'Accept Recommendations', value: reviews.filter(r => r.recommendation === 'accept').length },
            { label: 'Revision Recommendations', value: reviews.filter(r => r.recommendation === 'revision').length },
            { label: 'Reject Recommendations', value: reviews.filter(r => r.recommendation === 'reject').length },
          ].map((stat, index) => (
            <Box key={index} sx={{ textAlign: 'center', p: 2, minWidth: 150 }}>
              <Typography variant="h5" color="primary">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Review Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>
              Review Details
              <Typography variant="subtitle2" color="text.secondary">
                {selectedReview.paperTitle}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Overall Rating</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{selectedReview.overallRating}/10</Typography>
                    <Rating value={selectedReview.overallRating} max={10} readOnly />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Recommendation</Typography>
                  <Chip
                    label={getRecommendationLabel(selectedReview.recommendation)}
                    color={getRecommendationColor(selectedReview.recommendation)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Criteria Ratings</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    {[
                      { label: 'Originality', value: selectedReview.originality },
                      { label: 'Technical Soundness', value: selectedReview.technicalSoundness },
                      { label: 'Clarity', value: selectedReview.clarity },
                      { label: 'Significance', value: selectedReview.significance },
                      { label: 'References', value: selectedReview.references },
                    ].map((criteria, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">{criteria.label}</Typography>
                        <Typography variant="h6">{criteria.value}/10</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Strengths</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedReview.strengths}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Areas for Improvement</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedReview.weaknesses}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Comments to Authors</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedReview.comments}
                    </Typography>
                  </Paper>
                </Grid>
                
                {selectedReview.confidentialComments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="error">
                      Confidential Comments to Committee
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                      <Typography variant="body2">
                        {selectedReview.confidentialComments}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditReview(selectedReview.paperId);
                }}
              >
                Edit Review
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyReviews;