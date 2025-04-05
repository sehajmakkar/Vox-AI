import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'Untitled Meeting'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  participants: {
    type: [String],
    default: []
  },
  transcriptIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transcript'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed'],
    default: 'ongoing'
  }
}, { timestamps: true });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;