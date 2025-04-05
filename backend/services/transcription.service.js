import fs from 'fs';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Service to handle transcription of audio files using Groq API
 */
class TranscriptionService {
  /**
   * Transcribe an audio file using Groq's Whisper model
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeAudio(filePath) {
    try {
      const fileStream = fs.createReadStream(filePath);
      
      // Create a transcription job
      const transcription = await groq.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-large-v3-turbo", // Using the fastest model with good multilingual support
        response_format: "verbose_json", // Get detailed output with timestamps
        timestamp_granularities: ["segment"], // Get segment-level timestamps
        temperature: 0.0, // Keep deterministic output
      });
      
      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }
  
  /**
   * Clean up the file after processing
   * @param {string} filePath - Path to the file to delete
   */
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}

export default new TranscriptionService();