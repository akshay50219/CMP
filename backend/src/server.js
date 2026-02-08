const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Add this line
const path = require("path"); // For file paths
require("dotenv").config();

const testRoutes = require("./routes/test.routes");
const authRoutes = require("./routes/auth.routes"); // We'll create this next

const app = express();

// Middleware - ORDER MATTERS!
app.use(cors()); // Enable CORS first
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploaded files (create this directory later)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/conference_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Connect to MongoDB
connectDB();

// Monitor connection events
mongoose.connection.on("connected", () => {
  console.log("📊 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from DB");
});

// Route Mounting
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes); // We'll create auth.routes.js next

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Conference Management API is running 🚀",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    endpoints: {
      test: "/api/test",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      }
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`📁 API Base: http://localhost:${PORT}/api`);
});