import { Router } from "express";
import { getAdminContacts, replyToContact } from "../controllers/adminContact.Controller.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", requireAdmin, getAdminContacts);
router.post("/:id/reply", requireAdmin, replyToContact);
export default router;
