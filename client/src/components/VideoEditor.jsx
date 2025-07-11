import React, { useRef, useState, useEffect } from "react";
import { 
  Save, X, Play, Pause, Scissors
} from "lucide-react";
import "./VideoEditor.css";

export default function VideoEditor({ videoUrl, onSave, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    setDuration(video.duration);
    setTrimEnd(video.duration);
    setupCanvas();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setCurrentTime(video.currentTime);
    drawVideoFrame();
  };

  const setupCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }
  };

  const drawVideoFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video && canvas && !video.paused) {
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  };

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

  const seekTo = (time) => {
    const video = videoRef.current;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const exportVideo = () => {
    // Export the trimmed video data
    const editData = {
      type: 'video',
      trimStart,
      trimEnd,
      originalUrl: videoUrl,
      duration: trimEnd - trimStart
    };
    onSave(editData);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const setTrimStartToCurrent = () => {
    setTrimStart(currentTime);
  };

  const setTrimEndToCurrent = () => {
    setTrimEnd(currentTime);
  };

  return (
    <div className="video-editor">
      <div className="editor-header">
        <h3>Video Editor - Trim Video</h3>
        <div className="editor-actions">
          <button onClick={exportVideo}>
            <Save size={20} /> Save
          </button>
          <button onClick={onCancel}>
            <X size={20} /> Cancel
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          {/* Trim Controls */}
          <div className="trim-section">
            <h4><Scissors size={20} /> Trim Video</h4>
            <div className="trim-controls">
              <div className="trim-control-group">
                <label>Start Time: {formatTime(trimStart)}</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={trimStart}
                  onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                />
                <button 
                  onClick={setTrimStartToCurrent}
                  className="set-current-btn"
                >
                  Set to Current Time
                </button>
              </div>
              
              <div className="trim-control-group">
                <label>End Time: {formatTime(trimEnd)}</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                />
                <button 
                  onClick={setTrimEndToCurrent}
                  className="set-current-btn"
                >
                  Set to Current Time
                </button>
              </div>
            </div>
            
            <div className="trim-info">
              <p>Original Duration: {formatTime(duration)}</p>
              <p>Trimmed Duration: {formatTime(trimEnd - trimStart)}</p>
            </div>
          </div>
        </div>

        <div className="editor-video-container">
          <div className="video-preview">
            <video
              ref={videoRef}
              src={videoUrl}
              style={{ display: 'none' }}
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className="video-canvas"
            />
          </div>
          
          <div className="video-controls">
            <button onClick={togglePlay} className="play-btn">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
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
            
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}