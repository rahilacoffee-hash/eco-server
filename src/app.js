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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ecohome API is running",
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
| PUBLIC
|--------------------------------------------------------------------------
*/

app.use("/api/contact", contactRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/projects", projectRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

app.use("/api/admin/projects", adminProjectRoutes);

app.use("/api/services", serviceRoutes);
app.use("/api/admin/services", adminServiceRoutes);

app.use("/api/testimonials", testimonialRoutes);
app.use("/api/admin/testimonials", adminTestimonialRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/contacts", adminContactRoutes);

app.use((error, _req, res, _next) => {
  if (error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Image must be 10 MB or smaller" });
  }

  if (error.message === "Only JPG, PNG, WEBP, and GIF images are allowed") {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ success: false, message: "Unable to process request" });
});

export default app;
