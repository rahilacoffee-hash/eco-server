import prisma from "../config/prisma.js";

export const createContactRequest = async (req, res) => {
  const { name, email, phone, projectType, budget, message } = req.body;

  if (!name?.trim() || !email?.trim() || !projectType?.trim() || !message?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name, email, project type and project details are required",
    });
  }

  try {
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: `Quote request — ${projectType}${budget ? ` (${budget})` : ""}`,
        message: message.trim(),
      },
      select: { id: true, createdAt: true },
    });

    return res.status(201).json({
      success: true,
      message: "Your quote request has been received",
      data: { contactRequest },
    });
  } catch (error) {
    console.error("Create contact request error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your quote request",
    });
  }
};
