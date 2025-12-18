import express from "express";
import multer from "multer";
import { uploadPdf, sendChat } from "../controllers/chat.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadPdf);
router.post("/send", sendChat);

export default router;
