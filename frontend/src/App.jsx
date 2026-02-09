import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import AuthorRoutes from './pages/author';
import ReviewerRoutes from './pages/reviewer';
import AdminRoutes from './pages/admin';

function App() {
  return (
    <ErrorBoundary>
      {/* Single Router wrapper */}
      <Router>
        {/* AuthProvider must be inside Router */}
        <AuthProvider>
          <div className="App">
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />

            <Routes>
              {/* Public Routes - Home & Auth Pages */}
              <Route path="/" element={<Home />} />
              
              {/* Auth Pages with AuthLayout */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes with MainLayout */}
              <Route element={<MainLayout />}>
                {/* Default redirect for logged-in users */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Navigate to="/author" replace />
                    </ProtectedRoute>
                  } 
                />

                {/* Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Author Routes */}
                <Route
                  path="/author/*"
                  element={
                    <ProtectedRoute allowedRoles={['author']}>
                      <AuthorRoutes />
                    </ProtectedRoute>
                  }
                />

                {/* Reviewer Routes */}
                <Route
                  path="/reviewer/*"
                  element={
                    <ProtectedRoute allowedRoles={['reviewer']}>
                      <ReviewerRoutes />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminRoutes />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback route for protected paths */}
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
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;