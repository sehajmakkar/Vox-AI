import geminiService from '../services/gemini.service.js';

/**
 * Controller for handling Gemini API operations
 */
export const analyzeTranscript = async (req, res) => {
  try {
    const { transcriptText, analysisType } = req.body;
    
    if (!transcriptText) {
      return res.status(400).json({
        success: false,
        message: 'Transcript text is required'
      });
    }
    
    if (!analysisType || !['summary', 'actionItems', 'minutesOfMeeting'].includes(analysisType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid analysis type is required (summary, actionItems, or minutesOfMeeting)'
      });
    }
    
    const result = await geminiService.analyzeTranscript(transcriptText, analysisType);
    
    res.status(200).json({
      success: true,
      analysisType,
      result
    });
  } catch (error) {
    console.error('Error in analyzeTranscript controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze transcript',
      error: error.message
    });
  }
};