import GhostComponent from "../Add/GhostComponent";

import { SectionActions } from "../../../utils/constants";
import { findItemBySection } from "../../../utils/sectionListUtils";



const DragOverlayContent = ({sections, activeId, isDeleteZoneOver}) => {
  if (activeId === SectionActions.ADD) {
    return <GhostComponent id="new-component-preview" text="New Component" />;
  }
  // for items
  for (const section of Object.values(sections)) {
    let item = findItemBySection(section, { activeId });

    if (item) {
      return (
        <div
          style={{
            padding: "12px 24px",
            background: "#25242d",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            opacity: isDeleteZoneOver ? 0.5 : 1,
            fontWeight: 500,
            color: "white",
            border: "4px solid #1f1f1f",
            transform: isDeleteZoneOver ? "scale(0.75)" : "scale(1)",
            transition: "transform 0.1s, opacity 0.1s",
          }}
        >
          {item.content}
        </div>
      );
    }
  }

  // for sections
  const section = sections[activeId];
  if (section) {
    return (
      <div
        style={{
          minWidth: 200,
          padding: "24px 32px",
          background: "var(--dark2)",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.14)",
          opacity: isDeleteZoneOver ? 0.5 : 1,
          fontWeight: 600,
          color: "white",
          fontSize: 20,
          transform: isDeleteZoneOver ? "scale(0.85)" : "scale(1)",
          transition: "transform 0.1s, opacity 0.1s",
        }}
      >
        {section.title}
      </div>
    );
  }
  return null;
};

export default DragOverlayContent;
