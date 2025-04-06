import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AskAIButton from './AskAI';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Analyzing meeting content...</h2>
        <p className="text-blue-600 text-center">This may take a moment as we process your meeting transcripts.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-blue-100">
          <div className="flex items-center justify-center mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Oops! Something went wrong</h2>
          <p className="text-gray-700 mb-6 text-center">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h1 className="text-3xl font-bold text-blue-800">Meeting Dashboard</h1>
            </div>
            {meetingData && (
              <div className="mt-2 md:mt-0 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700">{meetingData.title}</h2>
                <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-blue-600 mt-1">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(meetingData.startTime).toLocaleDateString()}
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {meetingData.endTime && 
                      `${Math.round((new Date(meetingData.endTime) - new Date(meetingData.startTime)) / 60000)} minutes`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-0">
          {/* Summary Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-blue-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white">Meeting Summary</h3>
            </div>
            <div className="px-6 py-5 h-72 overflow-y-auto">
              <div className="prose prose-blue max-w-none text-gray-700">
                <ReactMarkdown>{summary || "No summary available."}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Action Items Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-blue-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-medium text-white">Action Items & Priorities</h3>
            </div>
            <div className="px-6 py-5 h-72 overflow-y-auto">
              {actionItems.length > 0 ? (
                <ul className="space-y-3">
                  {actionItems.map((item, index) => (
                    <li key={index} className="flex items-start bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 hover:bg-blue-100 transition-colors duration-200">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center mr-3 mt-0.5 text-white font-bold text-xs">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-center italic">No action items identified.</p>
                </div>
              )}
            </div>
          </div>

          {/* Minutes of Meeting Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-blue-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-lg font-medium text-white">Minutes of Meeting</h3>
            </div>
            <div className="px-6 py-5 h-72 overflow-y-auto">
              {mom ? (
                <div className="prose prose-blue max-w-none text-gray-700">
                  <ReactMarkdown>{mom}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-center italic">No minutes available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 px-4 sm:px-0 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button 
            className="px-8 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-blue-200 shadow-sm flex items-center justify-center"
            onClick={handleBackToHome}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          {meetingData && (
            <button 
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md flex items-center justify-center"
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
          <AskAIButton />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;