import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

/**
 * 方案 A 修正版：百科式实心剪影
 * 禁止「大六边形胶囊」。左右机翼分块 + 细长机身 = 清晰十字飞机形。
 */
const HOLES: Array<{ cx: number; cy: number; r: number }> = [
  // left wing
  { cx: 95, cy: 125, r: 5 },
  { cx: 135, cy: 108, r: 6 },
  { cx: 170, cy: 140, r: 5 },
  { cx: 115, cy: 230, r: 5 },
  { cx: 150, cy: 250, r: 6 },
  { cx: 185, cy: 215, r: 5 },
  // right wing
  { cx: 865, cy: 125, r: 5 },
  { cx: 825, cy: 108, r: 6 },
  { cx: 790, cy: 140, r: 5 },
  { cx: 845, cy: 230, r: 5 },
  { cx: 810, cy: 250, r: 6 },
  { cx: 775, cy: 215, r: 5 },
  // rear fuselage
  { cx: 650, cy: 160, r: 5 },
  { cx: 685, cy: 178, r: 6 },
  { cx: 715, cy: 165, r: 5 },
  { cx: 665, cy: 192, r: 5 },
];

const ENGINES = [
  { cx: 330, cy: 122 },
  { cx: 405, cy: 114 },
  { cx: 555, cy: 114 },
  { cx: 630, cy: 122 },
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
  const mode = highlightMissing ? "engines" : highlightMode;
  const engineHot = mode === "engines";
  const holesHot = mode === "holes";
  const allHot = mode === "all";

  // 机翼略深、机身更亮：避免「机翼中间被挖空」的错觉
  const wing = ghost
    ? "rgba(70,85,110,0.45)"
    : allHot
      ? `rgba(90,130,180,${0.55 * pulse})`
      : "#3E4E66";
  const fuse = ghost
    ? "rgba(140,160,190,0.55)"
    : allHot
      ? `rgba(200,220,245,${0.55 * pulse})`
      : "#9AA8BC";
  const edge = ghost ? COLORS.ghost : "#E8EEF7";

  return (
    <svg
      width={980 * scale}
      height={360 * scale}
      viewBox="0 0 980 360"
      style={{ opacity: enter, filter: ghost ? "blur(0.3px)" : undefined }}
    >
      <defs>
        <radialGradient id="holeAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.surprise} stopOpacity="0.5" />
          <stop offset="100%" stopColor={COLORS.surprise} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* LEFT WING — separate slab */}
      <path
        d="
          M50 180
          L70 120
          L300 105
          L300 255
          L70 240
          Z
        "
        fill={wing}
        stroke={edge}
        strokeWidth="2.2"
      />

      {/* RIGHT WING — separate slab */}
      <path
        d="
          M930 180
          L910 120
          L680 105
          L680 255
          L910 240
          Z
        "
        fill={wing}
        stroke={edge}
        strokeWidth="2.2"
      />

      {/* CENTER WING BOX connecting left/right through fuselage area */}
      <rect
        x="300"
        y="105"
        width="380"
        height="150"
        fill={wing}
        stroke={edge}
        strokeWidth="2.2"
      />

      {/* FUSELAGE — darker tube across */}
      <rect
        x="200"
        y="150"
        width="520"
        height="60"
        rx="30"
        fill={fuse}
        stroke={edge}
        strokeWidth="2.2"
      />

      {/* NOSE */}
      <path
        d="M200 180 C155 180 110 162 65 180 C110 198 155 180 200 180 Z"
        fill={engineHot ? `rgba(255,107,107,${0.5 * pulse})` : fuse}
        stroke={engineHot ? COLORS.danger : edge}
        strokeWidth={engineHot ? 2.8 : 2.2}
      />
      <ellipse
        cx="140"
        cy="180"
        rx="24"
        ry="15"
        fill={
          engineHot
            ? `rgba(255,107,107,${0.35 * pulse})`
            : "rgba(213,224,240,0.22)"
        }
        stroke={engineHot ? COLORS.danger : edge}
        strokeWidth={engineHot ? 2.2 : 1.5}
      />

      {/* TAILPLANE */}
      <path
        d="M700 180 L820 115 L910 180 L820 245 Z"
        fill={wing}
        stroke={edge}
        strokeWidth="2.2"
      />
      <path
        d="M760 180 L845 155 L885 180 L845 205 Z"
        fill={fuse}
        stroke={edge}
        strokeWidth="1.8"
      />

      {/* 4 ENGINES on wing */}
      {ENGINES.map((e) => {
        const pair = [
          { cx: e.cx, cy: e.cy },
          { cx: e.cx, cy: 360 - e.cy },
        ];
        return pair.map((eng) => (
          <g key={`${eng.cx}-${eng.cy}`}>
            <ellipse
              cx={eng.cx}
              cy={eng.cy}
              rx={26}
              ry={18}
              fill={
                engineHot ? `rgba(255,107,107,${0.55 * pulse})` : "#0E131A"
              }
              stroke={engineHot ? COLORS.danger : edge}
              strokeWidth={engineHot ? 2.6 : 2}
              opacity={engineHot ? pulse : 1}
            />
            <circle
              cx={eng.cx - 8}
              cy={eng.cy}
              r={6}
              fill="none"
              stroke={engineHot ? COLORS.danger : "rgba(213,224,240,0.55)"}
              strokeWidth="1.5"
            />
          </g>
        ));
      })}

      {holesHot ? (
        <>
          <ellipse cx="160" cy="180" rx="115" ry="95" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="820" cy="180" rx="115" ry="95" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="680" cy="180" rx="85" ry="50" fill="url(#holeAura)" opacity={pulse * 0.8} />
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
