import React from "react";
import { BsCursor } from "react-icons/bs";
import "./CursorOverlay.css";

const CursorOverlay = ({ cursors }) => {
  return (
    <div className="cursor-overlay">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="remote-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          <BsCursor className="cursor" color={cursor.color}/>
          <div 
            className="cursor-nametag" 
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.nickname}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorOverlay;
