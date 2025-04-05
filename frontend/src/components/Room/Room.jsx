import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from 'axios';
import "./Room.css";

const Room = () => {
  const { roomId } = useParams();
  const videoContainer = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const zpRef = React.useRef(null);
  const [isJoined, setIsJoined] = React.useState(false);
  const [callType, setCallType] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState(null);
  const [audioChunks, setAudioChunks] = React.useState([]);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [transcriptions, setTranscriptions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showTranscripts, setShowTranscripts] = React.useState(false);
  const timerRef = React.useRef(null);
  const BACKEND_URL = "http://localhost:5000";

  const myMeeting = (type) => {
    const appID = 842387227;
    const serverSecret = "4ba871ceecb9cc377708f9f0382534a8";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      Date.now().toString(),
      "YOUR NAME"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    zp.joinRoom({
      container: videoContainer.current,
      sharedLinks: [
        {
          name: "Video Call link",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?type=" +
            encodeURIComponent(type),
        },
      ],
      scenario: {
        mode:
          type === "one-on-one"
            ? ZegoUIKitPrebuilt.OneONoneCall
            : ZegoUIKitPrebuilt.GroupCall,
      },
      maxUsers: type === "one-on-one" ? 2 : 20,
      onJoinRoom: () => {
        setIsJoined(true);
        // Create meeting in backend when joining room
        createMeeting();
        // Fetch existing transcriptions
        fetchTranscriptions();
      },
      onLeaveRoom: () => {
        navigate("/");
      },
    });
  };

  // Create a meeting entry in the backend
  const createMeeting = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/meetings`, {
        roomId: roomId,
        title: `Meeting ${roomId}`
      });
      console.log("Meeting created:", response.data);
    } catch (error) {
      // If meeting exists, this will fail but that's fine
      console.log("Meeting may already exist:", error.response?.data);
    }
  };

  // End the meeting in the backend
  const endMeeting = async () => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/meetings/${roomId}/end`);
      console.log("Meeting ended:", response.data);
    } catch (error) {
      console.error("Error ending meeting:", error);
    }
  };

  // Fetch transcriptions for this meeting
  const fetchTranscriptions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/transcripts/meeting/${roomId}`);
      setTranscriptions(response.data.data);
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
    }
  };

  const handleExit = async () => {
    if (isRecording) {
      await stopRecording();
    }
    
    // End the meeting
    await endMeeting();
    
    if (zpRef.current) {
      zpRef.current.destroy();
    }
    navigate("/");
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      // Use the browser's getUserMedia API to get audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a MediaRecorder instance
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      // Clear previous audio chunks
      setAudioChunks([]);
      
      // Set up data collection
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };
      
      // Start the recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start timer for recording duration
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording: " + error.message);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // Process the recording when stopped
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { 
            type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' 
          });
          uploadForTranscription(audioBlob);
          resolve();
        };
        
        // Clear the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsRecording(false);
        console.log("Recording stopped");
      } else {
        resolve();
      }
    });
  };

  // Upload the recorded audio for transcription
  const uploadForTranscription = async (audioBlob) => {
    try {
      setIsLoading(true);
      
      // Create form data
      const formData = new FormData();
      const fileExtension = MediaRecorder.isTypeSupported('audio/webm') ? 'webm' : 'mp4';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `conference-${roomId}-${timestamp}.${fileExtension}`;

      
      // Append the audio blob as a file
      formData.append('audio', audioBlob, filename);
      // Add meeting ID to link the transcription to this meeting
      formData.append('meetingId', roomId);
      
      // Send to backend
      const response = await axios.post(
        `${BACKEND_URL}/api/transcripts/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log("Transcription result:", response.data);
      
      // Refresh transcriptions list
      await fetchTranscriptions();
      setIsLoading(false);
      
      // Show success message
      alert("Audio transcribed successfully!");
      
    } catch (error) {
      console.error("Error transcribing audio:", error.response?.data || error.message);
      setIsLoading(false);
      alert(`Transcription failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Format the recording time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Format timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  React.useEffect(() => {
    const query = new URLSearchParams(location.search);
    const type = query.get("type");
    setCallType(type);
  }, [location.search]);

  React.useEffect(() => {
    if (callType) {
      myMeeting(callType);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [callType, roomId, navigate]);

  return (
    <div>
      {!isJoined && (
        <>
          <header>
            {callType === "one-on-one" ? "One on One Call" : "Group Call"}
          </header>
          <button onClick={handleExit}>Exit</button>
        </>
      )}
      
      {isJoined && (
        <>
          <div className="control-panel" style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div className="recording-controls">
              {isRecording ? (
                <div className="recording-status">
                  <span className="recording-indicator">●</span>
                  <span>Recording: {formatTime(recordingTime)}</span>
                  <button 
                    onClick={stopRecording}
                    className="stop-recording-btn"
                    disabled={isLoading}
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <button 
                  onClick={startRecording}
                  className="start-recording-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Start Recording"}
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowTranscripts(!showTranscripts)}
              style={{
                backgroundColor: "#0275d8",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {showTranscripts ? "Hide Transcripts" : "Show Transcripts"}
            </button>
            
            <button 
              onClick={handleExit}
              style={{
                backgroundColor: "#d9534f",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              End Meeting
            </button>
          </div>
          
          {showTranscripts && (
            <div className="transcripts-panel" style={{
              position: "fixed",
              bottom: "10px",
              left: "10px",
              right: "10px",
              maxHeight: "30vh",
              overflowY: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              zIndex: 1000,
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)"
            }}>
              <h3>Meeting Transcripts</h3>
              {transcriptions.length === 0 ? (
                <p>No transcriptions available yet. Record audio to generate transcripts.</p>
              ) : (
                <div>
                  {transcriptions.map((transcript, index) => (
                    <div key={transcript._id || index} style={{
                      marginBottom: "15px",
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}>
                      <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
                        Recorded at: {formatDate(transcript.createdAt)}
                      </p>
                      <p style={{ margin: "0 0 5px 0" }}>
                        Duration: {formatTime(Math.floor(transcript.duration))}
                      </p>
                      <p style={{ margin: "0", whiteSpace: "pre-wrap" }}>
                        {transcript.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      <div
        ref={videoContainer}
        style={{ width: "100%", height: "100vh" }}
      ></div>
    </div> 
  );
};

export default Room;