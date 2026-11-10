import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

/**
 * 半写实 B-17 俯视线稿（修正比例）
 * 关键：机翼弦长短、展长大；机头/尾明显伸出机翼 → 十字形，而不是胶囊。
 *
 * 坐标：x = 机头→机尾，y = 左翼↔右翼
 */
const HOLES: Array<{ cx: number; cy: number; r: number }> = [
  // left outer wing
  { cx: 320, cy: 78, r: 5 },
  { cx: 360, cy: 62, r: 4.5 },
  { cx: 400, cy: 88, r: 5 },
  { cx: 340, cy: 300, r: 5 },
  { cx: 380, cy: 318, r: 4.5 },
  { cx: 415, cy: 290, r: 5 },
  // right outer wing (mirror in x toward tip is via higher/lower y — right tip is bottom)
  { cx: 560, cy: 70, r: 5 },
  { cx: 600, cy: 88, r: 4.5 },
  { cx: 540, cy: 305, r: 5 },
  { cx: 585, cy: 318, r: 4.5 },
  // aft fuselage behind wing
  { cx: 700, cy: 168, r: 4.5 },
  { cx: 735, cy: 185, r: 5 },
  { cx: 765, cy: 172, r: 4.5 },
  { cx: 720, cy: 198, r: 4.5 },
  // mid wing between nacelles
  { cx: 450, cy: 95, r: 4 },
  { cx: 500, cy: 95, r: 4 },
  { cx: 450, cy: 285, r: 4 },
  { cx: 500, cy: 285, r: 4 },
];

