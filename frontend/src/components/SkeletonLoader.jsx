// frontend/src/components/SkeletonLoader.jsx

import { Skeleton, Box } from '@mui/material';

const SkeletonLoader = ({ rows = 5 }) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={40}
          sx={{ mb: 1, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
};

export default SkeletonLoader;
