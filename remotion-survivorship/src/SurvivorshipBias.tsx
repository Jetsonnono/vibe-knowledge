import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EffectSubtitle } from "./components/EffectSubtitle";
import { PlaneSilhouette } from "./components/Plane";
import { CenterStage, Shell } from "./components/Shell";
import { Opening10s } from "./Opening10s";
import { sans, serif } from "./fonts";
import { COLORS, FPS } from "./theme";

/**
 * 全片 60s · 前 10s 复用已锁定 Opening10s
 * 10–22 幽灵飞机反转
 * 22–28 筛子隐喻
 * 28–34 片名
 * 34–42 当代迁移
 * 42–50 谁缺席
 * 50–60 金句收束
 */

/** 10–22s: 返航半透明 + 幽灵飞机要害闪红 */
const GhostRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ghostIn = interpolate(frame, [18, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const survivorDim = interpolate(frame, [0, 40], [1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelIn = interpolate(frame, [70, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-28}>
        <div
          style={{
            position: "relative",
            width: 1180,
            height: 640,
          }}
        >
          {/* 返航机：略左下 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 48,
              opacity: survivorDim,
              transform: "scale(0.88)",
              transformOrigin: "left top",
            }}
          >
            <PlaneSilhouette showHoles holeProgress={1} />
          </div>
          {/* 幽灵机：右上叠入，要害闪红 */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              opacity: ghostIn * 0.95,
              transform: `translate(${(1 - ghostIn) * 40}px, ${(1 - ghostIn) * -24}px) scale(0.88)`,
              transformOrigin: "right top",
              filter: `blur(${(1 - ghostIn) * 3}px)`,
            }}
          >
            <PlaneSilhouette
              showHoles={false}
              highlightMode="engines"
              ghost
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 12,
              fontFamily: sans.fontFamily,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: COLORS.muted,
              opacity: labelIn * 0.9,
            }}
          >
            返航样本
          </div>
          <div
            style={{
              position: "absolute",
              right: 24,
              top: 12,
              fontFamily: sans.fontFamily,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: COLORS.danger,
              opacity: ghostIn * labelIn,
            }}
          >
            没回来的 · 要害命中
          </div>
        </div>
      </CenterStage>
      <EffectSubtitle
        text="没飞回来的飞机，可能正打在「没有弹孔」的位置。"
        tone="question"
        emphasize="没有弹孔"
        size={40}
      />
    </Shell>
  );
};

