import { Router } from "express";

import {
  createAdmin,
  verifyEmail,
  login,
  refresh,
  logout,
  logoutAll,
  me,
} from "../controllers/auth.Controller.js";

import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Initial admin setup
router.post("/setup", createAdmin);

// Email verification
router.get("/verify-email", verifyEmail);

// Authentication
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected admin routes
router.get("/me", requireAdmin, me);
router.post("/logout-all", requireAdmin, logoutAll);

export default router;
