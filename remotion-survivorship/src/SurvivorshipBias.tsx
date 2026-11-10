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
 * 10–22 幽灵飞机反转（单机叠层 + 红圈）
 * 22–28 筛子隐喻（下落穿网）
 * 28–34 片名
 * 34–42 当代迁移（样本流）
 * 42–50 谁缺席
 * 50–60 金句收束
 */

const VITAL_RINGS = [
  { cx: 355, cy: 195, rx: 52, ry: 44 },
  { cx: 415, cy: 190, rx: 48, ry: 42 },
  { cx: 585, cy: 190, rx: 48, ry: 42 },
  { cx: 645, cy: 195, rx: 52, ry: 44 },
  { cx: 500, cy: 95, rx: 46, ry: 52 },
];

/** 10–22s: 同一架机叠幽灵层 + 要害红圈脉冲 */
const GhostRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const survivorDim = interpolate(frame, [18, 50], [1, 0.48], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ghostIn = interpolate(frame, [28, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rings = interpolate(frame, [55, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.45, 1]);
  const labelIn = interpolate(frame, [80, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-36}>
        <div style={{ position: "relative", width: 980, height: 597 }}>
          <div style={{ opacity: survivorDim }}>
            <PlaneSilhouette showHoles holeProgress={1} />
          </div>
          {/* 幽灵虚线层：同机位淡入 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: ghostIn * 0.55,
              filter: "contrast(0.85) brightness(1.15)",
              mixBlendMode: "screen",
            }}
          >
            <PlaneSilhouette showHoles={false} ghost scale={1} />
          </div>
          <svg
            width={980}
            height={597}
            viewBox="0 0 1000 562"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {VITAL_RINGS.map((r, i) => (
              <ellipse
                key={i}
                cx={r.cx}
                cy={r.cy}
                rx={r.rx}
                ry={r.ry}
                fill="none"
                stroke={COLORS.danger}
                strokeWidth={2.2}
                strokeOpacity={rings * pulse}
                style={{
                  filter: `drop-shadow(0 0 ${10 * pulse}px ${COLORS.danger})`,
                }}
              />
            ))}
            {/* 短指引 */}
            <line
              x1="720"
              y1="70"
              x2="560"
              y2="100"
              stroke={COLORS.danger}
              strokeWidth="1.2"
              strokeOpacity={rings * labelIn * 0.85}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 18,
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
              right: 36,
              top: 36,
              fontFamily: sans.fontFamily,
              fontSize: 22,
              letterSpacing: "0.12em",
              color: COLORS.danger,
              opacity: rings * labelIn,
              textShadow: `0 0 18px ${COLORS.danger}`,
            }}
          >
            没回来的
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

/** 22–28s: 筛子——落下、穿网、金留灰坠 */
const SieveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const meshIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dots = Array.from({ length: 36 }, (_, i) => i);
  const goldLabel = interpolate(frame, [55, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const greyLabel = interpolate(frame, [78, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-50}>
        <svg width={1000} height={500} viewBox="0 0 1000 500">
          <text
            x="500"
            y="34"
            textAnchor="middle"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
            letterSpacing="0.22em"
            opacity={meshIn}
          >
            筛选
          </text>
          {/* 滤网：横线 + 孔距刻度 */}
          <g opacity={meshIn}>
            <line
              x1="80"
              y1="210"
              x2="920"
              y2="210"
              stroke={COLORS.structure}
              strokeWidth="2"
              strokeOpacity="0.55"
            />
            {Array.from({ length: 21 }).map((_, i) => {
              const x = 100 + i * 40;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={200}
                  x2={x}
                  y2={220}
                  stroke={COLORS.structure}
                  strokeWidth="1.4"
                  strokeOpacity={0.35}
                />
              );
            })}
          </g>
          {dots.map((i) => {
            const col = i % 12;
            const row = Math.floor(i / 12);
            const x = 110 + col * 68;
            const startY = 48 + row * 22;
            const survives = i % 4 === 0;
            const drop = interpolate(
              frame,
              [8 + i * 1.1, 55 + i * 0.9],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            // 落到筛线再决定
            const toMesh = Math.min(1, drop / 0.55);
            const after = Math.max(0, (drop - 0.55) / 0.45);
            const meshY = 210;
            let y: number;
            let opacity = 1;
            if (toMesh < 1) {
              y = startY + (meshY - 14 - startY) * toMesh;
            } else if (survives) {
              y = meshY - 14;
              opacity = 1;
            } else {
              y = meshY - 14 + after * (160 + (i % 5) * 12);
              opacity = Math.max(0.05, 1 - after * 0.95);
            }
            const lit = survives && toMesh >= 1;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={lit ? 8 : 5.5}
                fill={lit ? COLORS.surprise : COLORS.ghost}
                opacity={opacity}
              />
            );
          })}
          <text
            x="220"
            y="455"
            fill={COLORS.surprise}
            fontFamily={sans.fontFamily}
            fontSize="22"
            opacity={goldLabel}
          >
            看得见的成功
          </text>
          <text
            x="640"
            y="455"
            fill={COLORS.muted}
            fontFamily={sans.fontFamily}
            fontSize="22"
            opacity={greyLabel}
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

/**
 * 34–42s: 样本流迁移（非三栏 PPT）
 * 顶栏三题指示 → 样本从上方落入筛线 → 金条留下、灰条穿网坠落 → 左侧沉淀
 */
const TransferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const topics = [
    {
      title: "成功学书单",
      keep: "成功者",
      fail: ["失败经验", "半途而废", "没出版的", "沉默样本"],
    },
    {
      title: "爆款复盘",
      keep: "爆款",
      fail: ["扑街稿", "沉默号", "删掉的数据", "未播内容"],
    },
    {
      title: "上岸经验",
      keep: "上岸者",
      fail: ["未录取", "弃考", "转行沉默", "中途离场"],
    },
  ];

  const segment = 80;
  const active = Math.min(2, Math.floor(frame / segment));
  const local = frame - active * segment;
  const topic = topics[active];

  const titleIn = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const approach = interpolate(local, [6, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sift = interpolate(local, [28, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const keepPulse = interpolate(Math.sin((frame + active * 11) / 7), [-1, 1], [
    0.72,
    1,
  ]);
  const keptCount = topics.slice(0, active + (sift > 0.5 ? 1 : 0)).length;

  // 所有样本先成排落入：1 金 + 4 灰
  const chips = [
    { label: topic.keep, survive: true },
    ...topic.fail.map((label) => ({ label, survive: false })),
  ];

  return (
    <Shell>
      <CenterStage y={-36}>
        <div style={{ width: 1560, height: 540, position: "relative" }}>
          {/* 三题进度指示 */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 18,
            }}
          >
            {topics.map((t, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <div
                  key={t.title}
                  style={{
                    padding: "10px 18px",
                    borderBottom: `2px solid ${
                      on || done ? COLORS.surprise : COLORS.line
                    }`,
                    fontFamily: sans.fontFamily,
                    fontSize: 22,
                    color: on ? COLORS.surprise : done ? COLORS.text : COLORS.muted,
                    opacity: on ? 1 : done ? 0.7 : 0.4,
                    letterSpacing: "0.04em",
                  }}
                >
                  {t.title}
                </div>
              );
            })}
          </div>

          {/* 筛线 */}
          <div
            style={{
              position: "absolute",
              left: 100,
              right: 100,
              top: 268,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${COLORS.structure} 10%, ${COLORS.structure} 90%, transparent)`,
              opacity: 0.5,
            }}
          />
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={`tick-${i}`}
              style={{
                position: "absolute",
                left: 140 + i * 58,
                top: 258,
                width: 1,
                height: 22,
                background: COLORS.structure,
                opacity: 0.3,
              }}
            />
          ))}

          {/* 样本芯片流 */}
          {chips.map((chip, i) => {
            const slot = i - (chips.length - 1) / 2;
            const x = 780 + slot * 195;
            const enterY = interpolate(approach, [0, 1], [-80, 0]);
            const fall = chip.survive
              ? 0
              : interpolate(sift, [0.1 + i * 0.06, 0.55 + i * 0.08], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
            const y = 220 + enterY + fall * (150 + (i % 3) * 18);
            const opacity = chip.survive
              ? 0.4 + approach * 0.6
              : Math.max(0.05, approach * (0.85 - fall * 0.8));
            const scale = chip.survive
              ? 0.94 + 0.08 * keepPulse * (sift > 0.25 ? 1 : 0.4)
              : 1 - fall * 0.08;

            return (
              <div
                key={`${topic.title}-${chip.label}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: `translateX(-50%) scale(${scale}) rotate(${
                    chip.survive ? 0 : fall * (slot * 6)
                  }deg)`,
                  padding: chip.survive ? "16px 28px" : "12px 18px",
                  border: chip.survive
                    ? `1.5px solid ${COLORS.surprise}`
                    : `1px dashed rgba(242,244,247,0.28)`,
                  background: chip.survive
                    ? "rgba(232,184,109,0.1)"
                    : "transparent",
                  color: chip.survive ? COLORS.surprise : COLORS.muted,
                  fontFamily: sans.fontFamily,
                  fontSize: chip.survive ? 28 : 20,
                  letterSpacing: "0.06em",
                  opacity: titleIn * opacity,
                  filter: chip.survive ? undefined : `blur(${fall * 2.2}px)`,
                  boxShadow:
                    chip.survive && sift > 0.3
                      ? `0 0 ${22 * keepPulse}px rgba(232,184,109,0.28)`
                      : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.label}
              </div>
            );
          })}

          {/* 左侧沉淀 */}
          <div
            style={{
              position: "absolute",
              left: 40,
              bottom: 28,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: sans.fontFamily,
                fontSize: 16,
                color: COLORS.muted,
                letterSpacing: "0.16em",
                opacity: keptCount ? 0.85 : 0,
              }}
            >
              你只看见
            </div>
            {topics.slice(0, keptCount).map((t, i) => (
              <div
                key={t.title}
                style={{
                  fontFamily: sans.fontFamily,
                  fontSize: 20,
                  color: COLORS.surprise,
                  opacity: 0.55 + i * 0.15,
                }}
              >
                · {t.title}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              right: 56,
              bottom: 36,
              fontFamily: sans.fontFamily,
              fontSize: 18,
              color: COLORS.muted,
              letterSpacing: "0.14em",
              opacity: interpolate(frame, [36, 60], [0, 0.9], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            缺席者落下
          </div>
        </div>
      </CenterStage>
      <EffectSubtitle
        text="成功学书单、爆款复盘、上岸经验……一样。"
        size={40}
      />
    </Shell>
  );
};

/** 42–50s: 十字扫描空框 + ？落下 */
const AskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cluster = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = interpolate(frame, [24, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanX = interpolate(frame, [10, 120], [260, 1320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const qDrop = interpolate(frame, [100, 130], [-40, 0], {
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
              opacity={0.25 + cluster * 0.65}
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
            strokeOpacity={0.8 * box}
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
          {/* 扫描十字，不是数据点 */}
          <g opacity={0.85}>
            <line
              x1={scanX - 22}
              y1={180}
              x2={scanX + 22}
              y2={180}
              stroke={COLORS.structure}
              strokeWidth="1.4"
            />
            <line
              x1={scanX}
              y1={158}
              x2={scanX}
              y2={202}
              stroke={COLORS.structure}
              strokeWidth="1.4"
            />
          </g>
          <text
            x={1120}
            y={195 + qDrop}
            textAnchor="middle"
            fill={COLORS.danger}
            fontFamily={serif.fontFamily}
            fontSize="78"
            opacity={q}
            style={{
              filter: `drop-shadow(0 0 ${16 * q}px ${COLORS.danger})`,
            }}
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

/** 50–60s: 金句闭环 —— 弹孔降透，要害金圈 */
const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const glow = interpolate(frame, [16, 90], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const holeFade = interpolate(frame, [0, 40], [0.95, 0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vital = interpolate(frame, [24, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.55, 1]);
  const brand = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <CenterStage y={-78}>
        <div style={{ position: "relative", width: 980, height: 597 }}>
          <PlaneSilhouette
            showHoles
            holeProgress={1}
            holeOpacity={holeFade}
          />
          <svg
            width={980}
            height={597}
            viewBox="0 0 1000 562"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {VITAL_RINGS.map((r, i) => (
              <ellipse
                key={i}
                cx={r.cx}
                cy={r.cy}
                rx={r.rx}
                ry={r.ry}
                fill={`rgba(232,184,109,${0.06 * vital * pulse})`}
                stroke={COLORS.surprise}
                strokeWidth={2}
                strokeOpacity={vital * pulse}
                style={{
                  filter: `drop-shadow(0 0 ${12 * pulse * vital}px ${COLORS.surprise})`,
                }}
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(232,184,109,${0.1 * glow}) 0%, transparent 62%)`,
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
      <Sequence durationInFrames={10 * FPS} name="00-opening">
        <Opening10s />
      </Sequence>
      <Sequence from={10 * FPS} durationInFrames={12 * FPS} name="05-ghost">
        <GhostRevealScene />
      </Sequence>
      <Sequence from={22 * FPS} durationInFrames={6 * FPS} name="06-sieve">
        <SieveScene />
      </Sequence>
      <Sequence from={28 * FPS} durationInFrames={6 * FPS} name="07-title">
        <TitleScene />
      </Sequence>
      <Sequence from={34 * FPS} durationInFrames={8 * FPS} name="08-transfer">
        <TransferScene />
      </Sequence>
      <Sequence from={42 * FPS} durationInFrames={8 * FPS} name="09-ask">
        <AskScene />
      </Sequence>
      <Sequence from={50 * FPS} durationInFrames={10 * FPS} name="10-close">
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
