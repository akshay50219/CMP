import { Routes, Route, Navigate } from 'react-router-dom';
import ReviewerDashboard from './Dashboard';
import AssignedPapers from './AssignedPapers';
import SubmitReview from './SubmitReview';
import MyReviews from './MyReviews';

const ReviewerRoutes = () => {
  return (
    <Routes>
      <Route index element={<ReviewerDashboard />} />
      <Route path="papers" element={<AssignedPapers />} />
      <Route path="review/:paperId" element={<SubmitReview />} />
      <Route path="reviews" element={<MyReviews />} />
      <Route path="*" element={<Navigate to="/reviewer" replace />} />
    </Routes>
  );
};

export default ReviewerRoutes;