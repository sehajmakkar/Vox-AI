import express from 'express';
import * as meetingController from '../controllers/meeting.controller.js';

const router = express.Router();

// Route to create a new meeting
router.post('/', meetingController.createMeeting);

// Route to get all meetings
router.get('/', meetingController.getAllMeetings);

// Route to get a specific meeting with its transcripts
router.get('/:roomId', meetingController.getMeetingWithTranscripts);

// Route to end a meeting
router.put('/:roomId/end', meetingController.endMeeting);

export default router;