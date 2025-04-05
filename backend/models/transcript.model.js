import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  segments: [{
    id: Number,
    start: Number,
    end: Number,
    text: String,
    tokens: [Number],
    temperature: Number,
    avg_logprob: Number,
    compression_ratio: Number,
    no_speech_prob: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a text index for searching
transcriptSchema.index({ text: 'text' });

const Transcript = mongoose.model('Transcript', transcriptSchema);

export default Transcript;