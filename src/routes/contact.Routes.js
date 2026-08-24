import { Router } from "express";
import { createContactRequest } from "../controllers/contact.Controller.js";

const router = Router();

router.post("/", createContactRequest);

export default router;
