// ConnectionArrow.tsx
import type { Position } from "../../app/plant-builder/types";  // CORRECT SOURCE

type ConnectionArrowProps = {
  from: Position;
  to: Position;
  onClick: () => void;
};

const ConnectionArrow = ({ from, to, onClick }: ConnectionArrowProps) => {
  // Adjust for component center (200px width, 80px height)
  const startX = from.x + 100;
  const startY = from.y + 40;
  const endX = to.x + 100;
  const endY = to.y + 40;

  // Curved path with quadratic Bézier
  const controlX = (startX + endX) / 2;
  const pathData = `M ${startX} ${startY} Q ${controlX} ${startY}, ${controlX} ${(startY + endY) / 2} T ${endX} ${endY}`;

  // Arrow angle
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {/* Main Path */}
      <path
        d={pathData}
        stroke="#4F8FF7"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        style={{ transition: "opacity 0.2s" }}
      />

      {/* Clickable Hitbox */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ pointerEvents: "auto" }}
      />

      {/* Arrowhead */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="3.5"
          orient="auto"
          style={{ overflow: "visible" }}
        >
          <polygon points="0,0 12,3.5 0,7" fill="#4F8FF7" />
        </marker>
      </defs>
    </g>
  );
};

export default ConnectionArrow;