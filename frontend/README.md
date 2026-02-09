markdown
# Conference Management System - Frontend

React frontend for the conference management system.

## 🚀 Getting Started

### Installation
```bash
npm install
Environment Setup
bash
cp .env.example .env
# Edit .env with your API URL
Development
bash
npm run dev
Build for Production
bash
npm run build
Preview Production Build
bash
npm run preview
📁 Project Structure
text
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Shared components
│   │   ├── auth/           # Auth components
│   │   ├── author/         # Author components
│   │   ├── reviewer/       # Reviewer components
│   │   └── admin/          # Admin components
│   ├── pages/              # Page components
│   │   ├── auth/           # Auth pages
│   │   ├── author/         # Author pages
│   │   ├── reviewer/       # Reviewer pages
│   │   ├── admin/          # Admin pages
│   │   └── Profile.jsx     # Profile page
│   ├── services/           # API services
│   │   └── api.js          # Axios instance
│   ├── context/            # React Context
│   │   └── AuthContext.jsx # Auth context
│   ├── layouts/            # Layout components
│   │   ├── MainLayout.jsx  # Main layout
│   │   └── AuthLayout.jsx  # Auth layout
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   │   └── theme.js        # MUI theme
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Entry point
├── public/                 # Public assets
├── .env                    # Environment variables
├── vite.config.js          # Vite config
└── package.json
🎨 Styling
This project uses Material-UI (MUI) for styling with a custom theme.

Theme Configuration
javascript
// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
Responsive Design
Mobile-first approach

Breakpoints: xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536

Grid system for layout

🔌 API Integration
Service Layer
All API calls are handled through the service layer in src/services/api.js

javascript
// Example API call
import { paperService } from '../services/api';

const submitPaper = async (data) => {
  try {
    const response = await paperService.submitPaper(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
Error Handling
Axios interceptors for global error handling

Toast notifications for user feedback

Error boundary for React errors

🧪 Testing
bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
📱 Browser Support
Chrome (latest)

Firefox (latest)

Safari (latest)

Edge (latest)

🔧 Environment Variables
env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Conference Management System
VITE_APP_VERSION=1.0.0
📦 Build & Deployment
Build
bash
npm run build
The build output will be in the dist/ folder.

Deployment
Vercel:

bash
npm install -g vercel
vercel
Netlify:

bash
npm run build
# Drag dist folder to Netlify
📄 License
MIT

text

### **2. `frontend/package.json`**
```json
{
  "name": "cmp-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext js,jsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx}\"",
    "preview:build": "vite build && vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "@mui/material": "^5.13.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.11.16",
    "@mui/x-data-grid": "^6.5.0",
    "axios": "^1.4.0",
    "react-hook-form": "^7.45.0",
    "@hookform/resolvers": "^3.1.0",
    "yup": "^1.2.0",
    "react-toastify": "^9.1.3",
    "chart.js": "^4.3.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0",
    "file-saver": "^2.0.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jsdom": "^22.1.0",
    "vitest": "^0.31.4",
    "@vitest/ui": "^0.31.4",
    "@vitest/coverage-c8": "^0.31.4",
    "eslint": "^8.41.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "prettier": "^2.8.8"
  }
}
3. frontend/vite.config.js
javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react'],
          charts: ['chart.js', 'react-chartjs-2'],
          forms: ['react-hook-form', 'yup'],
        },
      },
    },
  },
});
4. frontend/.env.example
env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Info
VITE_APP_NAME="Conference Management System"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_REGISTRATION=true
VITE_ENABLE_DEMO_MODE=false

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=
5. frontend/.eslintrc.js
javascript
module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
  },
};
📁 ADDITIONAL ESSENTIAL FILES
1. frontend/src/styles/theme.js
javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
2. frontend/src/main.jsx
jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
3. frontend/src/test/setup.js
javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
4. backend/server.js (Basic Structure)
javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/papers', require('./src/routes/paper.routes'));
app.use('/api/reviews', require('./src/routes/review.routes'));
app.use('/api/users', require('./src/routes/user.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


frontend/
├── README.md ✅
├── package.json ✅
├── vite.config.js ✅
├── .env.example ✅
├── .eslintrc.js ✅
├── public/
│   └── index.html ✅
└── src/
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx ✅
    │   │   ├── Sidebar.jsx ✅
    │   │   ├── ProtectedRoute.jsx ✅
    │   │   ├── ErrorBoundary.jsx ✅
    │   │   ├── LoadingSpinner.jsx ✅
    │   │   ├── SkeletonLoader.jsx ✅
    │   │   └── NotificationCenter.jsx ✅
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx ✅
    │   │   └── Register.jsx ✅
    │   ├── author/
    │   │   ├── Dashboard.jsx ✅
    │   │   ├── SubmitPaper.jsx ✅
    │   │   ├── MyPapers.jsx ✅
    │   │   ├── PaperDetails.jsx ✅
    │   │   └── index.jsx ✅
    │   ├── reviewer/
    │   │   ├── Dashboard.jsx ✅
    │   │   ├── AssignedPapers.jsx ✅
    │   │   ├── SubmitReview.jsx ✅
    │   │   ├── MyReviews.jsx ✅
    │   │   └── index.jsx ✅
    │   ├── admin/
    │   │   ├── Dashboard.jsx ✅
    │   │   ├── AllPapers.jsx ✅
    │   │   ├── ManageUsers.jsx ✅
    │   │   ├── ReviewerAssignment.jsx ✅
    │   │   ├── Statistics.jsx ✅
    │   │   ├── ProgramGenerator.jsx ✅
    │   │   ├── Settings.jsx ✅
    │   │   └── index.jsx ✅
    │   └── Profile.jsx ✅
    ├── services/
    │   └── api.js ✅
    ├── context/
    │   └── AuthContext.jsx ✅
    ├── layouts/
    │   ├── MainLayout.jsx ✅
    │   └── AuthLayout.jsx ✅
    ├── styles/
    │   ├── theme.js ✅
    │   └── App.css ✅
    ├── test/
    │   └── setup.js ✅
    ├── App.jsx ✅
    └── main.jsx ✅

    