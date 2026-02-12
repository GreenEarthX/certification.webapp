// ConnectionArrow.tsx
import type { Position } from "@/app/plant-operator/plant-builder/types";  // CORRECT SOURCE

type PortSide = "left" | "right" | "top" | "bottom";

type ConnectionArrowProps = {
  id?: string;
  from: Position;
  to: Position;
  fromSide?: PortSide;
  toSide?: PortSide;
  onClick: () => void;
  style?: "smooth" | "orthogonal" | "straight";
  isInvalid?: boolean;
};

const ConnectionArrow = ({
  id,
  from,
  to,
  fromSide = "right",
  toSide = "left",
  onClick,
  style = "smooth",
  isInvalid = false,
}: ConnectionArrowProps) => {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.hypot(dx, dy);

  const sideVectors: Record<PortSide, { x: number; y: number }> = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
  };

  const sourceVector = sideVectors[fromSide];
  const targetVector = sideVectors[toSide];
  const smoothOffset = Math.min(220, Math.max(44, distance * 0.35));
  const orthogonalOffset = 24;

  const buildPath = () => {
    if (style === "straight") {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    if (style === "orthogonal") {
      const startOutX = startX + sourceVector.x * orthogonalOffset;
      const startOutY = startY + sourceVector.y * orthogonalOffset;
      const endInX = endX + targetVector.x * orthogonalOffset;
      const endInY = endY + targetVector.y * orthogonalOffset;
      const sourceIsHorizontal = sourceVector.y === 0;
      const targetIsHorizontal = targetVector.y === 0;

      if (sourceIsHorizontal && targetIsHorizontal) {
        const midX = (startOutX + endInX) / 2;
        return `M ${startX} ${startY} L ${startOutX} ${startOutY} L ${midX} ${startOutY} L ${midX} ${endInY} L ${endInX} ${endInY} L ${endX} ${endY}`;
      }

      if (!sourceIsHorizontal && !targetIsHorizontal) {
        const midY = (startOutY + endInY) / 2;
        return `M ${startX} ${startY} L ${startOutX} ${startOutY} L ${startOutX} ${midY} L ${endInX} ${midY} L ${endInX} ${endInY} L ${endX} ${endY}`;
      }

      return `M ${startX} ${startY} L ${startOutX} ${startOutY} L ${startOutX} ${endInY} L ${endInX} ${endInY} L ${endX} ${endY}`;
    }
    const c1x = startX + sourceVector.x * smoothOffset;
    const c1y = startY + sourceVector.y * smoothOffset;
    const c2x = endX + targetVector.x * smoothOffset;
    const c2y = endY + targetVector.y * smoothOffset;
    return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
  };

  const pathData = buildPath();
  const safeId = id ? id.replace(/[^a-zA-Z0-9_-]/g, "") : "default";
  const markerId = `arrowhead-${safeId}`;
  const strokeColor = isInvalid ? "#F59E0B" : "#4F8FF7";

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
        strokeWidth="2.5"
        strokeDasharray={isInvalid ? "6 4" : undefined}
        fill="none"
        markerEnd={`url(#${markerId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "opacity 0.2s, d 0.2s ease" }}
      />

      <circle cx={startX} cy={startY} r="3" fill={strokeColor} opacity={0.9} />

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
          refX="11"
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
