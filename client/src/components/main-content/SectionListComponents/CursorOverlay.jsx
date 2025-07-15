import { BsCursor } from "react-icons/bs";

const CursorOverlay = ({ cursors }) => (
  <>
    {Object.entries(cursors).map(([uid, { color, x, y }]) => (
      <div
        key={uid}
        style={{
          position: "fixed",
          left: x,
          top: y,
          pointerEvents: "none",
          zIndex: 9999,
          color,
          fontWeight: "bold",
          transition: "left 0.05s, top 0.05s",
        }}
      >
        <svg width="24" height="24">
          <BsCursor />
        </svg>
      </div>
    ))}
  </>
);
export default CursorOverlay;
