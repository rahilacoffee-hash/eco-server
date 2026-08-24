import { Router } from "express";

import {
  getServices,
  getService,
} from "../controllers/service.Controller.js";

const router = Router();

// GET /api/services
router.get("/", getServices);

// GET /api/services/:slug
router.get("/:slug", getService);

export default router;