import { Router } from "express";

import {
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectImage,
  updateProjectImage,
  deleteProjectImage,
} from "../controllers/project.Controller.js";

import { requireAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| PROJECTS
|--------------------------------------------------------------------------
*/

// GET /api/admin/projects
router.get(
  "/",
  requireAdmin,
  getAdminProjects
);

// GET /api/admin/projects/:id
router.get(
  "/:id",
  requireAdmin,
  getAdminProject
);

// POST /api/admin/projects
router.post(
  "/",
  requireAdmin,
  upload.single("coverImage"),
  createProject
);

// PATCH /api/admin/projects/:id
router.patch(
  "/:id",
  requireAdmin,
  upload.single("coverImage"),
  updateProject
);

// DELETE /api/admin/projects/:id
router.delete(
  "/:id",
  requireAdmin,
  deleteProject
);

/*
|--------------------------------------------------------------------------
| PROJECT IMAGES
|--------------------------------------------------------------------------
*/

// POST /api/admin/projects/:projectId/images
router.post(
  "/:projectId/images",
  requireAdmin,
  upload.single("image"),
  addProjectImage
);

// PATCH /api/admin/projects/project-images/:imageId
router.patch(
  "/project-images/:imageId",
  requireAdmin,
  upload.single("image"),
  updateProjectImage
);

// DELETE /api/admin/projects/project-images/:imageId
router.delete(
  "/project-images/:imageId",
  requireAdmin,
  deleteProjectImage
);

export default router;
