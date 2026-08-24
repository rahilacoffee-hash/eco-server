import {
  getPublishedProjects,
  getProjectBySlug,
  getAllProjects,
  getProjectById,
  createProject as createProjectService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
  addProjectImage as addProjectImageService,
  updateProjectImage as updateProjectImageService,
  deleteProjectImage as deleteProjectImageService,
} from "../services/project.Service.js";
import { uploadImage } from "../services/imageUpload.Service.js";

/*
|--------------------------------------------------------------------------
| PUBLIC PROJECTS
|--------------------------------------------------------------------------
*/

// GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const projects = await getPublishedProjects();

    return res.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};


// GET /api/projects/:slug
export const getProject = async (req, res) => {
  try {
    const { slug } = req.params;

    const project = await getProjectBySlug(slug);

    return res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);

    if (error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADMIN PROJECTS
|--------------------------------------------------------------------------
*/

// GET /api/admin/projects
export const getAdminProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();

    return res.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Get admin projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};


// GET /api/admin/projects/:id
export const getAdminProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await getProjectById(id);

    return res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Get admin project error:", error);

    if (error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project",
    });
  }
};


// POST /api/admin/projects
export const createProject = async (req, res) => {
  try {
    const {
      title,
      slug,
      brief,
      description,
      category,
      location,
      completionYear,
      status,
      coverImage,
    } = req.body;

    const uploadedCoverImage = await uploadImage(req.file, "echohome/projects/covers");

    if (!title || !slug || !brief || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Title, slug, brief and category are required",
      });
    }

    const project = await createProjectService({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      brief: brief.trim(),
      description:
        description?.trim() || null,
      category: category.trim(),
      location:
        location?.trim() || null,
      completionYear,
      status,
      coverImage: uploadedCoverImage || coverImage?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (error.message === "SLUG_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A project with this slug already exists",
      });
    }

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create project",
    });
  }
};


// PATCH /api/admin/projects/:id
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      brief,
      description,
      category,
      location,
      completionYear,
      status,
      coverImage,
    } = req.body;

    const uploadedCoverImage = await uploadImage(req.file, "echohome/projects/covers");

    const project = await updateProjectService(id, {
      title:
        title !== undefined
          ? title.trim()
          : undefined,

      slug:
        slug !== undefined
          ? slug.trim().toLowerCase()
          : undefined,

      brief:
        brief !== undefined
          ? brief.trim()
          : undefined,

      description:
        description !== undefined
          ? description?.trim() || null
          : undefined,

      category:
        category !== undefined
          ? category.trim()
          : undefined,

      location:
        location !== undefined
          ? location?.trim() || null
          : undefined,

      completionYear,
      status,

      coverImage: uploadedCoverImage || (coverImage !== undefined ? coverImage?.trim() || null : undefined),
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Update project error:", error);

    if (error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (error.message === "SLUG_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A project with this slug already exists",
      });
    }

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update project",
    });
  }
};


// DELETE /api/admin/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteProjectService(id);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    if (error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete project",
    });
  }
};


/*
|--------------------------------------------------------------------------
| PROJECT IMAGES
|--------------------------------------------------------------------------
*/

// POST /api/admin/projects/:projectId/images
export const addProjectImage = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      url,
      alt,
      sortOrder,
    } = req.body;

    const uploadedImage = await uploadImage(req.file, "echohome/projects/gallery");

    if (!uploadedImage && !url) {
      return res.status(400).json({
        success: false,
        message: "An image file or image URL is required",
      });
    }

    const image = await addProjectImageService(
      projectId,
      {
        url: uploadedImage || url.trim(),
        alt: alt?.trim() || null,
        sortOrder,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Project image added successfully",
      data: {
        image,
      },
    });
  } catch (error) {
    console.error("Add project image error:", error);

    if (error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add project image",
    });
  }
};


// PATCH /api/admin/projects/project-images/:imageId
export const updateProjectImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const {
      url,
      alt,
      sortOrder,
    } = req.body;

    const uploadedImage = await uploadImage(req.file, "echohome/projects/gallery");

    const image =
      await updateProjectImageService(
        imageId,
        {
          url: uploadedImage || (url !== undefined ? url.trim() : undefined),

          alt:
            alt !== undefined
              ? alt?.trim() || null
              : undefined,

          sortOrder,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Project image updated successfully",
      data: {
        image,
      },
    });
  } catch (error) {
    console.error(
      "Update project image error:",
      error
    );

    if (error.message === "IMAGE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project image not found",
      });
    }

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update project image",
    });
  }
};


// DELETE /api/admin/projects/project-images/:imageId
export const deleteProjectImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    await deleteProjectImageService(imageId);

    return res.status(200).json({
      success: true,
      message: "Project image deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete project image error:",
      error
    );

    if (error.message === "IMAGE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project image not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete project image",
    });
  }
};
