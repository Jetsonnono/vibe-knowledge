import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { sans } from "../fonts";
import { COLORS } from "../theme";

export const Caption: React.FC<{
  text: string;
  appearAt?: number;
  accent?: boolean;
  size?: number;
}> = ({ text, appearAt = 0, accent = false, size = 44 }) => {
  const frame = useCurrentFrame();
  const local = frame - appearAt;
  const opacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(local, [0, 10], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom: 88,
        opacity,
        transform: `translateY(${y}px)`,
        textAlign: "center",
        fontFamily: sans.fontFamily,
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.45,
        color: accent ? COLORS.surprise : COLORS.text,
        letterSpacing: "0.02em",
        textShadow: "0 2px 24px rgba(0,0,0,0.55)",
      }}
    >
      {text}
    </div>
  );
};
