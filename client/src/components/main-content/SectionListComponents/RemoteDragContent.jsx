import useRemoteDrags from "../../../hooks/useRemoteDrags";
import { DraggableComponentTypes } from "../../../utils/constants";

const RemoteDragContent = ({ roomId, userId, sections }) => {
  const remoteDrags = useRemoteDrags(roomId, userId);

  return (
    <>
      {Object.values(remoteDrags).map((drag) => {
        let content = null;
        let isSection = false;
        if (
          drag.type === DraggableComponentTypes.SECTION &&
          sections[drag.id]
        ) {
          content = sections[drag.id].title;
          isSection = true;
        } else if (drag.type === DraggableComponentTypes.ITEM) {
          for (const section of Object.values(sections)) {
            const item = section.items.find((i) => i.id === drag.id); // find item in section
            if (item) {
              content = item.content;
              break;
            }
          }
        }
        if (!content) return null;

        const sectionPadding = isSection ? "24px 32px" : "12px 24px";
        const sectionBackground = isSection ? "var(--dark2)" : "#25242d";
        const sectionBorderRadius = isSection ? 12 : 8;
        const sectionBoxShadow = isSection
          ? "0 2px 12px rgba(0,0,0,0.14)"
          : "0 2px 8px rgba(0,0,0,0.12)";
        const sectionFontWeight = isSection ? 600 : 500;
        const sectionFontSize = isSection ? 20 : undefined;

        return (
          <div
            key={drag.userId}
            style={{
              position: "fixed",
              left: drag.x,
              top: drag.y,
              pointerEvents: "none",
              zIndex: 9999,
              opacity: 0.7,
              color: drag.color,
              fontWeight: "bold",
              transform: "translate(-50%, -50%)",
              transition: "left 0.05s, top 0.05s",
            }}
          >
            <div
              style={{
                minWidth: 150,
                padding: sectionPadding,
                background: sectionBackground,
                borderRadius: sectionBorderRadius,
                boxShadow: sectionBoxShadow,
                opacity: 0.7,
                fontWeight: sectionFontWeight,
                color: "white",
                fontSize: sectionFontSize,
                border: `4px solid ${drag.color}`,
                transform: "scale(1)",
                transition: "transform 0.1s, opacity 0.1s",
              }}
            >
              {content}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default RemoteDragContent;
