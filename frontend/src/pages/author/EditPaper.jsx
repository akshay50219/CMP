import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

// Validation schema
const schema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title too long'),
  abstract: yup.string().required('Abstract is required').min(100, 'Abstract must be at least 100 characters'),
});

const EditPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Fetch paper details
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        const response = await paperService.getMyPapers();
        const paper = response.data.find(p => p._id === id);
        if (!paper) throw new Error('Paper not found');
        
        // Check if paper can be edited (status must be 'submitted')
        if (paper.status !== 'submitted') {
          setError('This paper cannot be edited because it is already under review or decided.');
        }
        
        reset({
          title: paper.title,
          abstract: paper.abstract,
        });
      } catch (err) {
        toast.error('Failed to load paper details');
        navigate('/author/papers');
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await paperService.updatePaper(id, data);
      toast.success('Paper updated successfully');
      navigate(`/author/papers/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/author/papers/${id}`)}>
          Back to Paper Details
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/author/papers/${id}`)}>
          Back
        </Button>
        <Typography variant="h4">Edit Paper</Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Paper Title"
            margin="normal"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            fullWidth
            label="Abstract"
            multiline
            rows={8}
            margin="normal"
            {...register('abstract')}
            error={!!errors.abstract}
            helperText={errors.abstract?.message || 'Minimum 100 characters'}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate(`/author/papers/${id}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditPaper;