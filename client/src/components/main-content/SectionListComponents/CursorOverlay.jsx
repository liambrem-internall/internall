import { CursorArrowMoveOutline24 } from "metau-meta-icons";

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
          <CursorArrowMoveOutline24 />
        </svg>
      </div>
    ))}
  </>
);
export default CursorOverlay;