/** 22–28s: 筛子——多数坠落，少数留下 */
const SieveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 40 }, (_, i) => i);
  const lineIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-56}>
        <svg width={980} height={460} viewBox="0 0 980 460">
          <line
            x1="90"
            y1="168"
            x2={90 + 800 * lineIn}
            y2="168"
            stroke={COLORS.structure}
            strokeWidth="1.5"
            strokeDasharray="5 9"
            opacity={0.45}
          />
          <text
            x="490"
            y="36"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
            letterSpacing="0.2em"
            opacity={lineIn}
          >
            筛选
          </text>
          {dots.map((i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const x = 140 + col * 78;
            const startY = 58 + row * 26;
            const survives = i % 5 === 0;
            const fall = interpolate(frame, [12 + i * 0.7, 48 + i * 0.7], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = survives
              ? startY + 118
              : startY + 118 + fall * (170 + (i % 6) * 10);
            const opacity = survives ? 1 : Math.max(0.08, 1 - fall * 0.92);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={survives ? 8 : 5.5}
                fill={survives ? COLORS.surprise : COLORS.ghost}
                opacity={opacity}
              />
            );
          })}
          <text
            x="250"
            y="430"
            fill={COLORS.surprise}
            fontFamily={sans.fontFamily}
            fontSize="22"
            opacity={interpolate(frame, [50, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            看得见的成功
          </text>
          <text
            x="620"
            y="430"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
            opacity={interpolate(frame, [58, 78], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            沉默的失败
          </text>
        </svg>
      </CenterStage>
      <EffectSubtitle text="你只看见幸存者。看不见沉默的失败。" size={40} />
    </Shell>
  );
};

/** 28–34s: 片名卡 */
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const line = interpolate(frame, [10, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const en = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-24}>
        <div
          style={{
            textAlign: "center",
            opacity: enter,
            transform: `scale(${0.9 + 0.1 * enter})`,
            filter: `blur(${interpolate(frame, [0, 12], [6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif.fontFamily,
              fontSize: 112,
              fontWeight: 700,
              color: COLORS.text,
              letterSpacing: "0.1em",
            }}
          >
            幸存者偏差
          </div>
          <div
            style={{
              margin: "30px auto 0",
              width: 260 * line,
              height: 2,
              background: COLORS.surprise,
              boxShadow: `0 0 16px ${COLORS.surprise}`,
            }}
          />
          <div
            style={{
              marginTop: 26,
              fontFamily: sans.fontFamily,
              fontSize: 26,
              color: COLORS.muted,
              letterSpacing: "0.32em",
              opacity: en,
            }}
          >
            SURVIVORSHIP BIAS
          </div>
        </div>
      </CenterStage>
      <EffectSubtitle text="这叫——幸存者偏差" tone="question" emphasize="幸存者偏差" />
    </Shell>
  );
};

/** 34–42s: 三例迁移（细线面板，非厚卡片） */
const TransferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panels = [
    { title: "成功学书单", note: "只收录成功者" },
    { title: "爆款复盘", note: "失败从不进样本" },
    { title: "上岸经验", note: "缺席者无声" },
  ];

  return (
    <Shell>
      <CenterStage y={-48}>
        <div style={{ display: "flex", gap: 36 }}>
          {panels.map((p, i) => {
            const appear = interpolate(frame, [6 + i * 14, 24 + i * 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const failIn = interpolate(frame, [40 + i * 10, 58 + i * 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={p.title}
                style={{
                  width: 280,
                  height: 340,
                  border: `1px solid ${COLORS.line}`,
                  background: "transparent",
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 28}px)`,
                  position: "relative",
                  padding: "32px 28px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily: sans.fontFamily,
                    fontSize: 30,
                    color: COLORS.surprise,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    width: 48,
                    height: 1,
                    background: COLORS.structure,
                    opacity: 0.55,
                  }}
                />
                <div
                  style={{
                    marginTop: 20,
                    fontFamily: sans.fontFamily,
                    fontSize: 22,
                    color: COLORS.muted,
                    lineHeight: 1.55,
                  }}
                >
                  {p.note}
                </div>
                {[0, 1, 2].map((n) => (
                  <div
                    key={n}
                    style={{
                      position: "absolute",
                      right: 18 + n * 10,
                      bottom: 28 + n * 12,
                      width: 78,
                      height: 48,
                      border: `1px dashed ${COLORS.ghost}`,
                      opacity: 0.25 + failIn * 0.35,
                      transform: `rotate(${-10 + n * 4}deg)`,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </CenterStage>
      <EffectSubtitle
        text="成功学书单、爆款复盘、上岸经验……一样。"
        size={40}
      />
    </Shell>
  );
};

/** 42–50s: 谁没出现在样本里 */
const AskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cursorX = interpolate(frame, [8, 110], [280, 1280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cluster = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-40}>
        <svg width={1500} height={420} viewBox="0 0 1500 420">
          {Array.from({ length: 16 }).map((_, i) => (
            <circle
              key={`v-${i}`}
              cx={220 + (i % 8) * 52}
              cy={150 + Math.floor(i / 8) * 58}
              r={12}
              fill={COLORS.surprise}
              opacity={0.2 + cluster * 0.7}
            />
          ))}
          <text
            x="400"
            y="310"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
            letterSpacing="0.12em"
            opacity={cluster}
          >
            你看见的
          </text>
          <rect
            x="920"
            y="95"
            width={400 * box}
            height={170}
            fill="none"
            stroke={COLORS.danger}
            strokeDasharray="7 11"
            strokeOpacity={0.75 * box}
          />
          <text
            x="1120"
            y="310"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
            letterSpacing="0.12em"
            opacity={box}
          >
            缺席的样本
          </text>
          <circle
            cx={cursorX}
            cy={180}
            r={8}
            fill={COLORS.structure}
            opacity={0.9}
          />
          <circle
            cx={cursorX}
            cy={180}
            r={18}
            fill="none"
            stroke={COLORS.structure}
            strokeOpacity={0.35}
          />
          <text
            x={1120}
            y={195}
            textAnchor="middle"
            fill={COLORS.danger}
            fontFamily={serif.fontFamily}
            fontSize="72"
            opacity={q}
          >
            ?
          </text>
        </svg>
      </CenterStage>
      <EffectSubtitle
        text="先问：谁没出现在样本里？"
        tone="question"
        emphasize="谁没出现"
      />
    </Shell>
  );
};

/** 50–60s: 金句闭环 */
const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const glow = interpolate(frame, [16, 90], [0.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brand = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-78}>
        <div style={{ position: "relative" }}>
          <PlaneSilhouette
            showHoles
            holeProgress={1}
            highlightMode="engines"
          />
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(232,184,109,${0.12 * glow}) 0%, transparent 62%)`,
              pointerEvents: "none",
            }}
          />
        </div>
      </CenterStage>
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          bottom: 150,
          textAlign: "center",
          fontFamily: serif.fontFamily,
          fontSize: 50,
          fontWeight: 700,
          color: COLORS.text,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 20}px)`,
          lineHeight: 1.45,
          letterSpacing: "0.04em",
          textShadow: `0 0 ${28 * glow}px rgba(232,184,109,0.35)`,
        }}
      >
        你看见的成功，往往是筛子漏下来的洞。
        <div
          style={{
            margin: "18px auto 0",
            width: 220 * enter,
            height: 2,
            background: COLORS.surprise,
            boxShadow: `0 0 14px ${COLORS.surprise}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 78,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans.fontFamily,
          fontSize: 20,
          color: COLORS.muted,
          letterSpacing: "0.28em",
          opacity: brand,
        }}
      >
        VIBE 知识短片 · 幸存者偏差
      </div>
    </Shell>
  );
};

export const SurvivorshipBias: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* 0–10s 已锁定开头 */}
      <Sequence durationInFrames={10 * FPS} name="00-opening">
        <Opening10s />
      </Sequence>
      {/* 10–22s 幽灵反转 */}
      <Sequence from={10 * FPS} durationInFrames={12 * FPS} name="05-ghost">
        <GhostRevealScene />
      </Sequence>
      {/* 22–28s 筛子 */}
      <Sequence from={22 * FPS} durationInFrames={6 * FPS} name="06-sieve">
        <SieveScene />
      </Sequence>
      {/* 28–34s 片名 */}
      <Sequence from={28 * FPS} durationInFrames={6 * FPS} name="07-title">
        <TitleScene />
      </Sequence>
      {/* 34–42s 迁移 */}
      <Sequence from={34 * FPS} durationInFrames={8 * FPS} name="08-transfer">
        <TransferScene />
      </Sequence>
      {/* 42–50s 谁缺席 */}
      <Sequence from={42 * FPS} durationInFrames={8 * FPS} name="09-ask">
        <AskScene />
      </Sequence>
      {/* 50–60s 金句 */}
      <Sequence from={50 * FPS} durationInFrames={10 * FPS} name="10-close">
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
