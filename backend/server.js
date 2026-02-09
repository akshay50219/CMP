const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const connectDB = require("./config/db"); // Fixed path

// Routes
const authRoutes = require("C:/Users/hp/Desktop/CMP/backend/src/routes/auth.routes");
const authorRoutes = require("./src/routes/author.routes");
const reviewerRoutes = require("./src/routes/reviewer.routes");
const adminRoutes = require("./src/routes/admin.routes");
const programRoutes = require("./src/routes/program.routes");
const statsRoutes = require("./src/routes/stats.routes");
const testRoutes = require("./src/routes/test.routes");

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CREATE UPLOAD FOLDER ====================
const uploadDir = path.join(__dirname, "uploads/papers");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Upload folder created:", uploadDir);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== LOGGER ====================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/reviewer", reviewerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/program", programRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/test", testRoutes);

// ==================== TEST ====================
app.get("/", (req, res) => {
  res.json({
    message: "Conference Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      author: "/api/author",
      reviewer: "/api/reviewer",
      admin: "/api/admin"
    }
  });
});

// ==================== ERROR ====================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// ==================== CONNECT DATABASE THEN START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log("=================================");
      console.log("🚀 Server started successfully!");
      console.log("📍 Port:", PORT);
      console.log("🌐 http://localhost:" + PORT);
      console.log("=================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();