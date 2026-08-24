import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

// Get all published testimonials
export const getPublishedTestimonials = async () => {
  return prisma.testimonial.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// Get all testimonials
export const getAllTestimonials = async () => {
  return prisma.testimonial.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};


// Get testimonial by ID
export const getTestimonialById = async (id) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!testimonial) {
    throw new Error("TESTIMONIAL_NOT_FOUND");
  }

  return testimonial;
};


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export const createTestimonial = async (data) => {
  const {
    clientName,
    clientRole,
    company,
    content,
    rating,
    image,
    published,
  } = data;

  return prisma.testimonial.create({
    data: {
      clientName,
      clientRole: clientRole || null,
      company: company || null,
      content,
      rating: rating ?? 5,
      image: image || null,
      published: published ?? false,
    },
  });
};


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

export const updateTestimonial = async (id, data) => {
  const existingTestimonial =
    await prisma.testimonial.findUnique({
      where: {
        id,
      },
    });

  if (!existingTestimonial) {
    throw new Error("TESTIMONIAL_NOT_FOUND");
  }

  const updateData = {};

  if (data.clientName !== undefined) {
    updateData.clientName = data.clientName;
  }

  if (data.clientRole !== undefined) {
    updateData.clientRole = data.clientRole;
  }

  if (data.company !== undefined) {
    updateData.company = data.company;
  }

  if (data.content !== undefined) {
    updateData.content = data.content;
  }

  if (data.rating !== undefined) {
    updateData.rating = data.rating;
  }

  if (data.image !== undefined) {
    updateData.image = data.image;
  }

  if (data.published !== undefined) {
    updateData.published = data.published;
  }

  return prisma.testimonial.update({
    where: {
      id,
    },
    data: updateData,
  });
};


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const deleteTestimonial = async (id) => {
  const existingTestimonial =
    await prisma.testimonial.findUnique({
      where: {
        id,
      },
    });

  if (!existingTestimonial) {
    throw new Error("TESTIMONIAL_NOT_FOUND");
  }

  await prisma.testimonial.delete({
    where: {
      id,
    },
  });

  return {
    id,
  };
};