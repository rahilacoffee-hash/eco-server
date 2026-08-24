import {
  getPublishedTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial as createTestimonialService,
  updateTestimonial as updateTestimonialService,
  deleteTestimonial as deleteTestimonialService,
} from "../services/testimonial.Service.js";

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

// GET /api/testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await getPublishedTestimonials();

    return res.status(200).json({
      success: true,
      data: {
        testimonials,
      },
    });
  } catch (error) {
    console.error("Get testimonials error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch testimonials",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// GET /api/admin/testimonials
export const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await getAllTestimonials();

    return res.status(200).json({
      success: true,
      data: {
        testimonials,
      },
    });
  } catch (error) {
    console.error("Get admin testimonials error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch testimonials",
    });
  }
};


// GET /api/admin/testimonials/:id
export const getAdminTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await getTestimonialById(id);

    return res.status(200).json({
      success: true,
      data: {
        testimonial,
      },
    });
  } catch (error) {
    console.error("Get admin testimonial error:", error);

    if (error.message === "TESTIMONIAL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch testimonial",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

// POST /api/admin/testimonials
export const createTestimonial = async (req, res) => {
  try {
    const {
      clientName,
      clientRole,
      company,
      content,
      rating,
      image,
      published,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Required fields
    |--------------------------------------------------------------------------
    */

    if (!clientName || !content) {
      return res.status(400).json({
        success: false,
        message: "Client name and content are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Rating validation
    |--------------------------------------------------------------------------
    */

    if (
      rating !== undefined &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const testimonial =
      await createTestimonialService({
        clientName: clientName.trim(),

        clientRole:
          clientRole?.trim() || null,

        company:
          company?.trim() || null,

        content: content.trim(),

        rating:
          rating !== undefined
            ? Number(rating)
            : 5,

        image:
          image?.trim() || null,

        published:
          published !== undefined
            ? Boolean(published)
            : false,
      });

    return res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: {
        testimonial,
      },
    });
  } catch (error) {
    console.error("Create testimonial error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create testimonial",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

// PATCH /api/admin/testimonials/:id
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      clientName,
      clientRole,
      company,
      content,
      rating,
      image,
      published,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Rating validation
    |--------------------------------------------------------------------------
    */

    if (
      rating !== undefined &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const testimonial =
      await updateTestimonialService(id, {
        clientName:
          clientName !== undefined
            ? clientName.trim()
            : undefined,

        clientRole:
          clientRole !== undefined
            ? clientRole?.trim() || null
            : undefined,

        company:
          company !== undefined
            ? company?.trim() || null
            : undefined,

        content:
          content !== undefined
            ? content.trim()
            : undefined,

        rating:
          rating !== undefined
            ? Number(rating)
            : undefined,

        image:
          image !== undefined
            ? image?.trim() || null
            : undefined,

        published,
      });

    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: {
        testimonial,
      },
    });
  } catch (error) {
    console.error("Update testimonial error:", error);

    if (error.message === "TESTIMONIAL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update testimonial",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

// DELETE /api/admin/testimonials/:id
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteTestimonialService(id);

    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);

    if (error.message === "TESTIMONIAL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete testimonial",
    });
  }
};