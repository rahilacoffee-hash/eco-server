import {
  getActiveServices,
  getServiceBySlug,
  getAllServices,
  getServiceById,
  createService as createServiceService,
  updateService as updateServiceService,
  deleteService as deleteServiceService,
} from "../services/service.Service.js";
import { uploadImage } from "../services/imageUpload.Service.js";

const normaliseBoolean = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICES
|--------------------------------------------------------------------------
*/

// GET /api/services
export const getServices = async (req, res) => {
  try {
    const services = await getActiveServices();

    return res.status(200).json({
      success: true,
      data: {
        services,
      },
    });
  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch services",
    });
  }
};


// GET /api/services/:slug
export const getService = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await getServiceBySlug(slug);

    return res.status(200).json({
      success: true,
      data: {
        service,
      },
    });
  } catch (error) {
    console.error("Get service error:", error);

    if (error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch service",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADMIN SERVICES
|--------------------------------------------------------------------------
*/

// GET /api/admin/services
export const getAdminServices = async (req, res) => {
  try {
    const services = await getAllServices();

    return res.status(200).json({
      success: true,
      data: {
        services,
      },
    });
  } catch (error) {
    console.error("Get admin services error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch services",
    });
  }
};


// GET /api/admin/services/:id
export const getAdminService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await getServiceById(id);

    return res.status(200).json({
      success: true,
      data: {
        service,
      },
    });
  } catch (error) {
    console.error("Get admin service error:", error);

    if (error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch service",
    });
  }
};


// POST /api/admin/services
export const createService = async (req, res) => {
  try {
    const {
      title,
      slug,
      brief,
      description,
      image,
      active,
    } = req.body;

    const uploadedImage = await uploadImage(req.file, "echohome/services");

    // Required fields
    if (!title || !slug || !brief) {
      return res.status(400).json({
        success: false,
        message: "Title, slug and brief are required",
      });
    }

    const service = await createServiceService({
      title: title.trim(),

      slug: slug
        .trim()
        .toLowerCase(),

      brief: brief.trim(),

      description:
        description?.trim() || null,

      image: uploadedImage || image?.trim() || null,

      active: normaliseBoolean(active),
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: {
        service,
      },
    });
  } catch (error) {
    console.error("Create service error:", error);

    if (error.message === "SLUG_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A service with this slug already exists",
      });
    }

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create service",
    });
  }
};


// PATCH /api/admin/services/:id
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      brief,
      description,
      image,
      active,
    } = req.body;

    const uploadedImage = await uploadImage(req.file, "echohome/services");

    const service = await updateServiceService(id, {
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

      image: uploadedImage || (image !== undefined ? image?.trim() || null : undefined),

      active: normaliseBoolean(active),
    });

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: {
        service,
      },
    });
  } catch (error) {
    console.error("Update service error:", error);

    if (error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (error.message === "SLUG_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A service with this slug already exists",
      });
    }

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update service",
    });
  }
};


// DELETE /api/admin/services/:id
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteServiceService(id);

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    if (error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete service",
    });
  }
};
