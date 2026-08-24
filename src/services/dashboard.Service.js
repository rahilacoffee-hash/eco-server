import prisma from "../config/prisma.js";

export const getDashboardData = async () => {
  const [
    projects,
    services,
    testimonials,
    newContacts,
    recentProjects,
    recentTestimonials,
    recentContacts,
  ] = await Promise.all([
    // Total projects
    prisma.project.count(),

    // Active services
    prisma.service.count({
      where: {
        active: true,
      },
    }),

    // Published testimonials
    prisma.testimonial.count({
      where: {
        published: true,
      },
    }),

    // New contact requests
    prisma.contactRequest.count({
      where: {
        status: "NEW",
      },
    }),

    // Recent projects
    prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        coverImage: true,
        createdAt: true,
      },
    }),

    // Recent testimonials
    prisma.testimonial.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        clientName: true,
        company: true,
        rating: true,
        published: true,
        createdAt: true,
      },
    }),

    // Recent contact requests
    prisma.contactRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    stats: {
      projects,
      services,
      testimonials,
      newContacts,
    },

    recentProjects,
    recentTestimonials,
    recentContacts,
  };
};