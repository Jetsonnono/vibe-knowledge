import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

/**
 * 高识别度俯视轰炸机：
 * 左翼 / 右翼分块大面积填充，机身压在中间，四发机舱明显。
 */
const HOLES: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 95, cy: 110, r: 6 },
  { cx: 130, cy: 95, r: 5 },
  { cx: 160, cy: 125, r: 7 },
  { cx: 110, cy: 230, r: 6 },
  { cx: 145, cy: 250, r: 5 },
  { cx: 175, cy: 215, r: 6 },
  { cx: 865, cy: 110, r: 6 },
  { cx: 830, cy: 95, r: 5 },
  { cx: 800, cy: 125, r: 7 },
  { cx: 850, cy: 230, r: 6 },
  { cx: 815, cy: 250, r: 5 },
  { cx: 785, cy: 215, r: 6 },
  { cx: 640, cy: 155, r: 6 },
  { cx: 675, cy: 172, r: 5 },
  { cx: 705, cy: 160, r: 6 },
  { cx: 655, cy: 188, r: 5 },
  { cx: 250, cy: 105, r: 5 },
  { cx: 710, cy: 105, r: 5 },
  { cx: 250, cy: 235, r: 5 },
  { cx: 710, cy: 235, r: 5 },
];

const ENGINES = [
  { cx: 320, cy: 108 },
  { cx: 400, cy: 100 },
  { cx: 560, cy: 100 },
  { cx: 640, cy: 108 },
];

export type HighlightMode = "none" | "holes" | "engines" | "all";

export const PlaneSilhouette: React.FC<{
  showHoles?: boolean;
  holeProgress?: number;
  highlightMissing?: boolean;
  highlightMode?: HighlightMode;
  ghost?: boolean;
  scale?: number;
}> = ({
  showHoles = true,
  holeProgress = 1,
  highlightMissing = false,
  highlightMode = "none",
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

  const pulse = interpolate(Math.sin(frame / 7), [-1, 1], [0.45, 1]);
  const stroke = ghost ? COLORS.ghost : COLORS.structure;
  const mode = highlightMissing ? "engines" : highlightMode;
  const engineHot = mode === "engines";
  const holesHot = mode === "holes";
  const allHot = mode === "all";
  const wingFill = allHot
    ? `rgba(126,182,255,${0.35 * pulse})`
    : "rgba(126,182,255,0.22)";

  return (
    <svg
      width={980 * scale}
      height={360 * scale}
      viewBox="0 0 980 360"
      style={{
        opacity: (ghost ? 0.45 : 1) * enter,
        filter: ghost ? "blur(0.4px)" : undefined,
      }}
    >
      <defs>
        <radialGradient id="holeAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.surprise} stopOpacity="0.55" />
          <stop offset="100%" stopColor={COLORS.surprise} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* LEFT WING */}
      <path
        d="M40 180 L120 70 L390 95 L390 265 L120 290 Z"
        fill={wingFill}
        stroke={stroke}
        strokeWidth="3"
      />
      {/* RIGHT WING */}
      <path
        d="M940 180 L860 70 L590 95 L590 265 L860 290 Z"
        fill={wingFill}
        stroke={stroke}
        strokeWidth="3"
      />

      {/* FUSELAGE */}
      <rect
        x="300"
        y="145"
        width="380"
        height="70"
        rx="34"
        fill="#0B0D10"
        stroke={stroke}
        strokeWidth="3"
      />
      {/* nose */}
      <path
        d="M300 180 C260 180 210 165 170 180 C210 195 260 180 300 180 Z"
        fill={
          engineHot
            ? `rgba(255,107,107,${0.3 * pulse})`
            : "rgba(126,182,255,0.25)"
        }
        stroke={engineHot ? COLORS.danger : stroke}
        strokeWidth={engineHot ? 3.2 : 3}
      />
      <rect
        x="220"
        y="162"
        width="55"
        height="36"
        rx="10"
        fill={
          engineHot
            ? `rgba(255,107,107,${0.22 * pulse})`
            : "rgba(126,182,255,0.12)"
        }
        stroke={engineHot ? COLORS.danger : COLORS.line}
        strokeWidth={engineHot ? 2.4 : 1.6}
      />

      {/* TAIL */}
      <path
        d="M680 180 L820 95 L900 180 L820 265 Z"
        fill={wingFill}
        stroke={stroke}
        strokeWidth="3"
      />
      <path
        d="M760 180 L845 155 L880 180 L845 205 Z"
        fill="rgba(126,182,255,0.35)"
        stroke={stroke}
        strokeWidth="2.2"
      />

      {/* 4 ENGINES */}
      {ENGINES.map((e) => {
        const pair = [
          { cx: e.cx, cy: e.cy },
          { cx: e.cx, cy: 360 - e.cy },
        ];
        return pair.map((eng) => (
          <g key={`${eng.cx}-${eng.cy}`}>
            <rect
              x={eng.cx - 16}
              y={eng.cy - 18}
              width={32}
              height={32}
              rx={11}
              fill={
                engineHot
                  ? `rgba(255,107,107,${0.32 * pulse})`
                  : "#0B0D10"
              }
              stroke={engineHot ? COLORS.danger : stroke}
              strokeWidth={engineHot ? 3.2 : 2.4}
              opacity={engineHot ? pulse : 1}
            />
            <circle
              cx={eng.cx}
              cy={eng.cy}
              r={8}
              fill="none"
              stroke={engineHot ? COLORS.danger : COLORS.line}
              strokeWidth="1.6"
            />
          </g>
        ));
      })}

      {holesHot ? (
        <>
          <ellipse cx="150" cy="180" rx="110" ry="95" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="830" cy="180" rx="110" ry="95" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="670" cy="180" rx="80" ry="50" fill="url(#holeAura)" opacity={pulse * 0.8} />
        </>
      ) : null}

      {showHoles &&
        HOLES.slice(0, visibleHoles).map((h, i) => (
          <circle
            key={`${h.cx}-${h.cy}-${i}`}
            cx={h.cx}
            cy={h.cy}
            r={h.r}
            fill={COLORS.surprise}
            opacity={0.95}
          />
        ))}
    </svg>
  );
};
