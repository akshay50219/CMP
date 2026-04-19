import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if token exists and validate it
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Decode token to check expiry
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          // Check if token is expired
          if (decoded.exp < currentTime) {
            // console.warn('Token expired');
            logout();
            return;
          }
          
          // Verify token with backend and get fresh user data
          try {
            const response = await authService.getProfile();
            setUser(response.data);
            setToken(storedToken);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Token verification failed:', error);
            // Token might be invalid on server, clear it
            logout();
          }
        } catch (decodeError) {
          console.error('Token decode error:', decodeError);
          logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      
      return { success: true, user: userData };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, user: registeredUser } = response.data;
      
      // Auto-login after registration
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(registeredUser);
      setIsAuthenticated(true);
      
      toast.success('Registration successful! You are now logged in.');
      
      return { success: true, user: registeredUser };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      // Handle specific registration errors
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      } else {
        toast.error(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear any other user-related data
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastLogin');
    
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data;
      
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      
      return { success: true, user: updatedUser };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully');
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get user role for authorization
  const getUserRole = () => {
    return user?.role || null;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user || !Array.isArray(roles)) return false;
    return roles.includes(user.role);
  };

  // Refresh user data from backend
  const refreshUserData = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error };
    }
  };

  // Check if token is about to expire (within 5 minutes)
  const isTokenExpiringSoon = () => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const expiresIn = decoded.exp - currentTime;
      
      // Return true if token expires in less than 5 minutes
      return expiresIn < 300;
    } catch (error) {
      return true;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUserData,
    getUserRole,
    hasRole,
    hasAnyRole,
    isTokenExpiringSoon,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};