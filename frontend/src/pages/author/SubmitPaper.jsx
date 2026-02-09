import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

const schema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title too long'),
  abstract: yup.string().required('Abstract is required').min(100, 'Abstract must be at least 100 characters'),
  keywords: yup.array().min(3, 'Add at least 3 keywords').max(5, 'Maximum 5 keywords allowed'),
  track: yup.string().required('Track is required'),
  authors: yup.array().min(1, 'Add at least one author').required('Authors are required'),
});

const tracks = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Computer Vision',
  'Natural Language Processing',
  'Robotics',
  'Cybersecurity',
  'Software Engineering',
  'Cloud Computing',
  'Internet of Things',
];

const SubmitPaper = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [authors, setAuthors] = useState([]);
  const [authorInput, setAuthorInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      keywords: [],
      authors: [],
    },
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file type (PDF only)
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleKeywordAdd = () => {
    if (keywordInput.trim() && keywords.length < 5) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      setValue('keywords', newKeywords);
      setKeywordInput('');
    }
  };

  const handleKeywordDelete = (keywordToDelete) => {
    const newKeywords = keywords.filter((keyword) => keyword !== keywordToDelete);
    setKeywords(newKeywords);
    setValue('keywords', newKeywords);
  };

  const handleAuthorAdd = () => {
    if (authorInput.trim() && authors.length < 10) {
      const newAuthors = [...authors, authorInput.trim()];
      setAuthors(newAuthors);
      setValue('authors', newAuthors);
      setAuthorInput('');
    }
  };

  const handleAuthorDelete = (authorToDelete) => {
    const newAuthors = authors.filter((author) => author !== authorToDelete);
    setAuthors(newAuthors);
    setValue('authors', newAuthors);
  };

  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('abstract', data.abstract);
      formData.append('track', data.track);
      formData.append('keywords', JSON.stringify(data.keywords));
      formData.append('authors', JSON.stringify(data.authors));
      formData.append('paperFile', file);

      const response = await paperService.submitPaper(formData);
      
      toast.success('Paper submitted successfully!');
      navigate('/author/papers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Submit New Paper
      </Typography>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Paper Title"
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
                placeholder="Enter your paper title"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Abstract"
                {...register('abstract')}
                error={!!errors.abstract}
                helperText={errors.abstract?.message}
                multiline
                rows={6}
                placeholder="Provide a comprehensive abstract of your paper (minimum 100 characters)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Conference Track"
                {...register('track')}
                error={!!errors.track}
                helperText={errors.track?.message}
              >
                {tracks.map((track) => (
                  <MenuItem key={track} value={track}>
                    {track}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleKeywordAdd())}
                  placeholder="Add keyword"
                  disabled={keywords.length >= 5}
                />
                <Button
                  variant="outlined"
                  onClick={handleKeywordAdd}
                  disabled={keywords.length >= 5}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {keywords.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    onDelete={() => handleKeywordDelete(keyword)}
                    deleteIcon={<Delete />}
                  />
                ))}
              </Box>
              {errors.keywords && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.keywords.message}
                </Alert>
              )}
              <Typography variant="caption" color="text.secondary">
                Add 3-5 keywords that best describe your paper
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Authors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAuthorAdd())}
                  placeholder="Add author (Name, Affiliation, Email)"
                  disabled={authors.length >= 10}
                />
                <Button
                  variant="outlined"
                  onClick={handleAuthorAdd}
                  disabled={authors.length >= 10}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {authors.map((author) => (
                  <Chip
                    key={author}
                    label={author}
                    onDelete={() => handleAuthorDelete(author)}
                    deleteIcon={<Delete />}
                  />
                ))}
              </Box>
              {errors.authors && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.authors.message}
                </Alert>
              )}
              <Typography variant="caption" color="text.secondary">
                List all authors including yourself
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Paper (PDF only)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Choose PDF File
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {file && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Selected file: {file.name}
                </Alert>
              )}
              {!file && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Please upload your paper in PDF format (max 10MB)
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || uploading}
                  startIcon={isSubmitting || uploading ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting || uploading ? 'Submitting...' : 'Submit Paper'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/author/papers')}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SubmitPaper;