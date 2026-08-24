import { Router } from "express";

import {
  getProjects,
  getProject,
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

const router = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get("/", getProjects);

router.get("/:slug", getProject);


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.get("/admin/all", requireAdmin, getAdminProjects);

router.get("/admin/:id", requireAdmin, getAdminProject);

router.post("/admin", requireAdmin, createProject);

router.patch("/admin/:id", requireAdmin, updateProject);

router.delete("/admin/:id", requireAdmin, deleteProject);


/*
|--------------------------------------------------------------------------
| PROJECT IMAGES
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/:projectId/images",
  requireAdmin,
  addProjectImage
);

router.patch(
  "/admin/project-images/:imageId",
  requireAdmin,
  updateProjectImage
);

router.delete(
  "/admin/project-images/:imageId",
  requireAdmin,
  deleteProjectImage
);

export default router;
