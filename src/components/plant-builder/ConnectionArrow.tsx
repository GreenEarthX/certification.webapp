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
  isDashed?: boolean;
  isSelected?: boolean;
  label?: string;
  errorMessage?: string;
  showFlow?: boolean;
  color?: string;
};

const ConnectionArrow = ({
  id,
  from,
  to,
  fromSide = "right",
  toSide = "left",
  onClick,
  style = "orthogonal",
  isInvalid = false,
  isDashed = false,
  isSelected = false,
  label,
  errorMessage,
  showFlow = false,
  color,
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
  const smoothOffset = Math.min(220, Math.max(60, distance * 0.4));
  const orthogonalOffset = 24;

  /**
   * Turn a polyline into a path whose corners are rounded with a quadratic
   * curve of radius `cornerRadius` (clamped so short segments never overlap).
   */
  const roundedPolyline = (points: Array<{ x: number; y: number }>, cornerRadius: number) => {
    if (points.length < 3) {
      return points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
      const outLen = Math.hypot(next.x - curr.x, next.y - curr.y);
      const r = Math.min(cornerRadius, inLen / 2, outLen / 2);
      if (r < 0.5 || inLen === 0 || outLen === 0) {
        d += ` L ${curr.x} ${curr.y}`;
        continue;
      }
      const inX = curr.x - ((curr.x - prev.x) / inLen) * r;
      const inY = curr.y - ((curr.y - prev.y) / inLen) * r;
      const outX = curr.x + ((next.x - curr.x) / outLen) * r;
      const outY = curr.y + ((next.y - curr.y) / outLen) * r;
      d += ` L ${inX} ${inY} Q ${curr.x} ${curr.y} ${outX} ${outY}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  };

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
      const cornerRadius = 12;

      if (sourceIsHorizontal && targetIsHorizontal) {
        const midX = (startOutX + endInX) / 2;
        return roundedPolyline(
          [
            { x: startX, y: startY },
            { x: startOutX, y: startOutY },
            { x: midX, y: startOutY },
            { x: midX, y: endInY },
            { x: endInX, y: endInY },
            { x: endX, y: endY },
          ],
          cornerRadius,
        );
      }

      if (!sourceIsHorizontal && !targetIsHorizontal) {
        const midY = (startOutY + endInY) / 2;
        return roundedPolyline(
          [
            { x: startX, y: startY },
            { x: startOutX, y: startOutY },
            { x: startOutX, y: midY },
            { x: endInX, y: midY },
            { x: endInX, y: endInY },
            { x: endX, y: endY },
          ],
          cornerRadius,
        );
      }

      return roundedPolyline(
        [
          { x: startX, y: startY },
          { x: startOutX, y: startOutY },
          { x: startOutX, y: endInY },
          { x: endInX, y: endInY },
          { x: endX, y: endY },
        ],
        cornerRadius,
      );
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
  const strokeColor = isInvalid ? "#EF4444" : color || "#4F8FF7";
  const labelText = label?.trim();
  const errorText = errorMessage?.trim();
  const labelLength = labelText ? labelText.length : 0;
  const labelWidth = Math.max(40, labelLength * 6.5 + 16);
  const labelHeight = 18;
  const length = Math.max(distance, 1);
  const normalX = -dy / length;
  const normalY = dx / length;
  const labelOffset = 12;
  const labelT = 0.78;
  const labelX = startX + dx * labelT + normalX * labelOffset;
  const labelY = startY + dy * labelT + normalY * labelOffset;
  const errorOffset = 18;
  const errorX = endX - targetVector.x * errorOffset;
  const errorY = endY - targetVector.y * errorOffset;
  const errorLabel = errorText || "";
  const tooltipPadding = 10;
  const tooltipWidth = Math.min(280, Math.max(120, errorLabel.length * 6.2 + tooltipPadding * 2));
  const tooltipHeight = 28;

  return (
    <g
      style={{ cursor: "pointer", transition: "opacity 0.15s ease" }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {/* Soft halo under the line so it lifts off the canvas */}
      <path
        d={pathData}
        stroke="#FFFFFF"
        strokeWidth={isSelected ? "7" : "5.5"}
        strokeOpacity={0.55}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
      {/* Main Path */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={isSelected ? "3" : "2.25"}
        strokeDasharray={isInvalid ? "6 4" : isDashed ? "8 8" : undefined}
        fill="none"
        markerEnd={`url(#${markerId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={showFlow ? "connection-flow" : undefined}
        style={{
          transition: "stroke-width 0.15s ease, opacity 0.2s, d 0.2s ease",
          filter: isSelected ? `drop-shadow(0 0 6px ${strokeColor}66)` : undefined,
        }}
      />
      <circle cx={startX} cy={startY} r="3.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />

      {/* Clickable Hitbox */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ pointerEvents: "auto" }}
      />

      {labelText && (
        <g transform={`translate(${labelX}, ${labelY})`} pointerEvents="none">
          <rect
            x={-labelWidth / 2}
            y={-labelHeight / 2}
            width={labelWidth}
            height={labelHeight}
            rx={9}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          <text
            fontSize="11"
            fontWeight={600}
            fill="#0F172A"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {labelText}
          </text>
        </g>
      )}

      {isInvalid && errorText && (
        <g
          className="conn-error"
          transform={`translate(${errorX}, ${errorY})`}
          style={{ cursor: "help" }}
          pointerEvents="auto"
        >
          <circle r="8" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
          <text
            fontSize="11"
            fontWeight={700}
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="central"
          >
            !
          </text>
          <g className="conn-error-tooltip" transform={`translate(0, -18)`} pointerEvents="none">
            <rect
              x={-tooltipWidth / 2}
              y={-tooltipHeight}
              width={tooltipWidth}
              height={tooltipHeight}
              rx={8}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text
              fontSize="11"
              fontWeight={600}
              fill="#0F172A"
              textAnchor="middle"
              dominantBaseline="central"
              y={-tooltipHeight / 2}
            >
              {errorLabel}
            </text>
          </g>
        </g>
      )}

      {/* Arrowhead */}
      <defs>
        <marker
          id={markerId}
          markerWidth="14"
          markerHeight="10"
          refX="13"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
          style={{ overflow: "visible" }}
        >
          <path
            d="M 0 0 L 14 5 L 0 10 Q 3.5 5 0 0 Z"
            fill={strokeColor}
            stroke={strokeColor}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </g>
  );
};

export default ConnectionArrow;
