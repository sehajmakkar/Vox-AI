import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Users, RefreshCw, ArrowRight } from "lucide-react";
import Navbar from "../Navbar"; 

const HomePage = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const generate = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setRoomId(randomId);
  };

  const handleOneOnOne = () => {
    if (!roomId) {
      alert("Please generate a room ID first.");
      return;
    }
    navigate(`/room/${roomId}?type=one-on-one`);
  };

  const handleGroup = () => {
    if (!roomId) {
      alert("Please generate a room ID first.");
      return;
    }
    navigate(`/room/${roomId}?type=group`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Fixed Navbar Component - Now properly positioned */}
      <div className="w-full fixed top-0 left-0 z-10">
        <Navbar />
      </div>

      {/* Main Content - adjusted padding and spacing */}
      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen px-6 pt-16">
        <div className="text-center mb-12 pt-12">
          <div className="bg-blue-100/50 text-blue-600 px-4 py-1 rounded-full inline-block mb-4">
            Start a New Meeting
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Connect with <span className="text-blue-600">VOX AI</span>
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Generate a unique room ID and choose your meeting type to begin. 
            Our AI will transcribe, summarize, and provide insights during your conversation.
          </p>
        </div>

        {/* Room ID Generator Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-blue-100">
          <div className="mb-8">
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
              Your Meeting Room ID
            </label>
            <div className="flex gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  readOnly
                  placeholder="Generate a unique room ID"
                  className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 text-gray-800 font-medium"
                />
                {roomId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                )}
              </div>
              <button
                onClick={generate}
                className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            {roomId && (
              <p className="text-xs text-green-600 mt-2">
                Room ID generated successfully! You can now start a meeting.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Select Meeting Type</h3>
            <button
              onClick={handleOneOnOne}
              disabled={!roomId}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all ${
                !roomId
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <Video size={20} className="mr-3" />
                <span className="font-medium">One-on-One Meeting</span>
              </div>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleGroup}
              disabled={!roomId}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all ${
                !roomId
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-md hover:shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <Users size={20} className="mr-3" />
                <span className="font-medium">Group Meeting</span>
              </div>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-gray-500 pb-12">
          <p>VOX AI will automatically join your meeting to assist with transcription and insights.</p>
        </div>

        {/* Decorative Elements - adjusted positions */}
        <div className="fixed top-1/4 right-12 w-24 h-24 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>
        <div className="fixed bottom-1/4 left-12 w-32 h-32 bg-blue-300/20 rounded-full blur-3xl -z-10"></div>
      </main>
    </div>
  );
};

export default HomePage;