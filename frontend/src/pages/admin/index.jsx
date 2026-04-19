import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import AllPapers from './AllPapers';
import ManageUsers from './ManageUsers';
import ReviewerAssignment from './ReviewerAssignment';
import Statistics from './Statistics';
import ProgramGenerator from './ProgramGenerator';
import PaperReviews from './PaperReviews';  // ✅ new import

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="papers" element={<AllPapers />} />
      <Route path="papers/:paperId/reviews" element={<PaperReviews />} />  {/* ✅ new route */}
      <Route path="users" element={<ManageUsers />} />
      <Route path="assign" element={<ReviewerAssignment />} />
      <Route path="stats" element={<Statistics />} />
      <Route path="program" element={<ProgramGenerator />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;