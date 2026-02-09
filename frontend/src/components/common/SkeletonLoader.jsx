import { Grid, Skeleton, Box, Paper } from '@mui/material';

const SkeletonLoader = ({ type = 'table', count = 5 }) => {
  const renderTableSkeleton = () => (
    <Paper sx={{ p: 3 }}>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
      ))}
    </Paper>
  );

  const renderCardSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderFormSkeleton = () => (
    <Paper sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={50} sx={{ mb: 3 }} />
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="text" width="20%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} />
        </Box>
      ))}
      <Skeleton variant="rectangular" width={120} height={40} sx={{ mt: 2 }} />
    </Paper>
  );

  switch (type) {
    case 'table':
      return renderTableSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'form':
      return renderFormSkeleton();
    default:
      return renderTableSkeleton();
  }
};

export default SkeletonLoader;