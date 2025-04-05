import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

const MyMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/meetings`);
        setMeetings(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError("Failed to load meetings. Please try again later.");
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleViewDashboard = (roomId) => {
    navigate(`/dashboard/${roomId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return "Ongoing";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = Math.round((end - start) / 60000);
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-blue-700">Loading your meetings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Error</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button 
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white pb-16">
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-800">My Meetings</h1>
          </div>
          <button 
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md flex items-center"
            onClick={() => navigate('/join')}
          >
            <span>Join New Meeting</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-3">No meetings yet</h2>
            <p className="text-blue-600 max-w-md mb-8">Start or join a meeting to see it listed here. Your meeting history will be displayed on this page.</p>
            <button 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
              onClick={() => navigate('/join')}
            >
              Join a Meeting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div 
                key={meeting._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white truncate">{meeting.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    meeting.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {meeting.status === 'completed' ? 'Completed' : 'Ongoing'}
                  </span>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                      <span>{formatDate(meeting.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-3 text-blue-500" />
                      <span>{formatTime(meeting.startTime)} • {calculateDuration(meeting.startTime, meeting.endTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-3 text-blue-500" />
                      <span>{meeting.participants.length || 'No'} participants</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewDashboard(meeting.roomId)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                    >
                      View Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyMeetings;