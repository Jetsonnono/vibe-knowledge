export const COLORS = {
  bg: "#0B0D10",
  bgSoft: "#12151A",
  structure: "#7EB6FF",
  surprise: "#E8B86D",
  danger: "#FF6B6B",
  text: "#F2F4F7",
  muted: "rgba(242, 244, 247, 0.55)",
  line: "rgba(126, 182, 255, 0.35)",
  ghost: "rgba(242, 244, 247, 0.18)",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** 全片节拍（可短于 60s；优先去停留） */
export const OPENING_DUR = 10 * FPS;
export const GHOST_DUR = 4 * FPS; // 无弹孔要害展示：原 12s → ~4s
export const SIEVE_DUR = 6 * FPS;
export const TITLE_DUR = 6 * FPS;
export const TRANSFER_DUR = 8 * FPS;
export const ASK_DUR = 8 * FPS;
export const CLOSE_DUR = 6 * FPS;
export const OUTRO_DUR = 4 * FPS;

export const GHOST_FROM = OPENING_DUR;
export const SIEVE_FROM = GHOST_FROM + GHOST_DUR;
export const TITLE_FROM = SIEVE_FROM + SIEVE_DUR;
export const TRANSFER_FROM = TITLE_FROM + TITLE_DUR;
export const ASK_FROM = TRANSFER_FROM + TRANSFER_DUR;
export const CLOSE_FROM = ASK_FROM + ASK_DUR;
export const OUTRO_FROM = CLOSE_FROM + CLOSE_DUR;
export const DURATION_FRAMES =
  OPENING_DUR +
  GHOST_DUR +
  SIEVE_DUR +
  TITLE_DUR +
  TRANSFER_DUR +
  ASK_DUR +
  CLOSE_DUR +
  OUTRO_DUR;

export const FONT_SANS =
  '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const FONT_SERIF =
  '"Noto Serif SC", "Songti SC", "SimSun", serif';
