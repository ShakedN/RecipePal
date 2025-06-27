import React, { useRef, useState, useEffect } from "react";
import { 
  Save, X, Play, Pause, RotateCw, Type, Sliders, 
  Download, Undo, Redo, Scissors, Volume2
} from "lucide-react";
import "./VideoEditor.css";

export default function VideoEditor({ videoUrl, onSave, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textOverlays, setTextOverlays] = useState([]);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
      // Apply filters
      ctx.filter = `
        brightness(${filters.brightness}%) 
        contrast(${filters.contrast}%) 
        saturate(${filters.saturation}%) 
        blur(${filters.blur}px) 
        sepia(${filters.sepia}%) 
        grayscale(${filters.grayscale}%)
      `;
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Reset filter for overlays
      ctx.filter = 'none';
      
      // Draw text overlays
      textOverlays.forEach(overlay => {
        if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
          ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
          ctx.fillStyle = overlay.color;
          ctx.strokeStyle = overlay.strokeColor;
          ctx.lineWidth = overlay.strokeWidth;
          ctx.textAlign = overlay.textAlign || 'left';
          
          if (overlay.strokeWidth > 0) {
            ctx.strokeText(overlay.text, overlay.x, overlay.y);
          }
          ctx.fillText(overlay.text, overlay.x, overlay.y);
        }
      });
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

  const addTextOverlay = () => {
    if (!textInput.trim()) return;
    
    const newOverlay = {
      id: Date.now(),
      text: textInput,
      x: 50,
      y: 100,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      textAlign: 'left',
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, duration) // 5 second duration
    };
    
    setTextOverlays(prev => [...prev, newOverlay]);
    setTextInput('');
    setShowTextInput(false);
  };

  const deleteTextOverlay = (overlayId) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== overlayId));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    drawVideoFrame();
  };

  const exportVideo = () => {
    // This is a simplified version - in reality, you'd need a more complex solution
    // like using FFmpeg.js or server-side processing
    const canvas = canvasRef.current;
    
    // For now, we'll export the current frame as an image
    canvas.toBlob((blob) => {
      const editData = {
        blob,
        type: 'video',
        textOverlays,
        filters,
        trimStart,
        trimEnd,
        originalUrl: videoUrl
      };
      onSave(editData);
    }, 'image/png');
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-editor">
      <div className="editor-header">
        <h3>Video Editor</h3>
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
          {/* Tools */}
          <div className="tool-section">
            <h4>Tools</h4>
            <div className="tool-buttons">
              <button 
                className="tool-btn"
                onClick={() => setShowTextInput(true)}
              >
                <Type size={20} />
                Add Text
              </button>
              <button 
                className="tool-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Sliders size={20} />
                Filters
              </button>
              <button className="tool-btn">
                <Scissors size={20} />
                Trim
              </button>
            </div>
          </div>

          {/* Text Input */}
          {showTextInput && (
            <div className="text-input-section">
              <h4>Add Text Overlay</h4>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text"
                className="text-input"
              />
              <div className="text-actions">
                <button onClick={addTextOverlay}>Add</button>
                <button onClick={() => setShowTextInput(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="filters-section">
              <h4>Video Filters</h4>
              {Object.entries(filters).map(([filterName, value]) => (
                <div key={filterName} className="filter-control">
                  <label>{filterName.charAt(0).toUpperCase() + filterName.slice(1)}</label>
                  <input
                    type="range"
                    min={filterName === 'blur' ? 0 : 0}
                    max={filterName === 'blur' ? 10 : filterName.includes('bright') || filterName.includes('contrast') || filterName.includes('saturation') ? 200 : 100}
                    value={value}
                    onChange={(e) => handleFilterChange(filterName, parseInt(e.target.value))}
                    className="filter-slider"
                  />
                  <span>{value}{filterName === 'blur' ? 'px' : '%'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Text Overlays */}
          <div className="overlays-section">
            <h4>Text Overlays</h4>
            <div className="overlays-list">
              {textOverlays.map(overlay => (
                <div key={overlay.id} className="overlay-item">
                  <span>{overlay.text}</span>
                  <small>{formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}</small>
                  <button 
                    onClick={() => deleteTextOverlay(overlay.id)}
                    className="delete-overlay-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trim Controls */}
          <div className="trim-section">
            <h4>Trim Video</h4>
            <div className="trim-controls">
              <label>Start: {formatTime(trimStart)}</label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={trimStart}
                onChange={(e) => setTrimStart(parseFloat(e.target.value))}
              />
              <label>End: {formatTime(trimEnd)}</label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={trimEnd}
                onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
              />
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