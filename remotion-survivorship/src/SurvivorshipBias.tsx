import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption } from "./components/Caption";
import { PlaneSilhouette } from "./components/Plane";
import { sans, serif } from "./fonts";
import { COLORS } from "./theme";

const SceneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      backgroundImage:
        "radial-gradient(ellipse at 50% 20%, rgba(126,182,255,0.08), transparent 55%)",
      overflow: "hidden",
    }}
  >
    {/* subtle grid */}
    <AbsoluteFill
      style={{
        opacity: 0.12,
        backgroundImage:
          "linear-gradient(rgba(126,182,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(126,182,255,0.35) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage:
          "radial-gradient(ellipse at center, black 20%, transparent 75%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

const CenterStage: React.FC<{ children: React.ReactNode; y?: number }> = ({
  children,
  y = 0,
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
    {children}
  </div>
);

/** 0–6s: holes + question */
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const holeProgress = interpolate(frame, [8, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showQuestion = frame >= 75;

  return (
    <SceneShell>
      <CenterStage y={-40}>
        <PlaneSilhouette showHoles holeProgress={holeProgress} />
      </CenterStage>
      {frame < 75 ? (
        <Caption text="二战返航的飞机上，弹孔密密麻麻" />
      ) : (
        <Caption text="如果你是工程师——会加固哪里？" accent />
      )}
      {showQuestion ? (
        <div
          style={{
            position: "absolute",
            top: 160,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: sans.fontFamily,
            fontSize: 28,
            color: COLORS.muted,
            letterSpacing: "0.18em",
            opacity: interpolate(frame, [75, 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          A · 弹孔最多的地方
        </div>
      ) : null}
    </SceneShell>
  );
};

/** 10–14s: wrong answer */
const WrongScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  const strike = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      <CenterStage y={-20}>
        <div style={{ transform: `scale(${0.92 + pop * 0.08})` }}>
          <PlaneSilhouette showHoles holeProgress={1} />
        </div>
      </CenterStage>
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
        }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          多数人说：弹孔多的地方
          <span
            style={{
              position: "absolute",
              left: -8,
              right: -8,
              top: "50%",
              height: 3,
              background: COLORS.danger,
              transform: `scaleX(${strike})`,
              transformOrigin: "left center",
            }}
          />
        </span>
      </div>
      <Caption text="多数人说：弹孔多的地方。" appearAt={0} />
    </SceneShell>
  );
};

/** 9.5–22s: 错了 + ghost plane */
const TwistScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wrongPop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const ghostIn = interpolate(frame, [135, 175], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      {frame < 135 ? (
        <CenterStage>
          <div
            style={{
              fontFamily: serif.fontFamily,
              fontSize: 140,
              fontWeight: 700,
              color: COLORS.danger,
              transform: `scale(${wrongPop})`,
              letterSpacing: "0.12em",
            }}
          >
            错了。
          </div>
        </CenterStage>
      ) : (
        <CenterStage y={-30}>
          <div style={{ position: "relative", width: 760, height: 300 }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
              <PlaneSilhouette showHoles holeProgress={1} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: ghostIn,
                transform: `translateY(${(1 - ghostIn) * 20}px)`,
              }}
            >
              <PlaneSilhouette showHoles={false} highlightMissing ghost />
            </div>
          </div>
        </CenterStage>
      )}
      {frame < 135 ? (
        <Caption text="错了。" accent size={48} />
      ) : (
        <Caption
          text="没飞回来的飞机，可能正打在「没有弹孔」的位置。"
          size={40}
        />
      )}
    </SceneShell>
  );
};

/** 22–28s: sieve metaphor */
const SieveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 36 }, (_, i) => i);
  return (
    <SceneShell>
      <CenterStage y={-50}>
        <svg width={900} height={420} viewBox="0 0 900 420">
          <line
            x1="80"
            y1="160"
            x2="820"
            y2="160"
            stroke={COLORS.structure}
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity={0.5}
          />
          <text
            x="450"
            y="40"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="24"
          >
            样本进入筛选
          </text>
          {dots.map((i) => {
            const col = i % 12;
            const row = Math.floor(i / 12);
            const x = 120 + col * 60;
            const startY = 70 + row * 28;
            const survives = i % 5 === 0;
            const fall = interpolate(frame, [10 + i, 45 + i], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = survives
              ? startY + 120
              : startY + 120 + fall * (180 + (i % 7) * 8);
            const opacity = survives ? 1 : 1 - fall * 0.85;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={survives ? 8 : 6}
                fill={survives ? COLORS.surprise : COLORS.ghost}
                opacity={opacity}
              />
            );
          })}
          <text
            x="200"
            y="400"
            fill={COLORS.surprise}
            fontFamily={sans.fontFamily}
            fontSize="22"
          >
            看得见的成功
          </text>
          <text
            x="560"
            y="400"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
          >
            沉默的失败
          </text>
        </svg>
      </CenterStage>
      <Caption text="你只看见幸存者。看不见沉默的失败。" />
    </SceneShell>
  );
};

/** 28–34s: title card */
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 160 } });
  const line = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      <CenterStage>
        <div style={{ textAlign: "center", transform: `scale(${0.94 + enter * 0.06})` }}>
          <div
            style={{
              fontFamily: serif.fontFamily,
              fontSize: 108,
              fontWeight: 700,
              color: COLORS.text,
              letterSpacing: "0.08em",
            }}
          >
            幸存者偏差
          </div>
          <div
            style={{
              margin: "28px auto 0",
              width: 280 * line,
              height: 2,
              background: COLORS.surprise,
            }}
          />
          <div
            style={{
              marginTop: 24,
              fontFamily: sans.fontFamily,
              fontSize: 28,
              color: COLORS.muted,
              letterSpacing: "0.28em",
            }}
          >
            SURVIVORSHIP BIAS
          </div>
        </div>
      </CenterStage>
      <Caption text="这叫——幸存者偏差" accent />
    </SceneShell>
  );
};

