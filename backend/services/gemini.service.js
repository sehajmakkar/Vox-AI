import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Analyze transcript text with Gemini API
   * @param {string} transcriptText - Full transcript text to analyze
   * @param {string} analysisType - Type of analysis to perform (summary, actionItems, minutesOfMeeting)
   * @returns {Promise<string>} - Analysis result
   */
  async analyzeTranscript(transcriptText, analysisType) {
    try {
      let prompt = '';
      
      switch (analysisType) {
        case 'summary':
          prompt = `
            You are an expert meeting assistant. 
            Below is a transcript of a meeting. Please provide a concise summary of the key points discussed.
            Focus on the main topics, decisions made, and important information shared.
            Keep it under 300 words and make it professionally written.
    
            Meeting Transcript:
            ${transcriptText}
          `;
          break;
          
        case 'actionItems':
          prompt = `
            You are an expert meeting assistant.
            Below is a transcript of a meeting. Please extract all action items and priorities mentioned.
            Format each action item as a clear, actionable statement.
            Include who is responsible (if mentioned) and any deadlines discussed.
            List only concrete tasks and commitments made during the meeting.
    
            Meeting Transcript:
            ${transcriptText}
          `;
          break;
          
        case 'minutesOfMeeting':
          prompt = `
            You are an expert meeting assistant.
            Below is a transcript of a meeting. Please create formal minutes of the meeting.
            Include the following sections:
            1. Attendees (extract names if mentioned)
            2. Agenda Items Discussed (formatted as headers with bullet points under each)
            3. Decisions Made
            4. Discussion Points
            
            Format this as a professional document that could be shared with all meeting participants.
    
            Meeting Transcript:
            ${transcriptText}
          `;
          break;
          
        default:
          throw new Error('Invalid analysis type requested');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing transcript with Gemini:', error);
      throw new Error(`Failed to analyze transcript: ${error.message}`);
    }
  }
}

export default new GeminiService();