import { Router } from "express";
import { getHomepage, updateHomepage, uploadHomepageSectionImage } from "../controllers/homepage.Controller.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", getHomepage);
router.put("/", requireAdmin, updateHomepage);
router.post("/images/:section", requireAdmin, upload.single("image"), uploadHomepageSectionImage);

export default router;
