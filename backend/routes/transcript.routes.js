import express from 'express';
import * as transcriptController from '../controllers/transcript.controller.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Route to handle audio transcription
router.post('/transcribe', upload.single('audio'), transcriptController.transcribeAudio);

// Route to get all transcripts for a meeting
router.get('/meeting/:meetingId', transcriptController.getTranscriptsByMeeting);

// Route to get a specific transcript
router.get('/:id', transcriptController.getTranscriptById);

export default router;