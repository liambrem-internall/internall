import "./SkeletonSection.css";
import { SKELETON_SECTIONS_COUNT } from "../../../utils/constants";

const SkeletonSection = () => (
  <div className="droppable-section skeleton-section">
    <div className="section-header">
      <div className="skeleton-title shimmer" />
    </div>
    <div className="section-items">
      {[...Array(SKELETON_SECTIONS_COUNT)].map((_, i) => (
        <div className="skeleton-item shimmer" key={i} />
      ))}
    </div>
  </div>
);

export default SkeletonSection;