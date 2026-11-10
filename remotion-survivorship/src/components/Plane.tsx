import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

/**
 * 使用已批准的 B-17 俯视线稿静帧作底图，
 * 再叠加弹孔与分区高亮（不改动用户认可的飞机造型）。
 */

/** 归一化到 1000×562 逻辑画布（约 16:9 预览比例）后的弹孔位置 */
const HOLES: Array<{ cx: number; cy: number; r: number }> = [
  // left outer wing
  { cx: 220, cy: 200, r: 5 },
  { cx: 175, cy: 230, r: 4.5 },
  { cx: 205, cy: 265, r: 5 },
  { cx: 250, cy: 240, r: 4.5 },
  { cx: 160, cy: 280, r: 4 },
  // right outer wing
  { cx: 780, cy: 200, r: 5 },
  { cx: 825, cy: 230, r: 4.5 },
  { cx: 795, cy: 265, r: 5 },
  { cx: 750, cy: 240, r: 4.5 },
  { cx: 840, cy: 280, r: 4 },
  // aft fuselage / tail area
  { cx: 470, cy: 420, r: 4.5 },
  { cx: 505, cy: 445, r: 5 },
  { cx: 535, cy: 425, r: 4.5 },
  { cx: 490, cy: 465, r: 4 },
  // mid-outer wing panels
  { cx: 300, cy: 255, r: 4 },
  { cx: 700, cy: 255, r: 4 },
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

  const pulse = interpolate(Math.sin(frame / 7), [-1, 1], [0.35, 0.85]);
  const mode = highlightMissing ? "engines" : highlightMode;
  const holesHot = mode === "holes";
  const engineHot = mode === "engines";
  const allHot = mode === "all";

  const width = 980 * scale;
  const height = 603 * scale; // matches cropped b17-top.png ~1.625 aspect

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity: (ghost ? 0.45 : 1) * enter,
        filter: ghost ? "blur(0.4px)" : undefined,
      }}
    >
      <Img
        src={staticFile("b17-top.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: allHot ? 0.85 + 0.15 * pulse : 1,
        }}
      />

      {/* highlight overlays in same logical 1000×562 space, scaled to box */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 1000 562"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <radialGradient id="holeAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.surprise} stopOpacity="0.5" />
            <stop offset="100%" stopColor={COLORS.surprise} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="engineAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.danger} stopOpacity="0.45" />
            <stop offset="100%" stopColor={COLORS.danger} stopOpacity="0" />
          </radialGradient>
        </defs>

        {allHot ? (
          <rect
            x="80"
            y="40"
            width="840"
            height="480"
            fill={`rgba(126,182,255,${0.08 * pulse})`}
          />
        ) : null}

        {holesHot ? (
          <>
            <ellipse cx="210" cy="240" rx="120" ry="95" fill="url(#holeAura)" opacity={pulse} />
            <ellipse cx="790" cy="240" rx="120" ry="95" fill="url(#holeAura)" opacity={pulse} />
            <ellipse cx="500" cy="440" rx="90" ry="60" fill="url(#holeAura)" opacity={pulse * 0.8} />
          </>
        ) : null}

        {engineHot ? (
          <>
            {/* inner/outer nacelle zones + cockpit */}
            <ellipse cx="355" cy="195" rx="55" ry="48" fill="url(#engineAura)" opacity={pulse} />
            <ellipse cx="415" cy="190" rx="50" ry="45" fill="url(#engineAura)" opacity={pulse} />
            <ellipse cx="585" cy="190" rx="50" ry="45" fill="url(#engineAura)" opacity={pulse} />
            <ellipse cx="645" cy="195" rx="55" ry="48" fill="url(#engineAura)" opacity={pulse} />
            <ellipse cx="500" cy="95" rx="48" ry="55" fill="url(#engineAura)" opacity={pulse} />
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
    </div>
  );
};
