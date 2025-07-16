import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Save, X, Play, Pause, Scissors
} from "lucide-react";
import "./VideoEditor.css";

/**
 * VideoEditor Component
 * A full-featured video editing interface that allows users to:
 * - Preview video content on a canvas
 * - Play/pause video playback
 * - Trim video by setting start and end times
 * - Navigate through video timeline
 * - Export edited video data
 */
export default function VideoEditor({ videoUrl, onSave, onCancel }) {
  // Refs for direct DOM manipulation
  const videoRef = useRef(null);    // Reference to the hidden video element
  const canvasRef = useRef(null);   // Reference to the canvas for video preview

  // State management for video playback and editing
  const [isPlaying, setIsPlaying] = useState(false);      // Controls play/pause state
  const [currentTime, setCurrentTime] = useState(0);      // Current playback position in seconds
  const [duration, setDuration] = useState(0);            // Total video duration in seconds
  const [trimStart, setTrimStart] = useState(0);          // Start time for trimming (in seconds)
  const [trimEnd, setTrimEnd] = useState(0);              // End time for trimming (in seconds)

  /**
   * Handles video metadata loading event
   * Sets up initial video duration and canvas dimensions
   * Called when video metadata is fully loaded
   */
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    setDuration(video.duration);
    setTrimEnd(video.duration);  // Initially set trim end to full duration
    setupCanvas();
  }, []);

  /**
   * Handles video time update event
   * Updates current time state and redraws video frame on canvas
   * Called continuously during video playback
   */
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    setCurrentTime(video.currentTime);
    drawVideoFrame();
  }, []);

  /**
   * Sets up event listeners for video element
   * Handles component mounting and cleanup
   */
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      
      // Cleanup event listeners on component unmount
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [handleLoadedMetadata, handleTimeUpdate]);

  /**
   * Configures canvas dimensions based on video dimensions
   * Called after video metadata is loaded
   */
  const setupCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth || 640;   // Fallback to 640 if no video width
      canvas.height = video.videoHeight || 480; // Fallback to 480 if no video height
    }
  };

  /**
   * Draws the current video frame onto the canvas
   * Provides visual preview of the video during playback
   */
  const drawVideoFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Only draw if video is playing and elements exist
    if (video && canvas && !video.paused) {
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  };

  /**
   * Toggles video playback between play and pause states
   * Updates UI state accordingly
   */
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Seeks video to specific time position
   * Updates both video current time and state
   */
  const seekTo = (time) => {
    const video = videoRef.current;
    video.currentTime = time;
    setCurrentTime(time);
  };

  /**
   * Exports the edited video data
   * Prepares trim data and calls parent callback
   */
  const exportVideo = () => {
    // Package edit data for parent component
    const editData = {
      type: 'video',
      trimStart,
      trimEnd,
      originalUrl: videoUrl,
      duration: trimEnd - trimStart
    };
    onSave(editData);
  };

  /**
   * Formats time in seconds to MM:SS format
   * Used for displaying readable time values
   */
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Sets trim start time to current playback position
   * Allows precise trimming by playing to desired position
   */
  const setTrimStartToCurrent = () => {
    setTrimStart(currentTime);
  };

  /**
   * Sets trim end time to current playback position
   * Allows precise trimming by playing to desired position
   */
  const setTrimEndToCurrent = () => {
    setTrimEnd(currentTime);
  };

  return (
    <div className="video-editor">
      {/* Editor Header - Title and Action Buttons */}
      <div className="editor-header">
        <h3>Video Editor - Trim Video</h3>
        <div className="editor-actions">
          {/* Save button - exports edited video */}
          <button onClick={exportVideo}>
            <Save size={20} /> Save
          </button>
          {/* Cancel button - closes editor without saving */}
          <button onClick={onCancel}>
            <X size={20} /> Cancel
          </button>
        </div>
      </div>

      {/* Main Editor Content */}
      <div className="editor-content">
        {/* Left Sidebar - Editing Controls */}
        <div className="editor-sidebar">
          {/* Trim Controls Section */}
          <div className="trim-section">
            <h4><Scissors size={20} /> Trim Video</h4>
            <div className="trim-controls">
              {/* Start Time Control Group */}
              <div className="trim-control-group">
                <label>Start Time: {formatTime(trimStart)}</label>
                {/* Range slider for setting start time */}
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={trimStart}
                  onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                />
                {/* Button to set start time to current playback position */}
                <button 
                  onClick={setTrimStartToCurrent}
                  className="set-current-btn"
                >
                  Set to Current Time
                </button>
              </div>
              
              {/* End Time Control Group */}
              <div className="trim-control-group">
                <label>End Time: {formatTime(trimEnd)}</label>
                {/* Range slider for setting end time */}
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                />
                {/* Button to set end time to current playback position */}
                <button 
                  onClick={setTrimEndToCurrent}
                  className="set-current-btn"
                >
                  Set to Current Time
                </button>
              </div>
            </div>
            
            {/* Trim Information Display */}
            <div className="trim-info">
              <p>Original Duration: {formatTime(duration)}</p>
              <p>Trimmed Duration: {formatTime(trimEnd - trimStart)}</p>
            </div>
          </div>
        </div>

        {/* Right Side - Video Preview and Controls */}
        <div className="editor-video-container">
          {/* Video Preview Area */}
          <div className="video-preview">
            {/* Hidden video element for loading and playback control */}
            <video
              ref={videoRef}
              src={videoUrl}
              style={{ display: 'none' }}  // Hidden - we use canvas for display
              crossOrigin="anonymous"       // Allow cross-origin video loading
            />
            {/* Canvas for displaying video frames */}
            <canvas
              ref={canvasRef}
              className="video-canvas"
            />
          </div>
          
          {/* Video Playback Controls */}
          <div className="video-controls">
            {/* Play/Pause Button */}
            <button onClick={togglePlay} className="play-btn">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            {/* Timeline Scrubber */}
            <div className="timeline">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="timeline-slider"
              />
            </div>
            
            {/* Time Display */}
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}