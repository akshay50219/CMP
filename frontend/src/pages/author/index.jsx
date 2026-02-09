import { Routes, Route, Navigate } from 'react-router-dom';
import AuthorDashboard from './Dashboard';
import SubmitPaper from './SubmitPaper';
import MyPapers from './MyPapers';
import PaperDetails from './PaperDetails';

const AuthorRoutes = () => {
  return (
    <Routes>
      <Route index element={<AuthorDashboard />} />
      <Route path="submit" element={<SubmitPaper />} />
      <Route path="papers" element={<MyPapers />} />
      <Route path="papers/:id" element={<PaperDetails />} />
      <Route path="*" element={<Navigate to="/author" replace />} />
    </Routes>
  );
};

export default AuthorRoutes;