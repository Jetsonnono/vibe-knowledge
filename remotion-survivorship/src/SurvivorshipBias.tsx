import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FullBeatAudio } from "./components/BeatAudio";
import { EffectSubtitle } from "./components/EffectSubtitle";
import { PlaneSilhouette } from "./components/Plane";
import { CenterStage, FadeScene, Shell } from "./components/Shell";
import { Opening10s } from "./Opening10s";
import { sans, serif } from "./fonts";
import { COLORS, FPS } from "./theme";

/**
 * 全片 60s · 前 10s 复用已锁定 Opening10s
 * 后 50s 体检修订：迁移居中、筛子灰影、片名去重、收束分层、段间淡入、扫描线
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
  // 红圈提前半秒出
  const rings = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.45, 1]);
  const labelIn = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell sweep>
      <CenterStage y={-36}>
        <div style={{ position: "relative", width: 980, height: 597 }}>
          <div style={{ opacity: survivorDim }}>
            <PlaneSilhouette showHoles holeProgress={1} />
          </div>
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
                strokeWidth={2.4}
                strokeOpacity={rings * pulse}
                style={{
                  filter: `drop-shadow(0 0 ${10 * pulse}px ${COLORS.danger})`,
                }}
              />
            ))}
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
              color: COLORS.text,
              opacity: labelIn * 0.78,
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

/** 22–28s: 筛子 —— 金点略增，灰点坠后留残影 */
const SieveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const meshIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dots = Array.from({ length: 42 }, (_, i) => i);
  const goldLabel = interpolate(frame, [55, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const greyLabel = interpolate(frame, [70, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell sweep>
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
            const col = i % 14;
            const row = Math.floor(i / 14);
            const x = 100 + col * 58;
            const startY = 48 + row * 24;
            // ~14 金点：约每 3 个留 1
            const survives = i % 3 === 0;
            const drop = interpolate(
              frame,
              [8 + i * 0.95, 52 + i * 0.75],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
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
              // 坠落后在底部留淡残影约 1s
              const fallY = meshY - 14 + after * (150 + (i % 5) * 10);
              y = Math.min(fallY, 400 + (i % 7) * 4);
              const residual = interpolate(frame, [70, 100, 140, 170], [0.22, 0.22, 0.12, 0.05], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              opacity =
                after < 1
                  ? Math.max(0.08, 1 - after * 0.85)
                  : residual;
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

/** 28–34s: 片名卡 —— 底栏只留「这叫——」 */
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
    <Shell sweep>
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
      <EffectSubtitle text="这叫——" size={36} bottom={110} />
    </Shell>
  );
};

/**
 * 34–42s: 样本流 —— 金条居中落筛线；换题 10 帧淡化；灰条坠更深
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

  // 换题淡化：段首 0–10 淡入，段末 70–80 淡出（末题不淡出）
  const topicFade =
    active < 2
      ? interpolate(local, [0, 10, 70, 80], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(local, [0, 10], [0, 1], {
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

  // 金条居中：失败分列两侧
  const fails = topic.fail;
  const leftFails = fails.slice(0, 2);
  const rightFails = fails.slice(2);

  return (
    <Shell sweep>
      <CenterStage y={-36}>
        <div style={{ width: 1560, height: 540, position: "relative" }}>
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
                    color: on
                      ? COLORS.surprise
                      : done
                        ? COLORS.text
                        : COLORS.muted,
                    opacity: on ? 1 : done ? 0.7 : 0.4,
                    letterSpacing: "0.04em",
                  }}
                >
                  {t.title}
                </div>
              );
            })}
          </div>

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

          <div style={{ opacity: topicFade }}>
            {/* 金条：居中落在筛线上 */}
            {(() => {
              const enterY = interpolate(approach, [0, 1], [-90, 0]);
              const y = 236 + enterY;
              return (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: y,
                    transform: `translateX(-50%) scale(${
                      0.94 + 0.08 * keepPulse * (sift > 0.25 ? 1 : 0.4)
                    })`,
                    padding: "16px 32px",
                    border: `1.5px solid ${COLORS.surprise}`,
                    background: "rgba(232,184,109,0.1)",
                    color: COLORS.surprise,
                    fontFamily: sans.fontFamily,
                    fontSize: 28,
                    letterSpacing: "0.08em",
                    opacity: 0.35 + approach * 0.65,
                    boxShadow:
                      sift > 0.3
                        ? `0 0 ${22 * keepPulse}px rgba(232,184,109,0.28)`
                        : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topic.keep}
                </div>
              );
            })()}

            {/* 左侧失败 */}
            {leftFails.map((label, i) => {
              const fall = interpolate(
                sift,
                [0.08 + i * 0.08, 0.5 + i * 0.1],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const enterY = interpolate(approach, [0, 1], [-70, 0]);
              const x = 780 - 220 - i * 200;
              const y = 236 + enterY + fall * (190 + i * 20);
              return (
                <div
                  key={label}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    transform: `translateX(-50%) rotate(${-fall * (6 + i * 3)}deg)`,
                    padding: "12px 18px",
                    border: "1px dashed rgba(242,244,247,0.28)",
                    color: COLORS.muted,
                    fontFamily: sans.fontFamily,
                    fontSize: 20,
                    opacity: Math.max(0.04, approach * (0.85 - fall * 0.82)),
                    filter: `blur(${fall * 2.4}px)`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              );
            })}

            {/* 右侧失败 */}
            {rightFails.map((label, i) => {
              const fall = interpolate(
                sift,
                [0.12 + i * 0.08, 0.55 + i * 0.1],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const enterY = interpolate(approach, [0, 1], [-70, 0]);
              const x = 780 + 220 + i * 200;
              const y = 236 + enterY + fall * (190 + i * 20);
              return (
                <div
                  key={label}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    transform: `translateX(-50%) rotate(${fall * (6 + i * 3)}deg)`,
                    padding: "12px 18px",
                    border: "1px dashed rgba(242,244,247,0.28)",
                    color: COLORS.muted,
                    fontFamily: sans.fontFamily,
                    fontSize: 20,
                    opacity: Math.max(0.04, approach * (0.85 - fall * 0.82)),
                    filter: `blur(${fall * 2.4}px)`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

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

/** 42–50s: 十字扫到空框后淡出，再落？ */
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
  const scanX = interpolate(frame, [10, 105], [260, 1120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanFade = interpolate(frame, [95, 115], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q = interpolate(frame, [110, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const qDrop = interpolate(frame, [110, 138], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell sweep>
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
          <g opacity={0.9 * scanFade}>
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

/** 50–56s: 金句落地（去尾部长停留；品牌收束挪到 outro） */
const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const glow = interpolate(frame, [10, 55], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const holeFade = interpolate(frame, [0, 32], [0.9, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vital = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 0→1：红 → 金
  const toGold = interpolate(frame, [28, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.55, 1]);

  const stroke = toGold < 0.5 ? COLORS.danger : COLORS.surprise;
  const fillA =
    toGold < 0.5 ? 0.05 * vital * pulse : 0.07 * vital * pulse;

  return (
    <Shell sweep>
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
                fill={
                  toGold < 0.5
                    ? `rgba(255,107,107,${fillA})`
                    : `rgba(232,184,109,${fillA})`
                }
                stroke={stroke}
                strokeWidth={2.6}
                strokeOpacity={vital * pulse}
                style={{
                  filter: `drop-shadow(0 0 ${14 * pulse * vital}px ${stroke})`,
                }}
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(232,184,109,${0.1 * glow * toGold}) 0%, transparent 62%)`,
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
    </Shell>
  );
};

const OUTRO_BEATS = [
  { label: "看见幸存者", sub: "返航样本" },
  { label: "缺席样本", sub: "没回来的" },
  { label: "筛子的洞", sub: "成功外观" },
] as const;

/** 56–60s: 冷电子收束 — 三点回扣 + 品牌 */
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const veil = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brand = interpolate(frame, [55, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Shell>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(126,182,255,0.08) 0%, transparent 55%)",
          opacity: veil,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 280,
          display: "flex",
          justifyContent: "center",
          gap: 48,
        }}
      >
        {OUTRO_BEATS.map((b, i) => {
          const local = frame - i * 10;
          const enter = spring({
            frame: Math.max(0, local),
            fps,
            config: { damping: 16, stiffness: 120 },
          });
          return (
            <div
              key={b.label}
              style={{
                flex: 1,
                maxWidth: 320,
                textAlign: "center",
                opacity: enter * veil,
                transform: `translateY(${(1 - enter) * 18}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: sans.fontFamily,
                  fontSize: 15,
                  letterSpacing: "0.28em",
                  color: COLORS.muted,
                  marginBottom: 10,
                }}
              >
                {b.sub}
              </div>
              <div
                style={{
                  fontFamily: serif.fontFamily,
                  fontSize: 34,
                  fontWeight: 700,
                  color: i === 2 ? COLORS.surprise : COLORS.text,
                  letterSpacing: "0.06em",
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  margin: "14px auto 0",
                  width: 36 * enter,
                  height: 1.5,
                  background: i === 2 ? COLORS.surprise : COLORS.structure,
                  opacity: 0.85,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 220,
          right: 220,
          bottom: 210,
          textAlign: "center",
          fontFamily: sans.fontFamily,
          fontSize: 22,
          letterSpacing: "0.14em",
          color: COLORS.muted,
          opacity: line,
        }}
      >
        先找缺席者 · 再谈成功学
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 88,
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
  const ghostDur = 12 * FPS;
  const sieveDur = 6 * FPS;
  const titleDur = 6 * FPS;
  const transferDur = 8 * FPS;
  const askDur = 8 * FPS;
  // 金句段去尾部停留：10s → 6s；腾出 4s 给 outro
  const closeDur = 6 * FPS;
  const outroDur = 4 * FPS;
  const closeFrom = 50 * FPS;
  const outroFrom = closeFrom + closeDur;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <FullBeatAudio />
      <Sequence durationInFrames={10 * FPS} name="00-opening">
        {/* 全片音轨由 FullBeatAudio 统一播，避免开头 SFX 叠两遍 */}
        <Opening10s withAudio={false} />
      </Sequence>
      <Sequence from={10 * FPS} durationInFrames={ghostDur} name="05-ghost">
        <FadeScene durationInFrames={ghostDur} fade={10}>
          <GhostRevealScene />
        </FadeScene>
      </Sequence>
      <Sequence from={22 * FPS} durationInFrames={sieveDur} name="06-sieve">
        <FadeScene durationInFrames={sieveDur} fade={10}>
          <SieveScene />
        </FadeScene>
      </Sequence>
      <Sequence from={28 * FPS} durationInFrames={titleDur} name="07-title">
        <FadeScene durationInFrames={titleDur} fade={10}>
          <TitleScene />
        </FadeScene>
      </Sequence>
      <Sequence
        from={34 * FPS}
        durationInFrames={transferDur}
        name="08-transfer"
      >
        <FadeScene durationInFrames={transferDur} fade={10}>
          <TransferScene />
        </FadeScene>
      </Sequence>
      <Sequence from={42 * FPS} durationInFrames={askDur} name="09-ask">
        <FadeScene durationInFrames={askDur} fade={10}>
          <AskScene />
        </FadeScene>
      </Sequence>
      <Sequence from={closeFrom} durationInFrames={closeDur} name="10-close">
        <FadeScene durationInFrames={closeDur} fade={8}>
          <CloseScene />
        </FadeScene>
      </Sequence>
      <Sequence from={outroFrom} durationInFrames={outroDur} name="11-outro">
        <FadeScene durationInFrames={outroDur} fade={8}>
          <OutroScene />
        </FadeScene>
      </Sequence>
    </AbsoluteFill>
  );
};
