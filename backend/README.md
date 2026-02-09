# Conference Management System - Backend

Node.js + Express + MongoDB backend for the conference management system.

## 🚀 Getting Started

### Installation
```bash
npm install

Environment Setup
cp .env.example .env
# Edit .env with your configurations

Development
npm run dev

Production
npm start

📁 Project Structure
backend/
├── src/
│   ├── models/           # Mongoose models
│   │   ├── User.js       # User model
│   │   ├── Paper.js      # Paper model
│   │   └── Review.js     # Review model
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── paper.routes.js
│   │   ├── review.routes.js
│   │   └── user.routes.js
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.js
│   │   ├── paper.controller.js
│   │   └── review.controller.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication
│   │   ├── error.js      # Error handling
│   │   └── upload.js     # File upload
│   ├── config/           # Configuration
│   │   ├── database.js   # DB connection
│   │   └── upload.js     # Multer config
│   └── utils/            # Utilities
│       ├── generatePDF.js
│       └── sendEmail.js
├── uploads/              # Uploaded files
├── .env                  # Environment variables
├── package.json
└── server.js            # Main entry point

🔌 API Endpoints

Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

GET /api/auth/me - Get current user

PUT /api/auth/profile - Update profile

Papers
POST /api/papers - Submit new paper
GET /api/papers - Get all papers (admin)
GET /api/papers/my - Get user's papers
GET /api/papers/assigned - Get assigned papers (reviewer)
PUT /api/papers/:id - Update paper
DELETE /api/papers/:id - Delete paper
GET /api/papers/:id/download - Download paper
POST /api/papers/:id/assign - Assign reviewer
PUT /api/papers/:id/decision - Make decision

Reviews
POST /api/papers/:id/reviews - Submit review
GET /api/reviews/my - Get my reviews
GET /api/reviews/paper/:paperId - Get paper reviews

Users (Admin only)
GET /api/users - Get all users
POST /api/users - Create user
PUT /api/users/:id - Update user
DELETE /api/users/:id - Delete user

🔒 Authentication
Uses JWT (JSON Web Tokens) for authentication. Include token in headers:
Authorization: Bearer <token>

📊 Database Models
User Model
{
  name: String,
  email: String,
  password: String,
  role: ['author', 'reviewer', 'admin'],
  affiliation: String,
  expertise: String,
  isActive: Boolean
}

Paper Model
{
  title: String,
  abstract: String,
  keywords: [String],
  track: String,
  authors: [String],
  status: ['submitted', 'under_review', 'accepted', 'rejected', 'needs_revision'],
  submitter: ObjectId,
  fileName: String,
  filePath: String,
  fileSize: Number,
  submissionDate: Date,
  decision: String,
  decisionDate: Date,
  assignedReviewers: [ObjectId]
}

Review Model
{
  paper: ObjectId,
  reviewer: ObjectId,
  overallRating: Number,
  originality: Number,
  technicalSoundness: Number,
  clarity: Number,
  significance: Number,
  references: Number,
  recommendation: ['accept', 'revision', 'reject'],
  comments: String,
  confidentialComments: String,
  strengths: String,
  weaknesses: String,
  submittedAt: Date
}

🧪 Testing
bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
📦 Deployment
Set environment variables

Build the application: npm run build

Start: npm start

text

### **2. `backend/package.json`**
```json
{
  "name": "cmp-backend",
  "version": "1.0.0",
  "description": "Backend API for Conference Management System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "pdfkit": "^0.14.0",
    "nodemailer": "^6.9.1",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "eslint": "^8.39.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.27.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
3. backend/.env.example
env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/conference_db

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760 # 10MB

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@conference-system.com


4. backend/.eslintrc.js
javascript
module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'off',
    'import/extensions': 'off',
    'no-underscore-dangle': 'off',
    'consistent-return': 'off',
    'camelcase': 'off',
  },
};


5. backend/jest.config.js
javascript
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js',
  ],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
};

backend/
├── README.md ✅
├── package.json ✅
├── .env.example ✅
├── .eslintrc.js ✅
├── jest.config.js ✅
├── server.js ✅
└── src/
    ├── models/
    │   ├── User.js ✅
    │   ├── Paper.js ✅
    │   └── Review.js ✅
    ├── routes/
    │   ├── auth.routes.js ✅
    │   ├── paper.routes.js ✅
    │   ├── review.routes.js ✅
    │   └── user.routes.js ✅
    ├── controllers/
    │   ├── auth.controller.js ✅
    │   ├── paper.controller.js ✅
    │   └── review.controller.js ✅
    ├── middleware/
    │   ├── auth.js ✅
    │   ├── error.js ✅
    │   └── upload.js ✅
    ├── config/
    │   ├── database.js ✅
    │   └── upload.js ✅
    └── utils/
        ├── generatePDF.js ✅
        └── sendEmail.js ✅