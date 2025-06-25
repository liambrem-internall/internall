import {
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import { DraggableComponentTypes, SectionActions } from "./constants";

const customCollisionDetection = (args) => {
  const { active } = args;
  if (active.id === SectionActions.ADD) {
    const pointerIntersections = pointerWithin(args);
    if (pointerIntersections.length > 0) {
      const sectionIntersection = pointerIntersections.find(
        (entry) => entry.data?.current?.type === DraggableComponentTypes.SECTION
      );
      if (sectionIntersection) {
        return [sectionIntersection];
      }
    }
    return pointerIntersections.length > 0
      ? pointerIntersections
      : rectIntersection(args);
  }
  return pointerWithin(args);
};

export default customCollisionDetection;