/** 34–42s: modern transfer */
const TransferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cards = ["成功学书单", "爆款复盘", "上岸经验"];
  return (
    <SceneShell>
      <CenterStage y={-60}>
        <div style={{ display: "flex", gap: 28 }}>
          {cards.map((label, i) => {
            const appear = interpolate(frame, [8 + i * 10, 22 + i * 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={label}
                style={{
                  width: 260,
                  height: 320,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 8,
                  background:
                    "linear-gradient(180deg, rgba(126,182,255,0.10), rgba(11,13,16,0.2))",
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 24}px)`,
                  position: "relative",
                  overflow: "hidden",
                  padding: 28,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily: sans.fontFamily,
                    fontSize: 32,
                    color: COLORS.surprise,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    fontFamily: sans.fontFamily,
                    fontSize: 20,
                    color: COLORS.muted,
                    lineHeight: 1.6,
                  }}
                >
                  只收录成功者
                  <br />
                  样本已被筛选
                </div>
                {/* failed cards behind */}
                {[0, 1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{
                      position: "absolute",
                      right: 16 + n * 8,
                      bottom: 20 + n * 10,
                      width: 88,
                      height: 56,
                      border: `1px solid ${COLORS.ghost}`,
                      opacity: 0.35 + appear * 0.2,
                      transform: `rotate(${-8 + n * 3}deg)`,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </CenterStage>
      <Caption text="成功学书单、爆款复盘、上岸经验……一样。" size={40} />
    </SceneShell>
  );
};

/** 42–50s: ask who is missing */
const AskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cursorX = interpolate(frame, [0, 90], [220, 1500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q = interpolate(frame, [60, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      <CenterStage y={-40}>
        <svg width={1600} height={420} viewBox="0 0 1600 420">
          {/* visible cluster */}
          {Array.from({ length: 14 }).map((_, i) => (
            <circle
              key={`v-${i}`}
              cx={260 + (i % 7) * 55}
              cy={180 + Math.floor(i / 7) * 55}
              r={14}
              fill={COLORS.surprise}
              opacity={0.85}
            />
          ))}
          <text
            x="420"
            y="320"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="24"
          >
            你看见的
          </text>
          {/* empty region */}
          <rect
            x="980"
            y="110"
            width="420"
            height="180"
            rx="12"
            fill="none"
            stroke={COLORS.danger}
            strokeDasharray="8 10"
            opacity={0.7}
          />
          <text
            x="1190"
            y="320"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="24"
          >
            缺席的样本
          </text>
          <circle cx={cursorX} cy={200} r={10} fill={COLORS.structure} />
          <text
            x={1190}
            y={205}
            textAnchor="middle"
            fill={COLORS.danger}
            fontFamily={serif.fontFamily}
            fontSize="64"
            opacity={q}
          >
            ?
          </text>
        </svg>
      </CenterStage>
      <Caption text="先问：谁没出现在样本里？" accent />
    </SceneShell>
  );
};

/** 50–60s: closing line */
const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 180 } });
  const glow = interpolate(frame, [20, 80], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell>
      <CenterStage y={-70}>
        <div style={{ position: "relative" }}>
          <PlaneSilhouette showHoles holeProgress={1} highlightMissing />
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: `inset 0 0 ${80 * glow}px rgba(232,184,109,${0.15 * glow})`,
              pointerEvents: "none",
            }}
          />
        </div>
      </CenterStage>
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          bottom: 150,
          textAlign: "center",
          fontFamily: serif.fontFamily,
          fontSize: 52,
          fontWeight: 700,
          color: COLORS.text,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 18}px)`,
          lineHeight: 1.4,
        }}
      >
        你看见的成功，往往是筛子漏下来的洞。
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 88,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans.fontFamily,
          fontSize: 22,
          color: COLORS.muted,
          letterSpacing: "0.22em",
          opacity: interpolate(frame, [40, 70], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        VIBE 知识短片 · 幸存者偏差
      </div>
    </SceneShell>
  );
};

export const SurvivorshipBias: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* 0–6s 弹孔 + 提问 */}
      <Sequence durationInFrames={180} name="01-hook">
        <HookScene />
      </Sequence>
      {/* 6–9.5s 多数人答错方向 */}
      <Sequence from={180} durationInFrames={105} name="02-wrong">
        <WrongScene />
      </Sequence>
      {/* 9.5–22s 错了 + 幽灵飞机 */}
      <Sequence from={285} durationInFrames={375} name="03-twist">
        <TwistScene />
      </Sequence>
      {/* 22–28s 筛子隐喻 */}
      <Sequence from={660} durationInFrames={180} name="04-sieve">
        <SieveScene />
      </Sequence>
      {/* 28–34s 片名 */}
      <Sequence from={840} durationInFrames={180} name="05-title">
        <TitleScene />
      </Sequence>
      {/* 34–42s 现实迁移 */}
      <Sequence from={1020} durationInFrames={240} name="06-transfer">
        <TransferScene />
      </Sequence>
      {/* 42–50s 谁缺席 */}
      <Sequence from={1260} durationInFrames={240} name="07-ask">
        <AskScene />
      </Sequence>
      {/* 50–60s 金句收束 */}
      <Sequence from={1500} durationInFrames={300} name="08-close">
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
