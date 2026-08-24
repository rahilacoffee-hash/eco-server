import prisma from "../config/prisma.js";
import { sendContactReplyEmail } from "../services/email.Service.js";

export const getAdminContacts = async (_req, res) => {
  try {
    const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, data: { contacts } });
  } catch (error) {
    console.error("Get admin contacts error:", error);
    return res.status(500).json({ success: false, message: "Unable to load contact requests" });
  }
};

export const replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) return res.status(400).json({ success: false, message: "Subject and reply message are required" });

    const contact = await prisma.contactRequest.findUnique({ where: { id } });
    if (!contact) return res.status(404).json({ success: false, message: "Contact request not found" });

    await sendContactReplyEmail({ email: contact.email, name: contact.name, subject: subject.trim(), message: message.trim() });

    const updatedContact = await prisma.contactRequest.update({
      where: { id },
      data: { status: "CONTACTED", notes: message.trim() },
    });

    return res.status(200).json({ success: true, message: "Reply sent successfully", data: { contact: updatedContact } });
  } catch (error) {
    console.error("Reply to contact error:", error);
    if (error.message === "EMAIL_SENDER_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Email sending is not configured. Add EMAIL_FROM to the backend environment." });
    }

    if (error.message === "EMAIL_DELIVERY_FAILED") {
      return res.status(502).json({ success: false, message: "Your email provider rejected the reply. Check that EMAIL_FROM is a verified Brevo sender and that BREVO_API_KEY is active." });
    }

    return res.status(500).json({ success: false, message: "Unable to send reply" });
  }
};
