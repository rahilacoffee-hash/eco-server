import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.Routes.js";
import contactRoutes from "./routes/contact.Routes.js";
import projectRoutes from "./routes/project.Routes.js";
import adminProjectRoutes from "./routes/adminProject.Routes.js";
import serviceRoutes from "./routes/service.Routes.js";
import adminServiceRoutes from "./routes/adminService.Routes.js";
import testimonialRoutes from "./routes/testimonial.Routes.js";
import adminTestimonialRoutes from "./routes/adminTestimonial.Routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.Routes.js";
import homepageRoutes from "./routes/homepage.Routes.js";
import adminContactRoutes from "./routes/adminContact.Routes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "https://ecohomeconcepts.vercel.app",
  ...String(process.env.CLIENT_URL || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

const isAllowedOrigin = (origin) => {
  const normalisedOrigin = origin.replace(/\/$/, "");

  return (
    allowedOrigins.includes(normalisedOrigin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalisedOrigin)
  );
};

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSERS
|--------------------------------------------------------------------------
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| COOKIES
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| ROOT
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Ecohome API is running 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Ecohome API is running",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/contact", contactRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/testimonials", testimonialRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/admin/projects", adminProjectRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/testimonials", adminTestimonialRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/contacts", adminContactRoutes);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, _req, res, _next) => {
  /*
  |--------------------------------------------------------------------------
  | MULTER FILE SIZE ERROR
  |--------------------------------------------------------------------------
  */

  if (
    error.name === "MulterError" &&
    error.code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(400).json({
      success: false,
      message: "Image must be 10 MB or smaller",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | INVALID IMAGE TYPE
  |--------------------------------------------------------------------------
  */

  if (
    error.message ===
    "Only JPG, PNG, WEBP, and GIF images are allowed"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | UNKNOWN ERROR
  |--------------------------------------------------------------------------
  */

  console.error("Unhandled request error:", error);

  return res.status(500).json({
    success: false,
    message: "Unable to process request",
  });
});

export default app;
