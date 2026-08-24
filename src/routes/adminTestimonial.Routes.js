import { Router } from "express";

import {
  getAdminTestimonials,
  getAdminTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.Controller.js";

import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ADMIN TESTIMONIALS
|--------------------------------------------------------------------------
*/

// GET /api/admin/testimonials
router.get(
  "/",
  requireAdmin,
  getAdminTestimonials
);

// GET /api/admin/testimonials/:id
router.get(
  "/:id",
  requireAdmin,
  getAdminTestimonial
);

// POST /api/admin/testimonials
router.post(
  "/",
  requireAdmin,
  createTestimonial
);

// PATCH /api/admin/testimonials/:id
router.patch(
  "/:id",
  requireAdmin,
  updateTestimonial
);

// DELETE /api/admin/testimonials/:id
router.delete(
  "/:id",
  requireAdmin,
  deleteTestimonial
);

export default router;