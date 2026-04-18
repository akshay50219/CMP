import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LinearProgress } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import './App.css';

/* 🔹 LAZY LOADED PAGES */
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthorRoutes = lazy(() => import('./pages/author'));
const ReviewerRoutes = lazy(() => import('./pages/reviewer'));
const AdminRoutes = lazy(() => import('./pages/admin'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastContainer theme="colored" />

          {/* 🔹 Suspense Wrapper */}
          <Suspense fallback={<LinearProgress />}>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<MainLayout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/author" replace />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/author/*"
                  element={
                    <ProtectedRoute allowedRoles={['author']}>
                      <AuthorRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reviewer/*"
                  element={
                    <ProtectedRoute allowedRoles={['reviewer']}>
                      <ReviewerRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
