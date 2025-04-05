import express from 'express';
import * as geminiController from '../controllers/gemini.controller.js';

const router = express.Router();

// Route to analyze transcript text using Gemini API
router.post('/analyze', geminiController.analyzeTranscript);

export default router;