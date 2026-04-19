import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  CalendarToday,
  Person,
  Email,
  School,
  Assessment,
  CheckCircle,
  Close,
  Edit,
  Delete,
  Warning,
} from '@mui/icons-material';

import { paperService, reviewService, commonService } from '../../services/api';
import { toast } from 'react-toastify';

const PaperDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPaperDetails();
  }, [id]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const [paperResponse, reviewsResponse] = await Promise.all([
        paperService.getMyPapers().then(res => 
          res.data.find(p => p._id === id) || Promise.reject('Paper not found')
        ),
        reviewService.getPaperReviews(id).catch(() => ({ data: [] }))
      ]);
      
      setPaper(paperResponse);
      setReviews(reviewsResponse.data);
    } catch (error) {
      toast.error('Failed to load paper details');
      navigate('/author/papers');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
  try {
    const response = await commonService.downloadPaper(id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `paper-${paper.title}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    toast.error('Failed to download paper');
  }
};

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await paperService.withdrawPaper(id);
      toast.success('Paper deleted successfully');
      navigate('/author/papers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete paper');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Close color="error" />;
      default:
        return <Assessment color="info" />;
    }
  };

  const renderTimeline = () => {
    const events = [];
    
    if (paper.submissionDate) {
      events.push({
        date: new Date(paper.submissionDate),
        title: 'Paper Submitted',
        description: 'Paper was submitted for review',
        icon: <Assessment />,
      });
    }

    if (paper.reviewAssignmentDate) {
      events.push({
        date: new Date(paper.reviewAssignmentDate),
        title: 'Reviewers Assigned',
        description: 'Reviewers were assigned to the paper',
        icon: <Person />,
      });
    }

    if (paper.decisionDate) {
      events.push({
        date: new Date(paper.decisionDate),
        title: `Paper ${paper.status}`,
        description: `Final decision: ${paper.status}`,
        icon: getStatusIcon(paper.status),
      });
    }

    return events.sort((a, b) => b.date - a.date);
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!paper) {
    return (
      <Alert severity="error">
        Paper not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/author/papers')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Paper Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
        >
          Download Paper
        </Button>
        {paper.status === 'submitted' && (
          <>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/author/papers/${id}/edit`)}
            >
              Edit Paper
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Paper
            </Button>
          </>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label={`Reviews (${reviews.length})`} />
          <Tab label="Timeline" />
          <Tab label="Metadata" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left Column - Paper Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {paper.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={paper.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(paper.status)}
                  size="small"
                />
                <Chip label={paper.track} size="small" variant="outlined" />
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Abstract
              </Typography>
              <Typography paragraph>
                {paper.abstract}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {paper.keywords?.map((keyword, index) => (
                  <Chip key={index} label={keyword} size="small" />
                ))}
              </Box>
            </Paper>

            {/* Decision Section */}
            {paper.decision && (
              <Paper sx={{ p: 3, bgcolor: paper.status === 'accepted' ? 'success.light' : 'error.light' }}>
                <Typography variant="h6" gutterBottom>
                  Final Decision: {paper.status.toUpperCase()}
                </Typography>
                <Typography>
                  <strong>Decision Date:</strong>{' '}
                  {new Date(paper.decisionDate).toLocaleDateString()}
                </Typography>
                {paper.decisionComments && (
                  <Alert severity={paper.status === 'accepted' ? 'success' : 'error'} sx={{ mt: 2 }}>
                    {paper.decisionComments}
                  </Alert>
                )}
              </Paper>
            )}
          </Grid>

          {/* Right Column - Metadata */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Submission Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Submission Date"
                      secondary={new Date(paper.submissionDate).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={new Date(paper.updatedAt).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Assessment fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Review Status"
                      secondary={`${reviews.length} reviews submitted`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authors
                </Typography>
                <List dense>
                  {paper.authors?.map((author, index) => {
                    const [name, affiliation, email] = author.split(',').map(s => s.trim());
                    return (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Person fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={name}
                          secondary={
                            <>
                              {affiliation && (
                                <Box component="span" sx={{ display: 'block' }}>
                                  <School fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {affiliation}
                                </Box>
                              )}
                              {email && (
                                <Box component="span" sx={{ display: 'block' }}>
                                  <Email fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {email}
                                </Box>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Reviews ({reviews.length})
          </Typography>
          
          {reviews.length === 0 ? (
            <Alert severity="info">
              No reviews have been submitted yet for this paper.
            </Alert>
          ) : (
            reviews.map((review, index) => (
              <Card key={review._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1">
                      Review #{index + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.submittedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Reviewer:</strong> {review.reviewerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Overall Rating:</strong>{' '}
                        <Chip
                          label={`${review.overallRating}/10`}
                          size="small"
                          color={
                            review.overallRating >= 8 ? 'success' :
                            review.overallRating >= 6 ? 'warning' : 'error'
                          }
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Recommendation:</strong>{' '}
                        <Chip
                          label={review.recommendation.toUpperCase()}
                          size="small"
                          color={
                            review.recommendation === 'accept' ? 'success' :
                            review.recommendation === 'revision' ? 'warning' : 'error'
                          }
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Comments:</strong>
                  </Typography>
                  <Typography paragraph>
                    {review.comments}
                  </Typography>
                  
                  {review.confidentialComments && (
                    <>
                      <Typography variant="body2" gutterBottom color="error">
                        <strong>Confidential Comments (to committee):</strong>
                      </Typography>
                      <Typography variant="body2" color="error.light">
                        {review.confidentialComments}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Paper Timeline
          </Typography>
          
          <List>
            {renderTimeline().map((event, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {event.icon}
                </ListItemIcon>
                <ListItemText
                  primary={event.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {event.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="text.secondary">
                        {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Paper Metadata
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Paper ID:</strong> {paper._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Submission ID:</strong> {paper.submissionId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>File Name:</strong> {paper.fileName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>File Size:</strong> {Math.round(paper.fileSize / 1024)} KB
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Created At:</strong> {new Date(paper.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Updated At:</strong> {new Date(paper.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the paper <strong>"{paper.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaperDetails;