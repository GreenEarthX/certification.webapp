"use client";

import { useId, useMemo } from "react";
import {
  layoutTemplateDiagram,
  type DiagramNode,
  type DiagramNodeKind,
} from "@/lib/plant-builder/templates";
import type { TemplateTopology } from "@/services/plant-builder/templates";

// Same colour language as the builder canvas: blue equipment, green round
// carriers, purple gates.
const NODE_STYLE: Record<DiagramNodeKind, { fill: string; stroke: string; text: string }> = {
  equipment: { fill: "#EFF6FF", stroke: "#3B82F6", text: "#1D4ED8" },
  carrier: { fill: "#ECFDF5", stroke: "#10B981", text: "#047857" },
  gate: { fill: "#F5F3FF", stroke: "#8B5CF6", text: "#6D28D9" },
  other: { fill: "#F1F5F9", stroke: "#94A3B8", text: "#475569" },
};

const EDGE_COLOR = "#94A3B8";

// Characters that fit inside each shape at the label font size.
const LABEL_MAX_CHARS: Record<DiagramNodeKind, number> = {
  equipment: 19,
  carrier: 11,
  gate: 15,
  other: 15,
};

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

type Props = {
  topology: TemplateTopology | undefined;
  /** Node names are unreadable at thumbnail size, so thumbnails omit them. */
  showLabels?: boolean;
  className?: string;
  /** Accessible name for the diagram. */
  title: string;
};

/**
 * Read-only process-flow diagram of a template, drawn as SVG so the same
 * component serves as a card thumbnail and as a zoomable full preview.
 */
export default function TemplateDiagram({
  topology,
  showLabels = true,
  className,
  title,
}: Props) {
  const layout = useMemo(() => layoutTemplateDiagram(topology), [topology]);
  const markerId = `template-arrow-${useId().replace(/:/g, "")}`;

  if (!layout) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-slate-400 ${className ?? ""}`}
      >
        No diagram available
      </div>
    );
  }

  const { x, y, width, height } = layout.viewBox;

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <title>{title}</title>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="18"
          markerHeight="18"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={EDGE_COLOR} />
        </marker>
      </defs>

      <g>
        {layout.edges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={EDGE_COLOR}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            markerEnd={`url(#${markerId})`}
          />
        ))}
      </g>

      <g>
        {layout.nodes.map((node) => (
          <DiagramShape key={node.id} node={node} showLabel={showLabels} />
        ))}
      </g>
    </svg>
  );
}

function DiagramShape({ node, showLabel }: { node: DiagramNode; showLabel: boolean }) {
  const style = NODE_STYLE[node.kind];
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const common = {
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <g>
      {node.kind === "carrier" ? (
        <circle cx={cx} cy={cy} r={node.width / 2} {...common} />
      ) : (
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx={node.kind === "gate" ? 10 : 14}
          {...common}
        />
      )}
      {showLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
          fontWeight={600}
          fill={style.text}
        >
          {truncate(node.name, LABEL_MAX_CHARS[node.kind])}
        </text>
      )}
    </g>
  );
}
