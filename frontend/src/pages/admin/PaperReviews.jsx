// frontend/src/pages/admin/PaperReviews.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  IconButton,
  Alert,
  LinearProgress,
  Rating,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Comment,
  RateReview,
  Visibility,
} from '@mui/icons-material';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const PaperReviews = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaperAndReviews();
  }, [paperId]);

  const fetchPaperAndReviews = async () => {
    try {
      setLoading(true);
      // Get all papers to find the specific paper details
      const papersRes = await adminService.getAllPapers();
      const foundPaper = papersRes.data.find(p => p._id === paperId);
      if (!foundPaper) throw new Error('Paper not found');
      setPaper(foundPaper);

      // Fetch reviews for this paper
      const reviewsRes = await adminService.getPaperReviews(paperId);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error('Failed to load paper reviews');
      navigate('/admin/papers');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'accept': return 'success';
      case 'revision': return 'warning';
      case 'reject': return 'error';
      default: return 'default';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'warning';
    return 'error';
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/papers')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Paper Reviews</Typography>
      </Box>

      {/* Paper Info Card */}
      {paper && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>{paper.title}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Submission ID:</strong> {paper.submissionId}
              </Typography>
              <Typography variant="body2">
                <strong>Track:</strong> {paper.track}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{' '}
                <Chip
                  label={paper.status.replace('_', ' ')}
                  size="small"
                  color={paper.status === 'accepted' ? 'success' : paper.status === 'rejected' ? 'error' : 'info'}
                />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Submitter:</strong> {paper.submitterName}
              </Typography>
              <Typography variant="body2">
                <strong>Final Decision:</strong>{' '}
                {paper.finalDecision !== 'pending' ? (
                  <Chip
                    label={paper.finalDecision}
                    size="small"
                    color={paper.finalDecision === 'accept' ? 'success' : 'error'}
                  />
                ) : 'Pending'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Reviews List */}
      <Typography variant="h5" gutterBottom>
        Reviews ({reviews.length})
      </Typography>

      {reviews.length === 0 ? (
        <Alert severity="info">No reviews have been submitted for this paper yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review, index) => (
            <Grid item xs={12} key={review._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="action" />
                      <Typography variant="subtitle1">
                        {review.reviewer?.name || 'Reviewer'}
                      </Typography>
                    </Box>
                    <Chip
                      label={review.recommendation?.toUpperCase() || 'PENDING'}
                      color={getRecommendationColor(review.recommendation)}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Scores */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Overall Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${review.overallRating || 'N/A'}/10`}
                          color={getRatingColor(review.overallRating || 0)}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Originality</Typography>
                      <Typography variant="body2">{review.originality || '-'}/10</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Technical Soundness</Typography>
                      <Typography variant="body2">{review.technicalSoundness || '-'}/10</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Clarity</Typography>
                      <Typography variant="body2">{review.clarity || '-'}/10</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Significance</Typography>
                      <Typography variant="body2">{review.significance || '-'}/10</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">References</Typography>
                      <Typography variant="body2">{review.references || '-'}/10</Typography>
                    </Grid>
                  </Grid>

                  {/* Comments */}
                  {review.comments && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Comment fontSize="small" /> Comments to Author
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="body2">{review.comments}</Typography>
                      </Paper>
                    </>
                  )}

                  {/* Strengths & Weaknesses */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {review.strengths && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="success.main">Strengths</Typography>
                        <Typography variant="body2">{review.strengths}</Typography>
                      </Grid>
                    )}
                    {review.weaknesses && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="error.main">Weaknesses</Typography>
                        <Typography variant="body2">{review.weaknesses}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  {/* Confidential Comments (Admin only) */}
                  {review.confidentialComments && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">Confidential Comments (for committee)</Typography>
                      <Typography variant="body2">{review.confidentialComments}</Typography>
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="caption" color="text.secondary">
                      Submitted: {new Date(review.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PaperReviews;