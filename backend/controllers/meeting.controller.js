import Meeting from "../models/meeting.model.js";
import Transcript from "../models/transcript.model.js";

/**
 * Controller for handling meeting operations
 */
export const createMeeting = async (req, res) => {
  try {
    const { roomId, title } = req.body;

    // Check if meeting with this roomId already exists
    const existingMeeting = await Meeting.findOne({ roomId });
    if (existingMeeting) {
      return res.status(400).json({
        success: false,
        message: "Meeting with this roomId already exists",
      });
    }

    // Create new meeting
    const meeting = new Meeting({
      roomId,
      title: title || `Meeting ${roomId}`,
      startTime: new Date(),
    });

    const savedMeeting = await meeting.save();

    res.status(201).json({
      success: true,
      data: savedMeeting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create meeting",
      error: error.message,
    });
  }
};

/**
 * Get all meetings
 */
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch meetings",
      error: error.message,
    });
  }
};

/**
 * Get a specific meeting with its transcripts
 */
export const getMeetingWithTranscripts = async (req, res) => {
  try {
    const { roomId } = req.params;

    const meeting = await Meeting.findOne({ roomId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // Get all transcripts for this meeting
    const transcripts = await Transcript.find({ meetingId: roomId })
      .sort({ createdAt: -1 })
      .select("text createdAt duration");

    res.status(200).json({
      success: true,
      data: {
        meeting,
        transcripts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch meeting details",
      error: error.message,
    });
  }
};

/**
 * End a meeting
 */
export const endMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;

    const meeting = await Meeting.findOneAndUpdate(
      { roomId },
      {
        endTime: new Date(),
        status: "completed",
      },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to end meeting",
      error: error.message,
    });
  }
};
