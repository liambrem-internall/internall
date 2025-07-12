import GhostComponent from "../Add/GhostComponent";

import { SectionActions } from "../../../utils/constants";
import { findItemBySection } from "../../../utils/sectionListUtils";

const DragOverlayContent = ({ sections, activeId, isDeleteZoneOver }) => {
  if (activeId === SectionActions.ADD) {
    return <GhostComponent id="new-component-preview" text="New Component" />;
  }
  // for items
  for (const section of Object.values(sections)) {
    let item = findItemBySection(section, { activeId });

    if (item) {
      const itemPadding = "12px 24px";
      const itemBackground = "#25242d";
      const itemBorderRadius = 8;
      const itemBoxShadow = "0 2px 8px rgba(0,0,0,0.12)";
      const itemFontWeight = 500;
      const itemBorder = "4px solid #1f1f1f";
      const itemColor = "white";
      const itemTransform = isDeleteZoneOver ? "scale(0.75)" : "scale(1)";
      const itemOpacity = isDeleteZoneOver ? 0.5 : 1;
      return (
        <div
          style={{
            padding: itemPadding,
            background: itemBackground,
            borderRadius: itemBorderRadius,
            boxShadow: itemBoxShadow,
            opacity: itemOpacity,
            fontWeight: itemFontWeight,
            color: itemColor,
            border: itemBorder,
            transform: itemTransform,
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
    const sectionMinWidth = 200;
    const sectionPadding = "24px 32px";
    const sectionBackground = "var(--dark2)";
    const sectionBorderRadius = 12;
    const sectionBoxShadow = "0 2px 12px rgba(0,0,0,0.14)";
    const sectionFontWeight = 600;
    const sectionColor = "white";
    const sectionFontSize = 20;
    const sectionTransform = isDeleteZoneOver ? "scale(0.85)" : "scale(1)";
    const sectionOpacity = isDeleteZoneOver ? 0.5 : 1;
    return (
      <div
        style={{
          minWidth: sectionMinWidth,
          padding: sectionPadding,
          background: sectionBackground,
          borderRadius: sectionBorderRadius,
          boxShadow: sectionBoxShadow,
          opacity: sectionOpacity,
          fontWeight: sectionFontWeight,
          color: sectionColor,
          fontSize: sectionFontSize,
          transform: sectionTransform,
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
