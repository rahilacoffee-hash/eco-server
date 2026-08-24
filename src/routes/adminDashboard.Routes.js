import { Router } from "express";

import { getDashboard } from "../controllers/dashboard.Controller.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

// GET /api/admin/dashboard
router.get(
  "/",
  requireAdmin,
  getDashboard
);

export default router;