const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    console.log("ENV CHECK:", uri);

    if (!uri) {
      throw new Error("MONGODB_URI is undefined. Check .env file");
    }

    await mongoose.connect(uri);

    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully!");
    console.log("=================================");
  } catch (error) {
    console.error("=================================");
    console.error("❌ MongoDB Connection Error:");
    console.error(error.message);
    console.error("=================================");
    process.exit(1);
  }
};

module.exports = connectDB;