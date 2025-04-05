import Transcript from '../models/transcript.model.js';
import Meeting from '../models/meeting.model.js';
import transcriptionService from '../services/transcription.service.js';
import path from 'path';

/**
 * Controller for handling transcript operations
 */
export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const { meetingId } = req.body;
    if (!meetingId) {
      return res.status(400).json({ message: 'Meeting ID is required' });
    }

    // Check if meeting exists
    const meeting = await Meeting.findOne({ roomId: meetingId });
    if (!meeting) {
      // Create meeting if it doesn't exist
      const newMeeting = new Meeting({
        roomId: meetingId,
        title: `Meeting ${meetingId}`,
        startTime: new Date()
      });
      await newMeeting.save();
    }

    const filePath = path.join(process.cwd(), req.file.path);
    
    // Process the audio file and get transcription
    const transcriptionResult = await transcriptionService.transcribeAudio(filePath);
    
    // Create new transcript in DB
    const transcript = new Transcript({
      meetingId,
      fileName: req.file.filename,
      text: transcriptionResult.text,
      duration: transcriptionResult.duration || 0,
      segments: transcriptionResult.segments || []
    });

    const savedTranscript = await transcript.save();
    
    // Update meeting with transcript reference
    await Meeting.findOneAndUpdate(
      { roomId: meetingId },
      { $push: { transcriptIds: savedTranscript._id } }
    );
    
    // Clean up the uploaded file to save space
    transcriptionService.cleanupFile(filePath);
    
    res.status(201).json({
      success: true,
      message: 'Audio transcribed successfully',
      transcript: {
        id: savedTranscript._id,
        text: savedTranscript.text,
        duration: savedTranscript.duration
      }
    });
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process audio file',
      error: error.message
    });
  }
};

/**
 * Get all transcripts for a meeting
 */
export const getTranscriptsByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const transcripts = await Transcript.find({ meetingId })
      .select('text createdAt duration')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transcripts.length,
      data: transcripts
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transcripts',
      error: error.message
    });
  }
};

/**
 * Get a specific transcript by ID
 */
export const getTranscriptById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transcript not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transcript
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transcript',
      error: error.message
    });
  }
};