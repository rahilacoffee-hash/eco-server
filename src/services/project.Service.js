import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| GET ALL PUBLISHED PROJECTS
|--------------------------------------------------------------------------
*/

export const getPublishedProjects = async () => {
  return prisma.project.findMany({
    where: {
      status: "PUBLISHED",
    },

    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET PROJECT BY SLUG
|--------------------------------------------------------------------------
*/

export const getProjectBySlug = async (slug) => {
  const project = await prisma.project.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },

    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project;
};

/*
|--------------------------------------------------------------------------
| GET ALL PROJECTS - ADMIN
|--------------------------------------------------------------------------
*/

export const getAllProjects = async () => {
  return prisma.project.findMany({
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET PROJECT BY ID - ADMIN
|--------------------------------------------------------------------------
*/

export const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: {
      id,
    },

    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project;
};

/*
|--------------------------------------------------------------------------
| CREATE PROJECT
|--------------------------------------------------------------------------
*/

export const createProject = async (data) => {
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
  } = data;

  const existingProject = await prisma.project.findUnique({
    where: {
      slug,
    },
  });

  if (existingProject) {
    throw new Error("SLUG_ALREADY_EXISTS");
  }

  return prisma.project.create({
    data: {
      title,
      slug,
      brief,
      description: description || null,
      category,
      location: location || null,
      completionYear:
        completionYear !== undefined && completionYear !== null && completionYear !== ""
          ? Number(completionYear)
          : null,
      status: status || "DRAFT",
      coverImage: coverImage || null,
    },

    include: {
      images: true,
    },
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE PROJECT
|--------------------------------------------------------------------------
*/

export const updateProject = async (id, data) => {
  const existingProject = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!existingProject) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  /*
  |--------------------------------------------------------------------------
  | Check slug uniqueness if slug is being changed
  |--------------------------------------------------------------------------
  */

  if (data.slug && data.slug !== existingProject.slug) {
    const slugExists = await prisma.project.findUnique({
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

  if (data.category !== undefined) {
    updateData.category = data.category;
  }

  if (data.location !== undefined) {
    updateData.location = data.location;
  }

  if (data.completionYear !== undefined) {
    updateData.completionYear =
      data.completionYear === null
        ? null
        : Number(data.completionYear);
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.coverImage !== undefined) {
    updateData.coverImage = data.coverImage;
  }

  return prisma.project.update({
    where: {
      id,
    },

    data: updateData,

    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

/*
|--------------------------------------------------------------------------
| DELETE PROJECT
|--------------------------------------------------------------------------
*/

export const deleteProject = async (id) => {
  const existingProject = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!existingProject) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  return {
    id,
  };
};

/*
|--------------------------------------------------------------------------
| ADD PROJECT IMAGE
|--------------------------------------------------------------------------
*/

export const addProjectImage = async (
  projectId,
  data
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const {
    url,
    alt,
    sortOrder,
  } = data;

  return prisma.projectImage.create({
    data: {
      projectId,
      url,
      alt: alt || null,
      sortOrder:
        sortOrder !== undefined
          ? Number(sortOrder)
          : 0,
    },
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE PROJECT IMAGE
|--------------------------------------------------------------------------
*/

export const updateProjectImage = async (
  imageId,
  data
) => {
  const image = await prisma.projectImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  const updateData = {};

  if (data.url !== undefined) {
    updateData.url = data.url;
  }

  if (data.alt !== undefined) {
    updateData.alt = data.alt;
  }

  if (data.sortOrder !== undefined) {
    updateData.sortOrder = Number(data.sortOrder);
  }

  return prisma.projectImage.update({
    where: {
      id: imageId,
    },

    data: updateData,
  });
};

/*
|--------------------------------------------------------------------------
| DELETE PROJECT IMAGE
|--------------------------------------------------------------------------
*/

export const deleteProjectImage = async (imageId) => {
  const image = await prisma.projectImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  await prisma.projectImage.delete({
    where: {
      id: imageId,
    },
  });

  return {
    id: imageId,
  };
};
