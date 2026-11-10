import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const HOLES: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 210, cy: 118, r: 7 },
  { cx: 248, cy: 102, r: 6 },
  { cx: 280, cy: 130, r: 8 },
  { cx: 318, cy: 96, r: 5 },
  { cx: 352, cy: 124, r: 7 },
  { cx: 390, cy: 108, r: 6 },
  { cx: 430, cy: 136, r: 7 },
  { cx: 468, cy: 100, r: 5 },
  { cx: 505, cy: 122, r: 8 },
  { cx: 240, cy: 168, r: 6 },
  { cx: 300, cy: 176, r: 7 },
  { cx: 360, cy: 164, r: 5 },
  { cx: 420, cy: 180, r: 6 },
  { cx: 480, cy: 170, r: 7 },
];

export const PlaneSilhouette: React.FC<{
  showHoles?: boolean;
  holeProgress?: number;
  highlightMissing?: boolean;
  ghost?: boolean;
  scale?: number;
}> = ({
  showHoles = true,
  holeProgress = 1,
  highlightMissing = false,
  ghost = false,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const visibleHoles = Math.floor(
    interpolate(holeProgress, [0, 1], [0, HOLES.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const missingPulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.35, 0.9]);

  return (
    <svg
      width={720 * scale}
      height={280 * scale}
      viewBox="0 0 720 280"
      style={{
        opacity: ghost ? 0.45 * enter : enter,
        filter: ghost ? "blur(0.4px)" : undefined,
      }}
    >
      <defs>
        <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.structure} stopOpacity="0.25" />
          <stop offset="100%" stopColor={COLORS.structure} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* fuselage */}
      <ellipse
        cx="360"
        cy="140"
        rx="210"
        ry="42"
        fill="url(#wing)"
        stroke={ghost ? COLORS.ghost : COLORS.structure}
        strokeWidth="2"
      />
      {/* wings */}
      <path
        d="M150 140 L40 40 L170 110 L250 125 Z"
        fill="none"
        stroke={ghost ? COLORS.ghost : COLORS.structure}
        strokeWidth="2"
      />
      <path
        d="M570 140 L680 40 L550 110 L470 125 Z"
        fill="none"
        stroke={ghost ? COLORS.ghost : COLORS.structure}
        strokeWidth="2"
      />
      <path
        d="M150 140 L40 240 L170 170 L250 155 Z"
        fill="none"
        stroke={ghost ? COLORS.ghost : COLORS.structure}
        strokeWidth="2"
      />
      <path
        d="M570 140 L680 240 L550 170 L470 155 Z"
        fill="none"
        stroke={ghost ? COLORS.ghost : COLORS.structure}
        strokeWidth="2"
      />
      {/* cockpit / engines — the "missing" lethal zones */}
      <circle
        cx="170"
        cy="140"
        r="18"
        fill="none"
        stroke={highlightMissing ? COLORS.danger : COLORS.line}
        strokeWidth={highlightMissing ? 3 : 1.5}
        opacity={highlightMissing ? missingPulse : 1}
      />
      <circle
        cx="550"
        cy="140"
        r="18"
        fill="none"
        stroke={highlightMissing ? COLORS.danger : COLORS.line}
        strokeWidth={highlightMissing ? 3 : 1.5}
        opacity={highlightMissing ? missingPulse : 1}
      />
      <rect
        x="330"
        y="118"
        width="60"
        height="44"
        rx="10"
        fill="none"
        stroke={highlightMissing ? COLORS.danger : COLORS.line}
        strokeWidth={highlightMissing ? 3 : 1.5}
        opacity={highlightMissing ? missingPulse : 0.8}
      />

      {showHoles &&
        HOLES.slice(0, visibleHoles).map((h, i) => (
          <circle
            key={`${h.cx}-${h.cy}-${i}`}
            cx={h.cx}
            cy={h.cy}
            r={h.r}
            fill={COLORS.surprise}
            opacity={0.9}
          />
        ))}
    </svg>
  );
};
