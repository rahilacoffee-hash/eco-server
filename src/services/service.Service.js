import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

// Get all active services
export const getActiveServices = async () => {
  return prisma.service.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};


// Get single active service by slug
export const getServiceBySlug = async (slug) => {
  const service = await prisma.service.findFirst({
    where: {
      slug,
      active: true,
    },
  });

  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  return service;
};


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// Get all services
export const getAllServices = async () => {
  return prisma.service.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};


// Get service by ID
export const getServiceById = async (id) => {
  const service = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  return service;
};


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export const createService = async (data) => {
  const {
    title,
    slug,
    brief,
    description,
    image,
    active,
  } = data;

  const existingService = await prisma.service.findUnique({
    where: {
      slug,
    },
  });

  if (existingService) {
    throw new Error("SLUG_ALREADY_EXISTS");
  }

  return prisma.service.create({
    data: {
      title,
      slug,
      brief,
      description: description || null,
      image: image || null,
      active: active !== undefined ? active : true,
    },
  });
};


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

export const updateService = async (id, data) => {
  const existingService = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!existingService) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  // Check slug uniqueness
  if (data.slug && data.slug !== existingService.slug) {
    const slugExists = await prisma.service.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (slugExists) {
      throw new Error("SLUG_ALREADY_EXISTS");
    }
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.slug !== undefined) {
    updateData.slug = data.slug;
  }

  if (data.brief !== undefined) {
    updateData.brief = data.brief;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.image !== undefined) {
    updateData.image = data.image;
  }

  if (data.active !== undefined) {
    updateData.active = data.active;
  }

  return prisma.service.update({
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

export const deleteService = async (id) => {
  const existingService = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!existingService) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  await prisma.service.delete({
    where: {
      id,
    },
  });

  return {
    id,
  };
};