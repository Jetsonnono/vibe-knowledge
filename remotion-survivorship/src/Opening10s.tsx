import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { OpeningBeatAudio } from "./components/BeatAudio";
import { EffectSubtitle } from "./components/EffectSubtitle";
import { HighlightMode, PlaneSilhouette } from "./components/Plane";
import { Shell } from "./components/Shell";
import { sans, serif } from "./fonts";
import { COLORS } from "./theme";

/**
 * 开头 10 秒样片（300 帧 @ 30fps）——已锁定
 * 0.0–2.0 弹孔点亮
 * 2.0–5.5 提问 + A/B/C 依次出现并分区高亮
 * 5.5–8.0 多数人选 A，划掉
 * 8.0–10.0 「错了。」
 */

const PlaneStage: React.FC<{
  children?: React.ReactNode;
  y?: number;
  showHoles?: boolean;
  holeProgress?: number;
  highlightMode?: HighlightMode;
}> = ({
  children,
  y = 8,
  showHoles = true,
  holeProgress = 1,
  highlightMode = "none",
}) => (
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
    <div style={{ position: "relative" }}>
      <PlaneSilhouette
        showHoles={showHoles}
        holeProgress={holeProgress}
        highlightMode={highlightMode}
      />
      {children}
    </div>
  </div>
);

const OPTIONS = [
  {
    key: "A",
    label: "弹孔最多的地方",
    mode: "holes" as HighlightMode,
  },
  {
    key: "B",
    label: "几乎没有弹孔的地方",
    mode: "engines" as HighlightMode,
  },
  {
    key: "C",
    label: "整架均匀加固",
    mode: "all" as HighlightMode,
  },
];

const OptionList: React.FC<{
  activeIndex: number;
  selected?: "A" | null;
  strikeA?: number;
  /** 各选项相对本段开始的入场帧 */
  appearAt?: number[];
}> = ({
  activeIndex,
  selected = null,
  strikeA = 0,
  appearAt = [12, 28, 44],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {OPTIONS.map((opt, i) => {
        const local = frame - appearAt[i];
        const enter = spring({
          frame: Math.max(0, local),
          fps,
          config: { damping: 14, stiffness: 140 },
        });
        const visible = local >= 0;
        const isActive = i === activeIndex;
        const isSelected = selected === opt.key;
        const dim = visible && !isActive && !isSelected;
        return (
          <div
            key={opt.key}
            style={{
              minWidth: 250,
              padding: "14px 18px",
              borderRadius: 8,
              border: `1px solid ${
                isSelected || isActive ? COLORS.surprise : COLORS.line
              }`,
              background: isSelected
                ? "rgba(232,184,109,0.14)"
                : isActive
                  ? "rgba(126,182,255,0.1)"
                  : "rgba(18,21,26,0.72)",
              opacity: visible ? (dim ? 0.38 : 1) * Math.min(1, enter) : 0,
              transform: `translateY(${(1 - enter) * 18}px) scale(${
                0.92 + 0.08 * enter
              })`,
              filter: `blur(${interpolate(Math.max(0, local), [0, 10], [5, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px)`,
              position: "relative",
              boxShadow:
                isActive || isSelected
                  ? `0 0 24px rgba(232,184,109,0.18)`
                  : "none",
            }}
          >
            <div
              style={{
                fontFamily: sans.fontFamily,
                fontSize: 18,
                color: COLORS.surprise,
                letterSpacing: "0.12em",
                marginBottom: 6,
              }}
            >
              {opt.key}
            </div>
            <div
              style={{
                fontFamily: sans.fontFamily,
                fontSize: 24,
                color: COLORS.text,
                position: "relative",
                display: "inline-block",
              }}
            >
              {opt.label}
              {opt.key === "A" && strikeA > 0 ? (
                <span
                  style={{
                    position: "absolute",
                    left: -4,
                    right: -4,
                    top: "52%",
                    height: 3,
                    background: COLORS.danger,
                    transform: `scaleX(${strikeA})`,
                    transformOrigin: "left center",
                  }}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BeatHoles: React.FC = () => {
  const frame = useCurrentFrame();
  const holeProgress = interpolate(frame, [4, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <PlaneStage holeProgress={holeProgress} />
      <EffectSubtitle text="二战返航的飞机上，弹孔密密麻麻" tone="normal" />
    </Shell>
  );
};

const BeatQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  // A at 12, B at 28, C at 44; then hold C briefly and cycle highlight with active
  const activeIndex =
    frame < 12 ? -1 : frame < 28 ? 0 : frame < 44 ? 1 : 2;
  const highlightMode: HighlightMode =
    activeIndex < 0 ? "none" : OPTIONS[activeIndex].mode;

  return (
    <Shell>
      <OptionList activeIndex={activeIndex} />
      <PlaneStage highlightMode={highlightMode} y={-20} />
      <EffectSubtitle
        text="如果你是工程师——会加固哪里？"
        tone="question"
        emphasize="哪里"
      />
    </Shell>
  );
};

const BeatWrongChoice: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [40, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <OptionList
        activeIndex={0}
        selected="A"
        strikeA={strike}
        appearAt={[-30, -30, -30]}
      />
      <PlaneStage highlightMode="holes" y={-20} />
      <EffectSubtitle text="多数人说：弹孔多的地方。" tone="normal" />
    </Shell>
  );
};

const BeatWrong: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 150 },
  });
  const flash = interpolate(frame, [0, 4, 14], [0, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, rgba(255,107,107,${
            0.18 * flash
          }), transparent 55%)`,
        }}
      />
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
            transform: `scale(${0.84 + 0.16 * pop})`,
            filter: `blur(${interpolate(frame, [0, 10], [5, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
            textShadow: `0 0 ${40 * flash}px ${COLORS.danger}`,
          }}
        >
          错了。
        </div>
      </div>
    </Shell>
  );
};

export const Opening10s: React.FC<{ withAudio?: boolean }> = ({
  withAudio = true,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {withAudio ? <OpeningBeatAudio /> : null}
      <Sequence durationInFrames={60} name="holes">
        <BeatHoles />
      </Sequence>
      <Sequence from={60} durationInFrames={105} name="question">
        <BeatQuestion />
      </Sequence>
      <Sequence from={165} durationInFrames={75} name="majority">
        <BeatWrongChoice />
      </Sequence>
      <Sequence from={240} durationInFrames={60} name="wrong">
        <BeatWrong />
      </Sequence>
    </AbsoluteFill>
  );
};
