import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Save,
  X,
  Type,
  Square,
  Circle,
  Sliders,
  Undo,
  Redo,
  Move,
  Trash2,
} from "lucide-react";
import "./PhotoEditor.css";

/* --------------------------------------------------------
 * PhotoEditor
 * ------------------------------------------------------ */
export default function PhotoEditor({ imageUrl, onSave, onCancel }) {
  /* ----- refs & state ----- */
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [tool, setTool] = useState("move");
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
  });

  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* drag state */
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });

  /* ---------------- drawing helpers ---------------- */
  const drawLayer = (ctx, layer) => {
    ctx.save();
    switch (layer.type) {
      case "text":
        ctx.font = `${layer.fontSize || 32}px ${layer.fontFamily || "Arial"}`;
        ctx.fillStyle = layer.color || "#000000";
        ctx.textAlign = layer.textAlign || "left";
        ctx.textBaseline = "top";
        ctx.fillText(layer.text, layer.x, layer.y);
        break;

      case "rectangle":
        ctx.fillStyle = layer.fillColor || "#ff0000";
        ctx.strokeStyle = layer.strokeColor || "#000000";
        ctx.lineWidth = layer.strokeWidth || 2;
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        if (layer.strokeWidth > 0) {
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
        }
        break;

      case "circle":
        ctx.fillStyle = layer.fillColor || "#ff0000";
        ctx.strokeStyle = layer.strokeColor || "#000000";
        ctx.lineWidth = layer.strokeWidth || 2;
        ctx.beginPath();
        ctx.arc(layer.x, layer.y, layer.radius, 0, Math.PI * 2);
        ctx.fill();
        if (layer.strokeWidth > 0) {
          ctx.stroke();
        }
        break;

      default:
        break;
    }
    ctx.restore();
  };

  /* ---------------- canvas redraw ---------------- */
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters to image
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      sepia(${filters.sepia}%)
      grayscale(${filters.grayscale}%)
    `;

    // Draw the base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Reset filter for layers
    ctx.filter = "none";
    
    // Draw all layers
    layers.forEach((layer) => drawLayer(ctx, layer));

    // Draw selection indicator
    if (selectedLayer) {
      ctx.save();
      ctx.strokeStyle = "#ff7a00";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      switch (selectedLayer.type) {
        case "text":
          ctx.font = `${selectedLayer.fontSize || 32}px ${selectedLayer.fontFamily || "Arial"}`;
          const textMetrics = ctx.measureText(selectedLayer.text);
          const textWidth = textMetrics.width;
          const textHeight = selectedLayer.fontSize || 32;
          ctx.strokeRect(selectedLayer.x - 2, selectedLayer.y - 2, textWidth + 4, textHeight + 4);
          break;
        case "rectangle":
          ctx.strokeRect(selectedLayer.x - 2, selectedLayer.y - 2, selectedLayer.width + 4, selectedLayer.height + 4);
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(selectedLayer.x, selectedLayer.y, selectedLayer.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
          break;
        default:
          // No selection indicator for unknown layer types
          break;
      }
      ctx.restore();
    }
  }, [filters, layers, selectedLayer]);

  /* ---------------- history helpers ---------------- */
  const saveToHistory = useCallback(() => {
    const snapshot = { layers: JSON.parse(JSON.stringify(layers)), filters: { ...filters } };
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, snapshot];
    });
    setHistoryIndex((idx) => idx + 1);
  }, [layers, filters, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setLayers(prev.layers);
      setFilters(prev.filters);
      setHistoryIndex(historyIndex - 1);
      setSelectedLayer(null);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setLayers(next.layers);
      setFilters(next.filters);
      setHistoryIndex(historyIndex + 1);
      setSelectedLayer(null);
    }
  };

  /* ---------------- canvas initialization ---------------- */
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      
      /* resize to fit max 800×600 */
      const MAX_W = 800;
      const MAX_H = 600;
      let { width, height } = img;

      if (width > MAX_W) {
        height = (height * MAX_W) / width;
        width = MAX_W;
      }
      if (height > MAX_H) {
        width = (width * MAX_H) / height;
        height = MAX_H;
      }

      canvas.width = width;
      canvas.height = height;

      // Initialize history only once
      if (history.length === 0) {
        const initialSnapshot = { layers: [], filters: { ...filters } };
        setHistory([initialSnapshot]);
        setHistoryIndex(0);
      }
      
      redrawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl, filters, history.length, redrawCanvas]);

  /* re-render when layers/filters change */
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  /* initialize on mount / image change */
  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  /* ---------------- layer creation ---------------- */
  const addTextLayer = () => {
    if (!textInput.trim()) return;
    const newLayer = {
      id: Date.now(),
      type: "text",
      text: textInput,
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: "Arial",
      color: "#000000",
      textAlign: "left"
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayer(newLayer);
    setTextInput("");
    setShowTextInput(false);
    setTimeout(saveToHistory, 0);
  };

  const addShapeLayer = (shapeType) => {
    const base = {
      id: Date.now(),
      type: shapeType,
      x: 100,
      y: 100,
      fillColor: "#ff0000",
      strokeColor: "#000000",
      strokeWidth: 2,
    };
    const newLayer =
      shapeType === "rectangle"
        ? { ...base, width: 100, height: 60 }
        : { ...base, radius: 50 };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayer(newLayer);
    setTimeout(saveToHistory, 0);
  };

  const deleteLayer = (id) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayer?.id === id) setSelectedLayer(null);
    setTimeout(saveToHistory, 0);
  };

  /* ---------------- coordinate helpers ---------------- */
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  /* ---------------- hit testing ---------------- */
  const hitTestLayer = (pos, layer) => {
    switch (layer.type) {
      case "text": {
        const canvas = canvasRef.current;
        if (!canvas) return false;
        const ctx = canvas.getContext("2d");
        ctx.font = `${layer.fontSize || 32}px ${layer.fontFamily || "Arial"}`;
        const metrics = ctx.measureText(layer.text);
        const width = metrics.width;
        const height = layer.fontSize || 32;
        
        return pos.x >= layer.x && 
               pos.x <= layer.x + width && 
               pos.y >= layer.y && 
               pos.y <= layer.y + height;
      }
      case "rectangle":
        return pos.x >= layer.x && 
               pos.x <= layer.x + layer.width && 
               pos.y >= layer.y && 
               pos.y <= layer.y + layer.height;
      case "circle": {
        const dx = pos.x - layer.x;
        const dy = pos.y - layer.y;
        return (dx * dx + dy * dy) <= (layer.radius * layer.radius);
      }
      default:
        return false;
    }
  };

  const findHitLayer = useCallback((pos) => {
    // Check from top to bottom (reverse order)
    for (let i = layers.length - 1; i >= 0; i--) {
      if (hitTestLayer(pos, layers[i])) {
        return layers[i];
      }
    }
    return null;
  }, [layers]);

  /* ---------------- mouse events ---------------- */
  const handleMouseDown = useCallback((e) => {
    if (tool !== "move") return;
    
    const pos = getCanvasCoordinates(e);
    const hitLayer = findHitLayer(pos);
    
    if (hitLayer) {
      setSelectedLayer(hitLayer);
      setIsDragging(true);
      setDragOffset({
        dx: pos.x - hitLayer.x,
        dy: pos.y - hitLayer.y
      });
    } else {
      setSelectedLayer(null);
    }
  }, [tool, findHitLayer]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedLayer) return;
    
    e.preventDefault();
    const pos = getCanvasCoordinates(e);
    
    setLayers(prev => prev.map(layer => 
      layer.id === selectedLayer.id
        ? { ...layer, x: pos.x - dragOffset.dx, y: pos.y - dragOffset.dy }
        : layer
    ));
  }, [isDragging, selectedLayer, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(saveToHistory, 0);
    }
  }, [isDragging, saveToHistory]);

  /* ---------------- event listeners ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  /* Debounced save to history for filters */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToHistory();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters, saveToHistory]);

  /* ---------------- filter change handler ---------------- */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: parseInt(value) }));
  };

  /* ---------------- export ---------------- */
  const saveEdit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob(
      (blob) => {
        if (onSave) {
          onSave({
            blob,
            layers,
            filters,
            originalUrl: imageUrl,
          });
        }
      },
      "image/png"
    );
  };

  /* ======================================================
   * UI
   * ==================================================== */
  return (
    <div className="photo-editor">
      {/* ---------- header ---------- */}
      <div className="editor-header">
        <h3>Photo Editor</h3>
        <div className="editor-actions">
          <button onClick={undo} disabled={historyIndex <= 0}>
            <Undo size={18} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo size={18} />
          </button>
          <button onClick={saveEdit}>
            <Save size={18} /> Save
          </button>
          <button onClick={onCancel}>
            <X size={18} /> Cancel
          </button>
        </div>
      </div>

      {/* ---------- body ---------- */}
      <div className="editor-content">
        {/* ===== sidebar ===== */}
        <div className="editor-sidebar">
          {/* tools */}
          <section className="tool-section">
            <h4>Tools</h4>
            <div className="tool-buttons">
              <button
                className={`tool-btn ${tool === "move" ? "active" : ""}`}
                onClick={() => setTool("move")}
              >
                <Move size={18} /> Move
              </button>
              <button className="tool-btn" onClick={() => setShowTextInput(true)}>
                <Type size={18} /> Text
              </button>
              <button className="tool-btn" onClick={() => addShapeLayer("rectangle")}>
                <Square size={18} /> Rectangle
              </button>
              <button className="tool-btn" onClick={() => addShapeLayer("circle")}>
                <Circle size={18} /> Circle
              </button>
              <button
                className="tool-btn"
                onClick={() => setShowFilters((f) => !f)}
              >
                <Sliders size={18} /> Filters
              </button>
            </div>
          </section>

          {/* add text */}
          {showTextInput && (
            <section className="text-input-section">
              <h4>Add Text</h4>
              <input
                className="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text"
                onKeyPress={(e) => e.key === 'Enter' && addTextLayer()}
                autoFocus
              />
              <div className="text-actions">
                <button onClick={addTextLayer} disabled={!textInput.trim()}>Add</button>
                <button onClick={() => setShowTextInput(false)}>Cancel</button>
              </div>
            </section>
          )}

          {/* filters */}
          {showFilters && (
            <section className="filters-section">
              <h4>Filters</h4>
              {Object.entries(filters).map(([name, val]) => (
                <div key={name} className="filter-control">
                  <label>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                  <input
                    className="filter-slider"
                    type="range"
                    min={name === "blur" ? 0 : 0}
                    max={name === "blur" ? 10 : 200}
                    value={val}
                    onChange={(e) => handleFilterChange(name, e.target.value)}
                  />
                  <span>{val + (name === "blur" ? "px" : "%")}</span>
                </div>
              ))}
            </section>
          )}

          {/* layers list */}
          <section className="layers-section">
            <h4>Layers</h4>
            <div className="layers-list">
              {layers.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                  No layers yet. Add text or shapes to get started.
                </p>
              ) : (
                layers.map((l) => (
                  <div
                    key={l.id}
                    className={`layer-item ${selectedLayer?.id === l.id ? "selected" : ""}`}
                    onClick={() => setSelectedLayer(l)}
                  >
                    <span>
                      {l.type === "text" ? `"${l.text.substring(0, 20)}${l.text.length > 20 ? '...' : ''}"` : l.type}
                    </span>
                    <button
                      className="delete-layer-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(l.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ===== canvas ===== */}
        <div className="editor-canvas-container">
          <canvas 
            ref={canvasRef} 
            className="editor-canvas"
            style={{ cursor: tool === "move" ? "move" : "default" }}
          />
        </div>
      </div>
    </div>
  );
}