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
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Visibility,
  Download,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { paperService, reviewerService } from '../../services/api';
import { toast } from 'react-toastify';

/* ✅ ADD */
import SkeletonLoader from '../../components/SkeletonLoader';

const schema = yup.object({
  overallRating: yup.number().min(1).max(10).required(),
  originality: yup.number().min(1).max(10).required(),
  technicalSoundness: yup.number().min(1).max(10).required(),
  clarity: yup.number().min(1).max(10).required(),
  significance: yup.number().min(1).max(10).required(),
  references: yup.number().min(1).max(10).required(),
  recommendation: yup.string().required(),
  comments: yup.string().min(50).required(),
  confidentialComments: yup.string(),
  strengths: yup.string(),
  weaknesses: yup.string(),
});

const SubmitReview = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  /* ✅ LOCK FLAG */
  const isLocked = Boolean(existingReview);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  /* ✅ DEFINE BEFORE useEffect */
  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const response = await paperService.getAssignedPapers();
      const assignedPaper = response.data.find(p => p._id === paperId);

      if (!assignedPaper) {
        toast.error('Paper not found or not assigned');
        navigate('/reviewer/papers');
        return;
      }

      setPaper(assignedPaper);

      if (assignedPaper.myReview) {
        setExistingReview(assignedPaper.myReview);
        Object.entries(assignedPaper.myReview).forEach(([key, value]) => {
          setValue(key, value);
        });
      }
    } catch {
      toast.error('Failed to load paper');
      navigate('/reviewer/papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaperDetails();
  }, [paperId]);

  const handleDownload = async () => {
    try {
      const response = await paperService.downloadPaper(paperId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `paper-${paper.title}.pdf`;
      link.click();
    } catch {
      toast.error('Download failed');
    }
  };

  const onSubmit = async (data) => {
    if (isLocked) return;

    try {
      setSubmitting(true);
      await paperService.submitReview(paperId, data);
      toast.success('Review submitted successfully');
      navigate('/reviewer/reviews');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <SkeletonLoader rows={8} />
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/reviewer/papers')}>
          Back
        </Button>

        <Typography variant="h4">
          {isLocked ? 'Review Submitted' : 'Submit Review'}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button startIcon={<Visibility />} onClick={() => navigate(`/reviewer/papers/${paperId}`)}>
          View Paper
        </Button>

        <Button startIcon={<Download />} onClick={handleDownload}>
          Download
        </Button>
      </Box>

      {isLocked && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This review has already been submitted and is now read-only.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Overall Rating */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">Overall Rating</Typography>
                  <Controller
                    name="overallRating"
                    control={control}
                    render={({ field }) => (
                      <Slider {...field} min={1} max={10} disabled={isLocked} />
                    )}
                  />
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">Recommendation</Typography>
                  <Controller
                    name="recommendation"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        {['accept', 'revision', 'reject'].map(val => (
                          <FormControlLabel
                            key={val}
                            value={val}
                            control={<Radio disabled={isLocked} />}
                            label={val.toUpperCase()}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Comments */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Controller
                    name="comments"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={5}
                        fullWidth
                        disabled={isLocked}
                        label="Comments"
                      />
                    )}
                  />
                </CardContent>
              </Card>

              {!isLocked && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    type="submit"
                    disabled={submitting}
                  >
                    Submit Review
                  </Button>
                </Box>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubmitReview;
