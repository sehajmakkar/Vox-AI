// src/utils/recordingUtils.js

/**
 * Creates a MediaRecorder instance from a stream
 * @param {MediaStream} stream - The audio stream to record
 * @param {Function} onDataAvailable - Callback when data is available
 * @returns {MediaRecorder} The MediaRecorder instance
 */
export const createAudioRecorder = (stream, onDataAvailable) => {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm', // Most widely supported format
  });
  
  mediaRecorder.ondataavailable = onDataAvailable;
  
  return mediaRecorder;
};

/**
 * Extracts audio tracks from a stream
 * @param {MediaStream} stream - The original stream with audio and video
 * @returns {MediaStream} A new stream with only audio tracks
 */
export const extractAudioStream = (stream) => {
  if (!stream) return null;
  
  const audioStream = new MediaStream();
  const audioTracks = stream.getAudioTracks();
  
  if (audioTracks.length === 0) {
    console.warn("No audio tracks found in the stream");
    return null;
  }
  
  audioTracks.forEach(track => {
    audioStream.addTrack(track);
  });
  
  return audioStream;
};

/**
 * Creates a downloadable file from a Blob
 * @param {Blob} blob - The audio blob to save
 * @param {string} filename - The name for the downloaded file
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
};

/**
 * Format seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTimeMMSS = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

/**
 * Safely get a MediaStream from ZegoCloud
 * @param {Object} zp - ZegoCloud instance reference
 * @returns {MediaStream|null} The media stream or null if not available
 */
export const getZegoAudioStream = (zp) => {
  try {
    if (!zp || !zp.getLocalStream) {
      console.error("ZegoCloud instance not properly initialized");
      return null;
    }
    
    const zegoStream = zp.getLocalStream();
    if (!zegoStream) {
      console.error("Failed to get local stream from ZegoCloud");
      return null;
    }
    
    return extractAudioStream(zegoStream);
  } catch (error) {
    console.error("Error getting audio stream:", error);
    return null;
  }
};