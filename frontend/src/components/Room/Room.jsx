import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from 'axios';

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
  const timerRef = React.useRef(null);
  const audioContextRef = React.useRef(null);

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
      },
      onLeaveRoom: () => {
        navigate("/");
      },
    });
  };

  const handleExit = () => {
    if (isRecording) {
      stopRecording();
    }
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
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      
      // Save the recording when stopped
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { 
          type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' 
        });
        saveRecording(audioBlob);
      };
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  // Save the recorded audio file
  const saveRecording = (audioBlob) => {
    // Create a download link for the audio
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const fileExtension = MediaRecorder.isTypeSupported('audio/webm') ? 'webm' : 'mp4';
    a.download = `conference-${roomId}-${new Date().toISOString()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Format the recording time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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
        <div className="recording-controls" style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "8px",
          color: "white",
          display: "flex",
          alignItems: "center"
        }}>
          {isRecording ? (
            <div className="recording-status" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "red" }}>●</span>
              <span>Recording: {formatTime(recordingTime)}</span>
              <button 
                onClick={stopRecording}
                style={{
                  backgroundColor: "#d9534f",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px"
                }}
              >
                Stop Recording
              </button>
            </div>
          ) : (
            <button 
              onClick={startRecording}
              style={{
                backgroundColor: "#5cb85c",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Start Recording
            </button>
          )}
        </div>
      )}
      <div
        ref={videoContainer}
        style={{ width: "100%", height: "100vh" }}
      ></div>
    </div> 
  );
};

export default Room;