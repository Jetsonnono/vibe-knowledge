import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PlaneSilhouette } from "./components/Plane";
import { sans, serif } from "./fonts";
import { COLORS } from "./theme";

/**
 * 开头 10 秒样片（300 帧 @ 30fps）
 * 为了让「错了。」在样片里站得住，前三段略压缩：
 * 0.0–2.0 弹孔点亮
 * 2.0–5.0 提问
 * 5.0–8.0 多数人答错
 * 8.0–10.0 「错了。」踩点出场（全片会回到 9.5s 起、更长停留）
 */

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      backgroundImage:
        "radial-gradient(ellipse at 50% 18%, rgba(126,182,255,0.09), transparent 58%)",
    }}
  >
    <AbsoluteFill
      style={{
        opacity: 0.1,
        backgroundImage:
          "linear-gradient(rgba(126,182,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(126,182,255,0.4) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage:
          "radial-gradient(ellipse at center, black 25%, transparent 72%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

const Subtitle: React.FC<{
  text: string;
  accent?: boolean;
  delay?: number;
}> = ({ text, accent = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  const opacity = interpolate(t, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(t, [0, 10], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        right: 140,
        bottom: 96,
        textAlign: "center",
        fontFamily: sans.fontFamily,
        fontSize: 44,
        fontWeight: 500,
        lineHeight: 1.45,
        color: accent ? COLORS.surprise : COLORS.text,
        opacity,
        transform: `translateY(${y}px)`,
        letterSpacing: "0.02em",
      }}
    >
      {text}
    </div>
  );
};

const BeatHoles: React.FC = () => {
  const frame = useCurrentFrame();
  const holeProgress = interpolate(frame, [6, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(-36px)",
        }}
      >
        <PlaneSilhouette showHoles holeProgress={holeProgress} />
      </div>
      <Subtitle text="二战返航的飞机上，弹孔密密麻麻" />
    </Shell>
  );
};

const BeatQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const optionOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(-36px)",
        }}
      >
        <PlaneSilhouette showHoles holeProgress={1} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans.fontFamily,
          fontSize: 28,
          color: COLORS.muted,
          letterSpacing: "0.2em",
          opacity: optionOpacity,
        }}
      >
        A · 弹孔最多的地方
      </div>
      <Subtitle text="如果你是工程师——会加固哪里？" accent />
    </Shell>
  );
};

const BeatWrongChoice: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(-20px)",
        }}
      >
        <PlaneSilhouette showHoles holeProgress={1} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans.fontFamily,
          fontSize: 36,
          color: COLORS.text,
          opacity: checkOpacity,
        }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          ✓ 弹孔多的地方
          <span
            style={{
              position: "absolute",
              left: -10,
              right: -10,
              top: "52%",
              height: 3,
              background: COLORS.danger,
              transform: `scaleX(${strike})`,
              transformOrigin: "left center",
            }}
          />
        </span>
      </div>
      <Subtitle text="多数人说：弹孔多的地方。" />
    </Shell>
  );
};

const BeatWrong: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 140 },
  });

  return (
    <Shell>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: serif.fontFamily,
            fontSize: 148,
            fontWeight: 700,
            color: COLORS.danger,
            letterSpacing: "0.14em",
            transform: `scale(${pop})`,
          }}
        >
          错了。
        </div>
      </div>
    </Shell>
  );
};

export const Opening10s: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence durationInFrames={60} name="holes">
        <BeatHoles />
      </Sequence>
      <Sequence from={60} durationInFrames={90} name="question">
        <BeatQuestion />
      </Sequence>
      <Sequence from={150} durationInFrames={90} name="majority">
        <BeatWrongChoice />
      </Sequence>
      <Sequence from={240} durationInFrames={60} name="wrong">
        <BeatWrong />
      </Sequence>
    </AbsoluteFill>
  );
};
