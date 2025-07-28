import { BsCursor } from "react-icons/bs";
import "./CursorOverlay.css";
const MAX_NAME_LENGTH = 8;

const CursorOverlay = ({ cursors, isOnline }) => {
  return (
    <div className="cursor-overlay">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className={`remote-cursor ${!isOnline ? 'offline' : ''}`}
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
            {cursor.nickname?.length > MAX_NAME_LENGTH 
              ? cursor.nickname.slice(0, MAX_NAME_LENGTH) + '...' 
              : cursor.nickname
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorOverlay;
