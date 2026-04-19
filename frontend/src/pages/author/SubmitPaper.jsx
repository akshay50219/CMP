import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Box, TextField, Button, Typography, Paper, Alert, CircularProgress, MenuItem, Chip } from '@mui/material';
import { CloudUpload, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paperService } from '../../services/api';
import { toast } from 'react-toastify';

const schema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title too long'),
  abstract: yup.string().required('Abstract is required').min(100, 'Abstract must be at least 100 characters'),
  keywords: yup.array().min(3, 'Add at least 3 keywords').max(5, 'Maximum 5 keywords allowed'),
  track: yup.string().required('Track is required'),
  authors: yup.array().min(1, 'Add at least one author'),
});

const tracks = ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Computer Vision', 'Natural Language Processing', 'Robotics', 'Cybersecurity', 'Software Engineering', 'Cloud Computing', 'Internet of Things'];

const SubmitPaper = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [authors, setAuthors] = useState([]);
  const [authorForm, setAuthorForm] = useState({ name: '', email: '', affiliation: '' });
  const [fileError, setFileError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '',
    abstract: '',
    track: '',           // ✅ add this
    keywords: [],
    authors: [], },
  });

  // File handling
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileError('');
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFileError('Please upload a PDF file only');
        setFile(null);
        toast.error('Only PDF files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('File size must be less than 10MB');
        setFile(null);
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      toast.success('File selected successfully');
    }
  };

  // Keywords
  const handleKeywordAdd = () => {
    if (keywordInput.trim() && keywords.length < 5) {
      const trimmedKeyword = keywordInput.trim();
      if (keywords.includes(trimmedKeyword)) {
        toast.warning('Keyword already added');
        return;
      }
      const newKeywords = [...keywords, trimmedKeyword];
      setKeywords(newKeywords);
      setValue('keywords', newKeywords, { shouldValidate: true });
      setKeywordInput('');
      toast.success('Keyword added');
    } else if (keywords.length >= 5) {
      toast.error('Maximum 5 keywords allowed');
    }
  };

  const handleKeywordDelete = (keywordToDelete) => {
    const newKeywords = keywords.filter((keyword) => keyword !== keywordToDelete);
    setKeywords(newKeywords);
    setValue('keywords', newKeywords, { shouldValidate: true });
    toast.info('Keyword removed');
  };

  // Authors with structured object
  const handleAuthorAdd = () => {
    if (!authorForm.name.trim()) {
      toast.error('Author name is required');
      return;
    }
    if (!authorForm.email.trim()) {
      toast.error('Author email is required');
      return;
    }
    // Simple email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(authorForm.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    const newAuthor = {
      name: authorForm.name.trim(),
      email: authorForm.email.trim(),
      affiliation: authorForm.affiliation.trim() || '',
    };
    const newAuthors = [...authors, newAuthor];
    setAuthors(newAuthors);
    setValue('authors', newAuthors, { shouldValidate: true });
    setAuthorForm({ name: '', email: '', affiliation: '' });
    toast.success('Author added');
  };

  const handleAuthorDelete = (indexToDelete) => {
    const newAuthors = authors.filter((_, idx) => idx !== indexToDelete);
    setAuthors(newAuthors);
    setValue('authors', newAuthors, { shouldValidate: true });
    toast.info('Author removed');
  };

  const validateForm = () => {
    if (!file) {
      setFileError('Please upload a PDF file');
      toast.error('Please upload a PDF file');
      return false;
    }
    if (keywords.length < 3) {
      toast.error('Please add at least 3 keywords');
      return false;
    }
    if (authors.length < 1) {
      toast.error('Please add at least one author');
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateForm()) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('abstract', data.abstract);
      formData.append('track', data.track);
      formData.append('keywords', JSON.stringify(data.keywords));
      formData.append('authors', JSON.stringify(data.authors));
      formData.append('paper', file);
      const toastId = toast.loading('Submitting paper...');
      await paperService.submitPaper(formData);
      toast.update(toastId, { render: 'Paper submitted successfully!', type: 'success', isLoading: false, autoClose: 3000 });
      navigate('/author/papers', { state: { message: 'Paper submitted successfully!', showNotification: true } });
    } catch (error) {
      let errorMessage = 'Submission failed. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'keyword') handleKeywordAdd();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Submit New Paper</Typography>
      <Paper sx={{ p: 4, boxShadow: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField fullWidth label="Paper Title *" {...register('title')} error={!!errors.title} helperText={errors.title?.message} placeholder="Enter your paper title" />
            </Grid>
            {/* Abstract */}
            <Grid item xs={12}>
              <TextField fullWidth label="Abstract *" {...register('abstract')} error={!!errors.abstract} helperText={errors.abstract?.message} multiline rows={6} placeholder="Provide a comprehensive abstract of your paper" inputProps={{ maxLength: 1500 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Characters: {watch('abstract')?.length || 0}/1500</Typography>
            </Grid>
            {/* Track */}
            <Grid item xs={12}>
              <TextField fullWidth select label="Conference Track *" {...register('track')} error={!!errors.track} helperText={errors.track?.message}>
                <MenuItem value=""><em>Select a track</em></MenuItem>
                {tracks.map((track) => (<MenuItem key={track} value={track}>{track}</MenuItem>))}
              </TextField>
            </Grid>
            {/* Keywords */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Keywords *</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField fullWidth size="small" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => handleKeyPress(e, 'keyword')} placeholder="Add keyword and press Enter" disabled={keywords.length >= 5} />
                <Button variant="outlined" onClick={handleKeywordAdd} disabled={keywords.length >= 5 || !keywordInput.trim()}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {keywords.map((keyword, idx) => (
                  <Chip key={idx} label={keyword} onDelete={() => handleKeywordDelete(keyword)} deleteIcon={<Delete />} color="primary" variant="outlined" />
                ))}
              </Box>
              {errors.keywords && <Alert severity="error">{errors.keywords.message}</Alert>}
              <Typography variant="caption" color="text.secondary">Add 3-5 keywords ({keywords.length}/5)</Typography>
            </Grid>
            {/* Authors - Structured */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Authors *</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {authors.map((author, idx) => (
                  <Chip key={idx} label={`${author.name} (${author.email})`} onDelete={() => handleAuthorDelete(idx)} deleteIcon={<Delete />} color="secondary" variant="outlined" />
                ))}
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth size="small" label="Author Name *" value={authorForm.name} onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Email *" value={authorForm.email} onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Affiliation" value={authorForm.affiliation} onChange={(e) => setAuthorForm({ ...authorForm, affiliation: e.target.value })} />
                </Grid>
              </Grid>
              <Button variant="outlined" startIcon={<Add />} onClick={handleAuthorAdd}>Add Author</Button>
              {errors.authors && <Alert severity="error" sx={{ mt: 2 }}>{errors.authors.message}</Alert>}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Add at least one author ({authors.length}/10)</Typography>
            </Grid>
            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Upload Paper (PDF only) *</Typography>
              <Button component="label" variant="outlined" startIcon={<CloudUpload />} fullWidth size="large">
                {file ? 'Change PDF File' : 'Choose PDF File'}
                <input type="file" hidden accept=".pdf,application/pdf" onChange={handleFileChange} />
              </Button>
              {file && (
                <Alert severity="success" sx={{ mt: 1 }} action={<Button color="inherit" size="small" onClick={() => { setFile(null); toast.info('File removed'); }}>Remove</Button>}>
                  <Typography variant="body2" fontWeight="bold">{file.name}</Typography>
                  <Typography variant="caption">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                </Alert>
              )}
              {fileError && <Alert severity="error" sx={{ mt: 1 }}>{fileError}</Alert>}
              {!file && !fileError && <Alert severity="info" sx={{ mt: 1 }}>Please upload your paper in PDF format (max 10MB)</Alert>}
            </Grid>
            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button variant="outlined" onClick={() => navigate('/author/papers')} disabled={isSubmitting || uploading}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting || uploading} sx={{ minWidth: 150 }}>
                  {isSubmitting || uploading ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Submitting...</> : 'Submit Paper'}
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