import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  LinearProgress,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Divider,
  Rating,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Send,
  Visibility,
  Download,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

const schema = yup.object({
  overallRating: yup.number()
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating must be at most 10')
    .required('Overall rating is required'),
  
  // Criteria ratings
  originality: yup.number().min(1).max(10).required(),
  technicalSoundness: yup.number().min(1).max(10).required(),
  clarity: yup.number().min(1).max(10).required(),
  significance: yup.number().min(1).max(10).required(),
  references: yup.number().min(1).max(10).required(),
  
  // Recommendation
  recommendation: yup.string()
    .oneOf(['accept', 'revision', 'reject'], 'Please select a recommendation')
    .required('Recommendation is required'),
  
  // Comments
  comments: yup.string()
    .min(50, 'Comments must be at least 50 characters')
    .required('Comments are required'),
  
  confidentialComments: yup.string(),
  
  // Strengths and Weaknesses
  strengths: yup.string().min(10, 'Please describe at least one strength'),
  weaknesses: yup.string().min(10, 'Please describe at least one weakness'),
});

const SubmitReview = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      overallRating: 5,
      originality: 5,
      technicalSoundness: 5,
      clarity: 5,
      significance: 5,
      references: 5,
      recommendation: '',
      comments: '',
      confidentialComments: '',
      strengths: '',
      weaknesses: '',
    },
  });

  useEffect(() => {
    fetchPaperDetails();
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const response = await paperService.getAssignedPapers();
      const assignedPaper = response.data.find(p => p._id === paperId);
      
      if (!assignedPaper) {
        toast.error('Paper not found or not assigned to you');
        navigate('/reviewer/papers');
        return;
      }
      
      setPaper(assignedPaper);
      
      // Check if review already exists
      if (assignedPaper.myReview) {
        setExistingReview(assignedPaper.myReview);
        // Pre-fill form with existing review
        Object.keys(assignedPaper.myReview).forEach(key => {
          setValue(key, assignedPaper.myReview[key]);
        });
      }
    } catch (error) {
      toast.error('Failed to load paper details');
      navigate('/reviewer/papers');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await paperService.downloadPaper(paperId);
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

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      if (existingReview) {
        // Update existing review
        await reviewService.updateReview(existingReview._id, data);
        toast.success('Review updated successfully');
      } else {
        // Submit new review
        await paperService.submitReview(paperId, data);
        toast.success('Review submitted successfully');
      }
      
      navigate('/reviewer/reviews');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverage = () => {
    const originality = watch('originality') || 0;
    const technicalSoundness = watch('technicalSoundness') || 0;
    const clarity = watch('clarity') || 0;
    const significance = watch('significance') || 0;
    const references = watch('references') || 0;
    
    const average = (originality + technicalSoundness + clarity + significance + references) / 5;
    return average.toFixed(1);
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'accept': return 'success';
      case 'revision': return 'warning';
      case 'reject': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/reviewer/papers')}
        >
          Back to Papers
        </Button>
        <Typography variant="h4">
          {existingReview ? 'Update Review' : 'Submit Review'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => navigate(`/reviewer/papers/${paperId}`)}
        >
          View Paper
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
        >
          Download Paper
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Paper Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Paper Details
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Title:</strong> {paper.title}
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>Track:</strong>{' '}
              <Chip label={paper.track} size="small" sx={{ ml: 1 }} />
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>Abstract:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {paper.abstract.substring(0, 200)}...
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" paragraph>
              <strong>Keywords:</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {paper.keywords?.map((keyword, index) => (
                <Chip key={index} label={keyword} size="small" />
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2">
              <strong>Submission Date:</strong>{' '}
              {new Date(paper.submissionDate).toLocaleDateString()}
            </Typography>
            
            {paper.reviewDeadline && (
              <Alert 
                severity={new Date(paper.reviewDeadline) < new Date() ? 'error' : 'warning'}
                sx={{ mt: 2 }}
                icon={new Date(paper.reviewDeadline) < new Date() ? <Warning /> : <CheckCircle />}
              >
                <strong>Review Deadline:</strong>{' '}
                {new Date(paper.reviewDeadline).toLocaleDateString()}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Review Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Overall Rating */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overall Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Controller
                      name="overallRating"
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ flexGrow: 1 }}>
                          <Slider
                            {...field}
                            min={1}
                            max={10}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                            sx={{ width: '100%' }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption">Poor (1)</Typography>
                            <Typography variant="caption">Excellent (10)</Typography>
                          </Box>
                        </Box>
                      )}
                    />
                    <Typography variant="h4">
                      {watch('overallRating')}/10
                    </Typography>
                  </Box>
                  {errors.overallRating && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.overallRating.message}
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Criteria Ratings */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Evaluation Criteria
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { name: 'originality', label: 'Originality & Novelty' },
                      { name: 'technicalSoundness', label: 'Technical Soundness' },
                      { name: 'clarity', label: 'Clarity & Presentation' },
                      { name: 'significance', label: 'Significance & Impact' },
                      { name: 'references', label: 'References & Related Work' },
                    ].map((criterion) => (
                      <Grid item xs={12} sm={6} key={criterion.name}>
                        <FormControl fullWidth>
                          <FormLabel>{criterion.label}</FormLabel>
                          <Controller
                            name={criterion.name}
                            control={control}
                            render={({ field }) => (
                              <Slider
                                {...field}
                                min={1}
                                max={10}
                                step={1}
                                marks
                                valueLabelDisplay="auto"
                              />
                            )}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption">Poor</Typography>
                            <Typography variant="caption">Excellent</Typography>
                          </Box>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Average Score:</strong>{' '}
                      <Chip 
                        label={`${calculateAverage()}/10`} 
                        color={
                          parseFloat(calculateAverage()) >= 8 ? 'success' :
                          parseFloat(calculateAverage()) >= 6 ? 'warning' : 'error'
                        }
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommendation
                  </Typography>
                  <Controller
                    name="recommendation"
                    control={control}
                    render={({ field }) => (
                      <FormControl component="fieldset">
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value="accept"
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle color="success" />
                                <Typography>Accept</Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="revision"
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Warning color="warning" />
                                <Typography>Needs Revision</Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="reject"
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Warning color="error" />
                                <Typography>Reject</Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                  {errors.recommendation && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.recommendation.message}
                    </Alert>
                  )}
                  
                  {watch('recommendation') && (
                    <Alert 
                      severity={getRecommendationColor(watch('recommendation'))}
                      sx={{ mt: 2 }}
                    >
                      <strong>Selected:</strong>{' '}
                      {watch('recommendation') === 'accept' && 'Recommend accepting this paper'}
                      {watch('recommendation') === 'revision' && 'Recommend revision before acceptance'}
                      {watch('recommendation') === 'reject' && 'Recommend rejecting this paper'}
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Strengths & Weaknesses
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="strengths"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Paper Strengths"
                            multiline
                            rows={4}
                            fullWidth
                            error={!!errors.strengths}
                            helperText={errors.strengths?.message || "What are the strongest aspects of this paper?"}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="weaknesses"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Areas for Improvement"
                            multiline
                            rows={4}
                            fullWidth
                            error={!!errors.weaknesses}
                            helperText={errors.weaknesses?.message || "What could be improved?"}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comments to Authors
                  </Typography>
                  <Controller
                    name="comments"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Detailed Comments"
                        multiline
                        rows={6}
                        fullWidth
                        error={!!errors.comments}
                        helperText={
                          errors.comments?.message || 
                          `Please provide detailed, constructive feedback to help authors improve their work (${field.value?.length || 0}/50 min)`
                        }
                        placeholder="Provide detailed feedback about the paper's contributions, methodology, results, and presentation..."
                      />
                    )}
                  />
                </CardContent>
              </Card>

              {/* Confidential Comments */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Confidential Comments to Program Committee
                  </Typography>
                  <Controller
                    name="confidentialComments"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confidential Comments (Not shared with authors)"
                        multiline
                        rows={4}
                        fullWidth
                        helperText="These comments will only be visible to the program committee"
                        placeholder="Any confidential concerns, ethical issues, or additional comments..."
                      />
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/reviewer/papers')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit(onSubmit)}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubmitReview;