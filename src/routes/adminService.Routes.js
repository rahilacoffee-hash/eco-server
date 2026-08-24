import { Router } from "express";

import {
  getAdminServices,
  getAdminService,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.Controller.js";

import { requireAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

// GET /api/admin/services
router.get(
  "/",
  requireAdmin,
  getAdminServices
);

// GET /api/admin/services/:id
router.get(
  "/:id",
  requireAdmin,
  getAdminService
);

// POST /api/admin/services
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  createService
);

// PATCH /api/admin/services/:id
router.patch(
  "/:id",
  requireAdmin,
  upload.single("image"),
  updateService
);

// DELETE /api/admin/services/:id
router.delete(
  "/:id",
  requireAdmin,
  deleteService
);

export default router;
