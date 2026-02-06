// ConnectionArrow.tsx
import type { Position } from "@/app/plant-operator/plant-builder/types";  // CORRECT SOURCE

type ConnectionArrowProps = {
  id?: string;
  from: Position;
  to: Position;
  onClick: () => void;
  style?: "smooth" | "orthogonal" | "straight";
  isInvalid?: boolean;
};

const ConnectionArrow = ({
  id,
  from,
  to,
  onClick,
  style = "smooth",
  isInvalid = false,
}: ConnectionArrowProps) => {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;

  const dx = endX - startX;
  const curveOffset = Math.min(180, Math.max(40, Math.abs(dx) * 0.5));
  const dir = dx >= 0 ? 1 : -1;

  const buildPath = () => {
    if (style === "straight") {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    if (style === "orthogonal") {
      const midX = startX + dx / 2;
      return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
    }
    const c1x = startX + curveOffset * dir;
    const c2x = endX - curveOffset * dir;
    return `M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX} ${endY}`;
  };

  const pathData = buildPath();
  const safeId = id ? id.replace(/[^a-zA-Z0-9_-]/g, "") : "default";
  const markerId = `arrowhead-${safeId}`;
  const strokeColor = isInvalid ? "#F59E0B" : "#4F8FF7";

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
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray={isInvalid ? "6 4" : undefined}
        fill="none"
        markerEnd={`url(#${markerId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
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
          id={markerId}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="3.5"
          orient="auto"
          style={{ overflow: "visible" }}
        >
          <polygon points="0,0 12,3.5 0,7" fill={strokeColor} />
        </marker>
      </defs>
    </g>
  );
};

export default ConnectionArrow;
