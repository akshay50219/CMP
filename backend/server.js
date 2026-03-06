const express = require("express");
const mongoose = require("mongoose"); // Added mongoose
const cors = require("cors");
const helmet = require("helmet"); // Added for security
const morgan = require("morgan"); // Added for logging
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ==================== CREATE APP ====================
const app = express();

// ==================== MIDDLEWARE ====================
// Security headers
app.use(helmet());

// CORS configuration - allow frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('dev'));

// ==================== CREATE UPLOAD FOLDER ====================
const uploadDir = path.join(__dirname, "uploads/papers");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Upload folder created:", uploadDir);
}

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/conference_db";
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from DB');
    });
    
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// ==================== ROUTE IMPORTS ====================
// IMPORTANT: First fix the file naming issues before importing
const authRoutes = require("./src/routes/auth.routes");
const authorRoutes = require("./src/routes/author.routes");
const reviewerRoutes = require("./src/routes/reviewer.routes");
const adminRoutes = require("./src/routes/admin.routes");
const programRoutes = require("./src/routes/program.routes");
const statsRoutes = require("./src/routes/stats.routes");
const testRoutes = require("./src/routes/test.routes");
const paperRoutes = require("./src/routes/paper.routes");

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/reviewer", reviewerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/program", programRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/test", testRoutes);
app.use("/api/papers", paperRoutes);

// ==================== HEALTH CHECK ====================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

// ==================== ROOT ENDPOINT ====================
app.get("/", (req, res) => {
  res.json({
    message: "Conference Management API",
    version: "1.0.0",
    status: "running",
    documentation: "Available at /api endpoints",
    endpoints: {
      auth: "/api/auth",
      author: "/api/author",
      reviewer: "/api/reviewer",
      admin: "/api/admin",
      program: "/api/program",
      stats: "/api/stats",
      test: "/api/test",
      health: "/api/health"
    }
  });
});

// ==================== ERROR HANDLERS ====================
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("🚨 Server Error:", error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = () => {
  console.log("🛑 Shutting down gracefully...");
  
  mongoose.connection.close(false, () => {
    console.log("✅ MongoDB connection closed.");
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log("⚠️ Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log("=================================");
      console.log("🚀 Server started successfully!");
      console.log("📍 Port:", PORT);
      console.log("🌐 URL: http://localhost:" + PORT);
      console.log("📁 Uploads: http://localhost:" + PORT + "/uploads");
      console.log("🏥 Health: http://localhost:" + PORT + "/api/health");
      console.log("=================================");
      
      if (process.env.NODE_ENV === 'development') {
        console.log("\n📋 Available Routes:");
        console.log("- /api/auth - Authentication");
        console.log("- /api/author - Author endpoints");
        console.log("- /api/reviewer - Reviewer endpoints");
        console.log("- /api/admin - Admin endpoints");
        console.log("- /api/program - Program generation");
        console.log("- /api/stats - Statistics");
        console.log("- /api/test - Test endpoints");
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app; // For testing purposes