"use client";

import type { Diagram, Primitive } from "@/lib/reports/boundary-diagram";

/**
 * Renders a boundary-diagram primitive list as inline SVG.
 *
 * The twin of the jsPDF mapping in lib/reports/process-flow-operations.pdf.ts:
 * neither file computes geometry — both consume lib/reports/boundary-diagram.ts
 * — so the preview and the printed page draw the same picture.
 */

const ANCHOR = {
  start: "start",
  middle: "middle",
  end: "end",
} as const;

function Item({ p }: { p: Primitive }) {
  switch (p.kind) {
    case "rect":
      return (
        <rect
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          rx={p.r || undefined}
          fill={p.fill ?? "none"}
          stroke={p.stroke ?? "none"}
          strokeWidth={p.stroke ? p.strokeWidth : 0}
        />
      );
    case "line":
      return (
        <line
          x1={p.x1}
          y1={p.y1}
          x2={p.x2}
          y2={p.y2}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          strokeLinecap="butt"
        />
      );
    case "arrowhead":
      return (
        <polygon
          points={`${p.x},${p.y} ${p.x - p.size},${p.y - p.size * 0.62} ${p.x - p.size},${p.y + p.size * 0.62}`}
          fill={p.fill}
        />
      );
    case "text":
      return (
        <text
          x={p.x}
          y={p.y}
          fill={p.color}
          fontSize={p.size}
          fontWeight={p.bold ? 700 : 400}
          textAnchor={ANCHOR[p.anchor]}
          letterSpacing={p.tracking || undefined}
          style={{
            fontFamily:
              "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
          }}
        >
          {p.text}
        </text>
      );
  }
}

export default function DiagramSvg({
  diagram,
  label,
}: {
  diagram: Diagram;
  label: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${diagram.width} ${diagram.height}`}
      width="100%"
      role="img"
      aria-label={label}
      className="block h-auto w-full bg-white"
    >
      {diagram.items.map((p, i) => (
        <Item key={i} p={p} />
      ))}
    </svg>
  );
}
