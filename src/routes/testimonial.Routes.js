import { Router } from "express";

import {
  getTestimonials,
} from "../controllers/testimonial.Controller.js";

const router = Router();

// GET /api/testimonials
router.get("/", getTestimonials);

export default router;