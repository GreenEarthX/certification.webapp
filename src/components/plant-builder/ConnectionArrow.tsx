import type { Position } from "./Canvas";

type ConnectionArrowProps = {
  from: Position;
  to: Position;
  onClick: () => void;
};

const ConnectionArrow = ({ from, to, onClick }: ConnectionArrowProps) => {
  // Adjust for component center (assuming 200px width, 80px height for components)
  const startX = from.x + 100;
  const startY = from.y + 40;
  const endX = to.x + 100;
  const endY = to.y + 40;

  // Calculate control points for curved path
  const controlX = (startX + endX) / 2;
  const pathData = `M ${startX} ${startY} Q ${controlX} ${startY}, ${controlX} ${(startY + endY) / 2} T ${endX} ${endY}`;

  // Calculate arrow angle
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  return (
    <g className="cursor-pointer hover:opacity-80" onClick={onClick}>
      {/* Path */}
      <path
        d={pathData}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {/* Interactive hitbox */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="pointer-events-auto"
      />
      {/* Arrowhead marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="hsl(var(--primary))"
          />
        </marker>
      </defs>
    </g>
  );
};

export default ConnectionArrow;