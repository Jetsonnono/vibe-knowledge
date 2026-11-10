import React, { useId } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/** 雷达 / 航图圆环背景（Opening10s 已锁定；sweep 仅全片后段开启） */
export const RadarScope: React.FC<{ sweep?: boolean }> = ({
  sweep = false,
}) => {
  const uid = useId().replace(/:/g, "");
  const fadeId = `radarFade-${uid}`;
  const maskId = `radarMask-${uid}`;
  const sweepId = `radarSweep-${uid}`;
  const frame = useCurrentFrame();
  // ~12s 一圈
  const angle = sweep ? ((frame % 360) / 360) * Math.PI * 2 : 0;
  const sx = 960 + Math.cos(angle - Math.PI / 2) * 700;
  const sy = 500 + Math.sin(angle - Math.PI / 2) * 700;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(126,182,255,0.10) 0%, rgba(11,13,16,0.55) 42%, #07090C 72%, #050607 100%)",
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <radialGradient id={fadeId} cx="50%" cy="46%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="58%" stopColor="white" stopOpacity="0.55" />
            <stop offset="82%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={maskId}>
            <rect width="1920" height="1080" fill={`url(#${fadeId})`} />
          </mask>
          <linearGradient
            id={sweepId}
            x1="960"
            y1="500"
            x2={sx}
            y2={sy}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={COLORS.structure} stopOpacity="0" />
            <stop offset="70%" stopColor={COLORS.structure} stopOpacity="0.08" />
            <stop
              offset="100%"
              stopColor={COLORS.structure}
              stopOpacity="0.22"
            />
          </linearGradient>
        </defs>
        <g mask={`url(#${maskId})`} fill="none" stroke={COLORS.structure}>
          {[120, 220, 340, 480, 640, 820].map((r, i) => (
            <circle
              key={r}
              cx="960"
              cy="500"
              r={r}
              strokeWidth={i === 3 ? 1.8 : 1.2}
              strokeOpacity={0.28 - i * 0.025}
            />
          ))}
          <line
            x1="960"
            y1="80"
            x2="960"
            y2="920"
            strokeWidth="1.2"
            strokeOpacity="0.2"
          />
          <line
            x1="240"
            y1="500"
            x2="1680"
            y2="500"
            strokeWidth="1.2"
            strokeOpacity="0.2"
          />
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            const r0 = 470;
            const r1 = i % 3 === 0 ? 500 : 488;
            return (
              <line
                key={i}
                x1={960 + Math.cos(a) * r0}
                y1={500 + Math.sin(a) * r0}
                x2={960 + Math.cos(a) * r1}
                y2={500 + Math.sin(a) * r1}
                strokeWidth={i % 3 === 0 ? 1.5 : 1}
                strokeOpacity={i % 3 === 0 ? 0.28 : 0.14}
              />
            );
          })}
          <circle
            cx="960"
            cy="500"
            r="700"
            strokeWidth="1.1"
            strokeOpacity="0.14"
            strokeDasharray="6 14"
          />
          {sweep ? (
            <line
              x1="960"
              y1="500"
              x2={sx}
              y2={sy}
              stroke={`url(#${sweepId})`}
              strokeWidth="2.4"
            />
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Shell: React.FC<{
  children: React.ReactNode;
  sweep?: boolean;
}> = ({ children, sweep = false }) => (
  <AbsoluteFill style={{ backgroundColor: "#050607" }}>
    <RadarScope sweep={sweep} />
    {children}
  </AbsoluteFill>
);

export const CenterStage: React.FC<{
  children: React.ReactNode;
  y?: number;
}> = ({ children, y = 0 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `translateY(${y}px)`,
    }}
  >
    {children}
  </div>
);

/** 段间 8–12 帧淡入淡出 */
export const FadeScene: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  fade?: number;
}> = ({ children, durationInFrames, fade = 10 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fade, Math.max(fade + 1, durationInFrames - fade), durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
