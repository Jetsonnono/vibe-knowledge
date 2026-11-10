import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../fonts";
import { COLORS } from "../theme";

export type SubtitleTone = "normal" | "question" | "impact";

/**
 * 字幕出场特效协议
 * normal: 弹簧缩放 + 模糊变清晰 + 金色底线
 * question: 再加关键词着色 + 轻闪光
 * impact: 更大弹簧 + 红闪（给「错了。」类）
 */
export const EffectSubtitle: React.FC<{
  text: string;
  tone?: SubtitleTone;
  emphasize?: string;
  delay?: number;
  size?: number;
  bottom?: number;
}> = ({
  text,
  tone = "normal",
  emphasize,
  delay = 0,
  size = 44,
  bottom = 96,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - delay);

  const enter = spring({
    frame: t,
    fps,
    config:
      tone === "impact"
        ? { damping: 11, stiffness: 160 }
        : { damping: 16, stiffness: 120 },
  });

  const blur = interpolate(t, [0, 12], [6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(t, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const underline = interpolate(t, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(t, [0, 3, 10], [0, tone === "normal" ? 0 : 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scaleBase = tone === "impact" ? 0.82 : 0.92;
  const color =
    tone === "impact"
      ? COLORS.danger
      : tone === "question"
        ? COLORS.text
        : COLORS.text;

  const renderText = () => {
    if (!emphasize || !text.includes(emphasize)) {
      return text;
    }
    const idx = text.indexOf(emphasize);
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: COLORS.surprise }}>{emphasize}</span>
        {text.slice(idx + emphasize.length)}
      </>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom,
        textAlign: "center",
        opacity,
        transform: `scale(${scaleBase + (1 - scaleBase) * enter})`,
        filter: `blur(${blur}px)`,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          fontFamily: sans.fontFamily,
          fontSize: size,
          fontWeight: tone === "impact" ? 700 : 500,
          lineHeight: 1.45,
          color,
          letterSpacing: "0.02em",
          textShadow: `0 0 ${24 * flash}px ${
            tone === "impact" ? COLORS.danger : COLORS.surprise
          }, 0 2px 20px rgba(0,0,0,0.55)`,
        }}
      >
        {renderText()}
        {tone !== "impact" ? (
          <div
            style={{
              margin: "14px auto 0",
              height: 2,
              width: `${Math.max(48, text.length * 18) * underline}px`,
              background: COLORS.surprise,
              boxShadow: `0 0 12px ${COLORS.surprise}`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
