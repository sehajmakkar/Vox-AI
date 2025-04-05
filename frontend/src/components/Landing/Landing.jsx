import React, { useState, useEffect } from 'react';
import { Mic, Video, Users, MessageSquare, PieChart } from 'lucide-react';
import Navbar from '../Navbar'; // Import the Navbar component
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const VoxAiLandingPage = () => {
  // State to manage the typing effect
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  

  
  const headingTexts = [
    "Say Goodbye to What did we decide again?",
    "No more meetings DEJA VU!",
    "Connect the dots between every discussion!"
  ];

  // Typing effect for the heading
  useEffect(() => {
    const typingSpeed = isDeleting ? 30 : 70; // Faster when deleting
    const delayBetweenTexts = 2000; // Pause between phrases
    
    // Current text being typed
    const currentText = headingTexts[textIndex];
    
    // If we're done with current text, pause before deleting
    if (!isDeleting && displayText === currentText) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenTexts);
      return () => clearTimeout(timeout);
    }
    
    // If we've deleted the text, move to next text
    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setTextIndex((prevIndex) => (prevIndex + 1) % headingTexts.length);
      return;
    }
    
    // Handle typing and deleting
    const timeout = setTimeout(() => {
      setDisplayText(prev => {
        if (isDeleting) {
          return prev.substring(0, prev.length - 1);
        } else {
          return currentText.substring(0, prev.length + 1);
        }
      });
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Include the Navbar component */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto flex flex-col md:flex-row items-center justify-between pt-32 pb-16 px-6">
        {/* Left Content */}
        <div className="max-w-xl">
          <div className="bg-blue-100/50 text-blue-600 px-4 py-1 rounded-full inline-block mb-4">
            AI-Powered Meeting Assistant
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            <span className="text-blue-600  typing-text h-24 block">
              {displayText}
              <span className="cursor">|</span>
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/join')} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full flex items-center cursor-pointer justify-center transition-colors shadow-lg">
              Join Meeting
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            <button onClick={() => navigate('/past-meetings')} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer py-3 px-8 rounded-full flex items-center justify-center transition-colors shadow-md">
              Past Meetings
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {/* Key Features */}
          <div className="mt-16 grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Real-time Transcription</h3>
                <p className="text-sm text-gray-600">Accurate speech-to-text for all participants</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Smart Summaries</h3>
                <p className="text-sm text-gray-600">AI-generated meeting recaps with action items</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Team Collaboration</h3>
                <p className="text-sm text-gray-600">Seamless WebRTC video and audio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <PieChart size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Contextual Insights</h3>
                <p className="text-sm text-gray-600">RAG-powered information retrieval</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Animated Meeting Assistant Component (MADE BIGGER) */}
        <div className="w-full md:w-3/5 flex justify-center items-center mt-16 md:mt-0">
          <div className="relative w-full max-w-lg h-112">
            {/* Main Meeting UI Frame */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-blue-100 transform hover:scale-105 transition-transform duration-500">
              <div className="bg-blue-600 rounded-xl h-12 flex items-center px-4 text-white font-medium">
                VOX AI Meeting Assistant
              </div>
              
              {/* Meeting Content */}
              <div className="mt-4 flex flex-col h-[calc(100%-4rem)]">
                {/* Participant Video Grid */}
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center" 
                         style={{animation: `pulse ${1 + i * 0.5}s infinite alternate ease-in-out`}}>
                      <Users className="text-gray-400" size={24} />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                        User {i}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Transcription Area - Animated typing effect */}
                <div className="mt-3 bg-blue-50 rounded-xl p-3 h-24 overflow-hidden relative">
                  <div className="text-xs font-medium text-blue-600 mb-1">Live Transcription</div>
                  <div className="typewriter-text text-sm text-gray-700">
                    "I think we should focus on implementing the speech-to-text pipeline first, then integrate the RAG system for contextual insights..."
                  </div>
                  
                  {/* AI Insight */}
                  <div className="absolute bottom-3 right-3 bg-blue-100 text-blue-800 text-xs p-2 rounded-lg max-w-[60%] transform translate-y-0 hover:translate-y-1 transition-transform">
                    <div className="font-medium">VOX AI Insight:</div>
                    <div>Similar project timeline discussed in last week's meeting.</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-400/80 rounded-xl transform rotate-12 animate-float-slow"></div>
            <div className="absolute -right-12 top-1/4 w-16 h-16 bg-blue-300/70 rounded-xl transform -rotate-12 animate-float-medium"></div>
            <div className="absolute -left-8 top-10 w-14 h-14 bg-blue-200/60 rounded-xl transform rotate-45 animate-float-fast"></div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full z-[-1]" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,100 Q200,50 350,100" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="2" fill="none" />
              <path d="M50,200 Q200,150 350,200" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="2" fill="none" />
              <path d="M50,300 Q200,250 350,300" stroke="rgba(37, 99, 235, 0.1)" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </main>
      
      {/* Down Arrow */}
      <div className="flex justify-center mb-8">
        <svg className="w-8 h-8 text-blue-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(12deg); }
          100% { transform: translateY(-15px) rotate(12deg); }
        }
        
        @keyframes float-medium {
          0% { transform: translateY(0px) rotate(-12deg); }
          100% { transform: translateY(-10px) rotate(-12deg); }
        }
        
        @keyframes float-fast {
          0% { transform: translateY(0px) rotate(45deg); }
          100% { transform: translateY(-8px) rotate(45deg); }
        }
        
        .animate-float-slow {
          animation: float-slow 3s infinite alternate ease-in-out;
        }
        
        .animate-float-medium {
          animation: float-medium 2.5s infinite alternate ease-in-out;
        }
        
        .animate-float-fast {
          animation: float-fast 2s infinite alternate ease-in-out;
        }
        
        .typewriter-text {
          position: relative;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          animation: typing 8s steps(80) infinite;
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
          90%, 100% { width: 100%; }
        }
        
        .typing-text {
          display: inline-block;
        }
        
        .cursor {
          display: inline-block;
          animation: blink-caret 0.75s step-end infinite;
        }
        
        @keyframes blink-caret {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .h-112 {
          height: 28rem;
        }
      `}</style>
    </div>
  );
};

export default VoxAiLandingPage;