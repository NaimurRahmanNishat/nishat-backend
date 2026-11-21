const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nishat-frontend.vercel.app"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "25mb" }));

// Cached MongoDB Connection for Serverless
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }
  if (!process.env.DB_URI) {
    throw new Error("DB_URI is missing in environment variables");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

// Ensure DB is connected before routes
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Root route (outside async main so it is always registered)
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

const UploadImage = require("./src/utils/UploadImage");

// API routes
const useRouter = require("./src/users/user.route");
const productRoutes = require("./src/products/product.route");
const reviewsRoutes = require("./src/reviews/review.route");
const ordersRoutes = require("./src/orders/order.route");
const statsRoutes = require("./src/stats/stats.route");

app.use("/api/auth", useRouter);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stats", statsRoutes);

// Upload image to cloudinary server
app.post("/uploadImage", async (req, res, next) => {
  try {
    const url = await UploadImage(req.body.image);
    res.send(url);
  } catch (error) {
    next(error);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server locally / on persistent host
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log("MongoDB Connected Successfully!");
      app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}`);
      });
    })
    .catch((err) => console.log(err));
}

module.exports = app;