/** 4 nacelles on wing leading edge */
const ENGINES = [
  { cx: 355, cy: 115 },
  { cx: 420, cy: 108 },
  { cx: 540, cy: 108 },
  { cx: 605, cy: 115 },
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

  const pulse = interpolate(Math.sin(frame / 7), [-1, 1], [0.4, 1]);
  const mode = highlightMissing ? "engines" : highlightMode;
  const engineHot = mode === "engines";
  const holesHot = mode === "holes";
  const allHot = mode === "all";

  const ink = ghost ? COLORS.ghost : COLORS.structure;
  const soft = ghost ? "rgba(242,244,247,0.14)" : "rgba(126,182,255,0.5)";
  const wash = allHot
    ? `rgba(126,182,255,${0.14 * pulse})`
    : "rgba(126,182,255,0.05)";

  return (
    <svg
      width={980 * scale}
      height={400 * scale}
      viewBox="0 0 980 380"
      style={{
        opacity: (ghost ? 0.55 : 1) * enter,
        filter: ghost ? "blur(0.3px)" : undefined,
      }}
    >
      <defs>
        <radialGradient id="holeAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.surprise} stopOpacity="0.45" />
          <stop offset="100%" stopColor={COLORS.surprise} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ===== MAIN WING：短弦、大展；前缘较平、后缘收尖 ===== */}
      <path
        d="
          M310 190
          L345 78
          C380 50, 430 38, 490 38
          C550 38, 600 50, 635 78
          L670 190
          L635 302
          C600 330, 550 342, 490 342
          C430 342, 380 330, 345 302
          Z
        "
        fill={wash}
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* left / right wing divide through fuselage */}
      <path d="M490 38 L490 162" stroke={soft} strokeWidth="1.1" />
      <path d="M490 218 L490 342" stroke={soft} strokeWidth="1.1" />
      {/* spars */}
      <path d="M360 85 L360 295" stroke={soft} strokeWidth="1.1" />
      <path d="M620 85 L620 295" stroke={soft} strokeWidth="1.1" />
      {/* flaps */}
      <path
        d="M355 108 L625 108"
        stroke={soft}
        strokeWidth="1"
        strokeDasharray="4 6"
      />
      <path
        d="M355 272 L625 272"
        stroke={soft}
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      {/* ===== FUSELAGE：细长，头尾伸出机翼 ===== */}
      <path
        d="
          M70 190
          C70 172, 100 160, 140 162
          L720 162
          C780 162, 820 170, 850 182
          C820 194, 780 218, 720 218
          L140 218
          C100 220, 70 208, 70 190
          Z
        "
        fill="rgba(11,13,16,0.72)"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M120 190 L830 190" stroke={soft} strokeWidth="1.1" />

      {/* nose glass */}
      <path
        d="
          M70 190
          C45 190, 28 178, 18 190
          C28 202, 45 190, 70 190
          Z
        "
        fill={
          engineHot
            ? `rgba(255,107,107,${0.3 * pulse})`
            : "rgba(126,182,255,0.12)"
        }
        stroke={engineHot ? COLORS.danger : ink}
        strokeWidth={engineHot ? 2.8 : 2.3}
      />
      <ellipse
        cx="95"
        cy="190"
        rx="22"
        ry="13"
        fill={
          engineHot
            ? `rgba(255,107,107,${0.22 * pulse})`
            : "rgba(126,182,255,0.08)"
        }
        stroke={engineHot ? COLORS.danger : soft}
        strokeWidth={engineHot ? 2.1 : 1.3}
      />
      {/* cockpit */}
      <rect
        x="125"
        y="172"
        width="52"
        height="36"
        rx="8"
        fill={
          engineHot
            ? `rgba(255,107,107,${0.2 * pulse})`
            : "rgba(126,182,255,0.07)"
        }
        stroke={engineHot ? COLORS.danger : soft}
        strokeWidth={engineHot ? 2.1 : 1.3}
      />

      {/* ===== TAIL ===== */}
      <path
        d="
          M780 190
          L880 135
          L940 190
          L880 245
          Z
        "
        fill={wash}
        stroke={ink}
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path d="M850 155 L850 225" stroke={soft} strokeWidth="1" />
      {/* vertical stabilizer */}
      <path
        d="M820 190 L900 168 L935 190 L900 212 Z"
        fill="rgba(11,13,16,0.8)"
        stroke={ink}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />

      {/* ===== 4 ENGINES（翼前缘短舱 + 桨盘） ===== */}
      {ENGINES.map((e) => {
        const pair = [
          { cx: e.cx, cy: e.cy },
          { cx: e.cx, cy: 380 - e.cy },
        ];
        return pair.map((eng) => (
          <g key={`${eng.cx}-${eng.cy}`}>
            <path
              d={`
                M${eng.cx - 15} ${eng.cy + 16}
                L${eng.cx - 15} ${eng.cy - 4}
                C${eng.cx - 15} ${eng.cy - 22}, ${eng.cx - 5} ${eng.cy - 32}, ${eng.cx} ${eng.cy - 32}
                C${eng.cx + 5} ${eng.cy - 32}, ${eng.cx + 15} ${eng.cy - 22}, ${eng.cx + 15} ${eng.cy - 4}
                L${eng.cx + 15} ${eng.cy + 16}
                Z
              `}
              fill={
                engineHot
                  ? `rgba(255,107,107,${0.38 * pulse})`
                  : "rgba(11,13,16,0.9)"
              }
              stroke={engineHot ? COLORS.danger : ink}
              strokeWidth={engineHot ? 2.6 : 2}
              opacity={engineHot ? pulse : 1}
            />
            <ellipse
              cx={eng.cx}
              cy={eng.cy - 32}
              rx={12}
              ry={4.5}
              fill="none"
              stroke={engineHot ? COLORS.danger : soft}
              strokeWidth="1.3"
            />
            <circle
              cx={eng.cx}
              cy={eng.cy - 12}
              r={3.5}
              fill="none"
              stroke={engineHot ? COLORS.danger : soft}
              strokeWidth="1.2"
            />
          </g>
        ));
      })}

      {/* wing-root fairing */}
      <path
        d="M300 175 C330 155, 360 155, 390 170"
        stroke={soft}
        strokeWidth="1.1"
        fill="none"
      />
      <path
        d="M680 175 C650 155, 620 155, 590 170"
        stroke={soft}
        strokeWidth="1.1"
        fill="none"
      />

      {holesHot ? (
        <>
          <ellipse cx="360" cy="80" rx="70" ry="55" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="600" cy="80" rx="70" ry="55" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="360" cy="300" rx="70" ry="55" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="600" cy="300" rx="70" ry="55" fill="url(#holeAura)" opacity={pulse} />
          <ellipse cx="730" cy="190" rx="70" ry="40" fill="url(#holeAura)" opacity={pulse * 0.75} />
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
