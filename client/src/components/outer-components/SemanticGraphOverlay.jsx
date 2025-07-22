import React from "react";
import SemanticGraphView from "./SemanticGraphView";
import "./SemanticGraphOverlay.css";

const SemanticGraphOverlay = ({ isVisible, onClose, roomId }) => {
  if (!isVisible) return null;

  return (
    <div className="semantic-graph-overlay">
      <div className="semantic-graph-header">
        <h2 className="semantic-graph-title">Semantic Graph</h2>
        <button onClick={onClose} className="semantic-graph-close-btn">
          Close
        </button>
      </div>
      <div className="semantic-graph-content">
        <SemanticGraphView roomId={roomId} />
      </div>
    </div>
  );
};

export default SemanticGraphOverlay;
