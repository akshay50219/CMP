import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  People,
  Description,
  CheckCircle,
  Close,
  Add,
  Remove,
  Refresh,
} from '@mui/icons-material';
import { paperService, userService } from '../../services/api';
import { toast } from 'react-toastify';

const ReviewerAssignment = () => {
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);

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

      const unassignedPapers = papersResponse.data.filter(
        paper => paper.status === 'submitted' && (!paper.assignedReviewers || paper.assignedReviewers.length < 2)
      );

      const availableReviewers = usersResponse.data.filter(
        user => user.role === 'reviewer' && user.isActive
      );

      setPapers(unassignedPapers);
      setReviewers(availableReviewers);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignDialog = (paper) => {
    setSelectedPaper(paper);
    setSelectedReviewers(paper.assignedReviewers?.map(r => r._id) || []);
    setAssignDialogOpen(true);
  };

  const handleAssignReviewers = async () => {
    try {
      // Assign each selected reviewer
      const assignments = selectedReviewers.map(reviewerId =>
        paperService.assignReviewer(selectedPaper._id, reviewerId)
      );
      
      await Promise.all(assignments);
      toast.success('Reviewers assigned successfully');
      setAssignDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign reviewers');
    }
  };

  const handleAutoAssign = async () => {
    try {
      setAutoAssignLoading(true);
      
      // For each paper without enough reviewers, assign based on expertise match
      for (const paper of papers) {
        if (paper.assignedReviewers?.length >= 2) continue;
        
        const availableReviewers = reviewers.filter(
          reviewer => !paper.assignedReviewers?.some(ar => ar._id === reviewer._id)
        );
        
        // Sort reviewers by expertise match
        const matchedReviewers = availableReviewers
          .map(reviewer => ({
            reviewer,
            matchScore: calculateExpertiseMatch(paper.track, reviewer.expertise),
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 2 - (paper.assignedReviewers?.length || 0));
        
        // Assign matched reviewers
        for (const match of matchedReviewers) {
          await paperService.assignReviewer(paper._id, match.reviewer._id);
        }
      }
      
      toast.success('Auto-assignment completed successfully');
      fetchData();
    } catch (error) {
      toast.error('Auto-assignment failed');
    } finally {
      setAutoAssignLoading(false);
    }
  };

  const calculateExpertiseMatch = (paperTrack, reviewerExpertise) => {
    if (!reviewerExpertise) return 0;
    
    const expertiseList = reviewerExpertise.split(',').map(e => e.trim().toLowerCase());
    const trackWords = paperTrack.toLowerCase().split(' ');
    
    let matchScore = 0;
    trackWords.forEach(word => {
      if (expertiseList.some(expertise => expertise.includes(word))) {
        matchScore++;
      }
    });
    
    return matchScore;
  };

  const getReviewerWorkload = (reviewerId) => {
    return papers.filter(paper => 
      paper.assignedReviewers?.some(r => r._id === reviewerId)
    ).length;
  };

  const handleRemoveReviewer = async (paperId, reviewerId) => {
    try {
      // Note: This endpoint needs to be implemented in backend
      // For now, we'll just show a message
      toast.info('Remove reviewer functionality requires backend implementation');
    } catch (error) {
      toast.error('Failed to remove reviewer');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Reviewer Assignment
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={handleAutoAssign}
            disabled={autoAssignLoading || papers.length === 0}
          >
            {autoAssignLoading ? 'Assigning...' : 'Auto-Assign Reviewers'}
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {papers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Papers Needing Reviewers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info">
                {reviewers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Reviewers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning">
                {papers.filter(p => p.assignedReviewers?.length > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Partially Assigned Papers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success">
                {papers.filter(p => p.assignedReviewers?.length >= 2).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fully Assigned Papers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Papers Needing Assignment */}
      <Typography variant="h5" gutterBottom>
        Papers Needing Reviewers
      </Typography>
      
      {papers.length === 0 ? (
        <Alert severity="success">
          All papers have sufficient reviewers assigned!
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Paper Title</TableCell>
                <TableCell>Track</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Assigned Reviewers</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {papers.map((paper) => (
                <TableRow key={paper._id} hover>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                      {paper.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={paper.track} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {paper.submitterName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {paper.assignedReviewers?.map((reviewer, index) => (
                        <Chip
                          key={index}
                          label={reviewer.name}
                          size="small"
                          onDelete={() => handleRemoveReviewer(paper._id, reviewer._id)}
                          deleteIcon={<Remove />}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {(!paper.assignedReviewers || paper.assignedReviewers.length === 0) && (
                        <Chip label="No reviewers" size="small" color="error" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleOpenAssignDialog(paper)}
                    >
                      Assign Reviewers
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Available Reviewers */}
      <Typography variant="h5" gutterBottom>
        Available Reviewers ({reviewers.length})
      </Typography>
      <Grid container spacing={2}>
        {reviewers.map((reviewer) => (
          <Grid item xs={12} sm={6} md={4} key={reviewer._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1">
                      {reviewer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reviewer.affiliation}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${getReviewerWorkload(reviewer._id)} papers`}
                    color={getReviewerWorkload(reviewer._id) > 5 ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Expertise:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {reviewer.expertise?.split(',').map((exp, index) => (
                    <Chip key={index} label={exp.trim()} size="small" />
                  ))}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Email: {reviewer.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Assign Reviewers Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Assign Reviewers
          <Typography variant="subtitle2" color="text.secondary">
            {selectedPaper?.title}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            <strong>Paper Track:</strong> {selectedPaper?.track}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Abstract:</strong> {selectedPaper?.abstract?.substring(0, 200)}...
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Reviewers (2 recommended)</InputLabel>
            <Select
              multiple
              value={selectedReviewers}
              onChange={(e) => setSelectedReviewers(e.target.value)}
              label="Select Reviewers (2 recommended)"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((reviewerId) => {
                    const reviewer = reviewers.find(r => r._id === reviewerId);
                    return (
                      <Chip key={reviewerId} label={reviewer?.name} size="small" />
                    );
                  })}
                </Box>
              )}
            >
              {reviewers.map((reviewer) => (
                <MenuItem key={reviewer._id} value={reviewer._id}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2">{reviewer.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reviewer.expertise} • {getReviewerWorkload(reviewer._id)} papers assigned
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Best Practice:</strong> Assign 2-3 reviewers per paper. Consider:
            </Typography>
            <ul>
              <li>Reviewer expertise matching paper topic</li>
              <li>Current workload of reviewers</li>
              <li>Reviewer availability and deadlines</li>
            </ul>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignReviewers}
            variant="contained"
            disabled={selectedReviewers.length === 0}
          >
            Assign Selected Reviewers
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewerAssignment;