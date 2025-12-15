// src/routes/chatRoutes.js
import express from 'express';
import { chatWithAI } from '../controllers/chatController.js';

const router = express.Router();

// Endpoint: POST /api/chat
router.post('/chat', chatWithAI);

export default router;