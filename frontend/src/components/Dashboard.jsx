import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [mom, setMom] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        // Fetch meeting details along with transcripts
        const response = await axios.get(`${BACKEND_URL}/api/meetings/${roomId}`);
        setMeetingData(response.data.data.meeting);
        setTranscripts(response.data.data.transcripts);
        
        // If we have transcripts, process them with Gemini API
        if (response.data.data.transcripts.length > 0) {
          processTranscriptsWithGemini(response.data.data.transcripts);
        } else {
          setLoading(false);
          setError("No transcripts found for this meeting.");
        }
      } catch (err) {
        console.error("Error fetching meeting data:", err);
        setLoading(false);
        setError("Failed to load meeting data. Please try again.");
      }
    };

    fetchMeetingData();
  }, [roomId]);

  const processTranscriptsWithGemini = async (transcriptData) => {
    try {
      // Combine all transcript text
      const fullTranscript = transcriptData.map(t => t.text).join(' ');
      
      // Call your backend endpoint that interfaces with Gemini API
      const summaryResponse = await axios.post(`${BACKEND_URL}/api/gemini/analyze`, {
        transcriptText: fullTranscript,
        analysisType: 'summary'
      });
      setSummary(summaryResponse.data.result);
      
      const actionItemsResponse = await axios.post(`${BACKEND_URL}/api/gemini/analyze`, {
        transcriptText: fullTranscript,
        analysisType: 'actionItems'
      });
      setActionItems(actionItemsResponse.data.result.split('\n').filter(item => item.trim() !== ''));
      
      const momResponse = await axios.post(`${BACKEND_URL}/api/gemini/analyze`, {
        transcriptText: fullTranscript,
        analysisType: 'minutesOfMeeting'
      });
      setMom(momResponse.data.result);
      
      setLoading(false);
    } catch (err) {
      console.error("Error processing transcripts with Gemini:", err);
      setLoading(false);
      setError("Failed to analyze meeting content. Please try again.");
    }
  };

  const handleBackToHome = () => {
    navigate('/join');
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Analyzing meeting content...</h2>
        <p className="text-blue-600 text-center">This may take a moment as we process your meeting transcripts.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-3xl font-bold text-blue-800">Meeting Dashboard</h1>
            {meetingData && (
              <div className="mt-2 md:mt-0">
                <h2 className="text-xl font-semibold text-blue-700">{meetingData.title}</h2>
                <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-blue-600">
                  <p>Date: {new Date(meetingData.startTime).toLocaleDateString()}</p>
                  <p>Duration: {meetingData.endTime && 
                    `${Math.round((new Date(meetingData.endTime) - new Date(meetingData.startTime)) / 60000)} minutes`}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
          {/* Summary Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-600 px-4 py-5">
              <h3 className="text-lg font-medium text-white">Meeting Summary</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 h-64 overflow-y-auto">
              <p className="text-gray-700">
                {summary || "No summary available."}
              </p>
            </div>
          </div>

          {/* Action Items Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-700 px-4 py-5">
              <h3 className="text-lg font-medium text-white">Action Items & Priorities</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 h-64 overflow-y-auto">
              {actionItems.length > 0 ? (
                <ul className="space-y-2">
                  {actionItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No action items identified.</p>
              )}
            </div>
          </div>

          {/* Minutes of Meeting Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-800 px-4 py-5">
              <h3 className="text-lg font-medium text-white">Minutes of Meeting</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 h-64 overflow-y-auto">
              {mom ? (
                <div className="text-gray-700 mom-content" dangerouslySetInnerHTML={{ __html: mom.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-gray-500 italic">No minutes available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 px-4 sm:px-0 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            className="px-6 py-3 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
          {meetingData && (
            <button 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([
                  `# Meeting: ${meetingData.title}\n` +
                  `Date: ${new Date(meetingData.startTime).toLocaleDateString()}\n` +
                  `Duration: ${meetingData.endTime && 
                    `${Math.round((new Date(meetingData.endTime) - new Date(meetingData.startTime)) / 60000)} minutes`}\n\n` +
                  `## Summary\n${summary}\n\n` +
                  `## Action Items\n${actionItems.map(item => `- ${item}`).join('\n')}\n\n` +
                  `## Minutes of Meeting\n${mom}`
                ], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `Meeting_${roomId}_Summary.md`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;