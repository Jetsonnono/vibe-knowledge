import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  ASK_FROM,
  CLOSE_FROM,
  DURATION_FRAMES,
  FPS,
  OUTRO_FROM,
  SIEVE_FROM,
  TITLE_FROM,
  TRANSFER_FROM,
  GHOST_FROM,
} from "../theme";

const sfx = (name: string) => staticFile(`sfx/${name}.wav`);
const bgmSrc = staticFile("sfx/bgm-survivorship.mp3");

/** 节奏型 BGM：落点对齐卡点，关键 SFX 处自动 duck */
const FullBgm: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  // 冷电子成曲 BGM；duck 仅约 –2～–4dB，避开短留白窗
  let volume = interpolate(
    frame,
    [0, 12, durationInFrames - 35, durationInFrames],
    [0, 0.34, 0.34, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckDing = interpolate(
    frame,
    [55, 60, 72, 88],
    [1, 0.72, 0.75, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckWrong = interpolate(
    frame,
    [242, 248, 265, 285],
    [1, 0.7, 0.74, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckTitle = interpolate(
    frame,
    [TITLE_FROM + 6, TITLE_FROM + 14, TITLE_FROM + 45, TITLE_FROM + 70],
    [1, 0.72, 0.76, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckAsk = interpolate(
    frame,
    [ASK_FROM + 108, ASK_FROM + 115, ASK_FROM + 135, ASK_FROM + 155],
    [1, 0.72, 0.76, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckClose = interpolate(
    frame,
    [CLOSE_FROM + 18, CLOSE_FROM + 26, CLOSE_FROM + 55, CLOSE_FROM + 85],
    [1, 0.7, 0.75, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckOutro = interpolate(
    frame,
    [OUTRO_FROM + 4, OUTRO_FROM + 12, OUTRO_FROM + 40, OUTRO_FROM + 70],
    [1, 0.78, 0.8, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  volume *= duckDing * duckWrong * duckTitle * duckAsk * duckClose * duckOutro;

  return (
    <Audio
      src={bgmSrc}
      volume={volume}
      durationInFrames={durationInFrames}
    />
  );
};

/** 开头 10s 相对时间轴卡点（Opening10s 独立预览也可用） */
export const OpeningBeatAudio: React.FC = () => {
  const frame = useCurrentFrame();
  const bgmVol = interpolate(frame, [0, 15, 280, 300], [0, 0.32, 0.32, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const duck = interpolate(frame, [230, 240, 255, 290], [1, 0.4, 0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Audio
        src={bgmSrc}
        volume={bgmVol * duck}
        durationInFrames={10 * FPS}
      />
      {[8, 16, 24, 32, 40, 48].map((f) => (
        <Sequence key={`tick-${f}`} from={f} durationInFrames={12} layout="none">
          <Audio src={sfx("tick")} volume={0.32} />
        </Sequence>
      ))}
      <Sequence from={60} durationInFrames={45} layout="none">
        <Audio src={sfx("ding")} volume={0.28} />
      </Sequence>
      {[72, 88, 104].map((f) => (
        <Sequence key={`opt-${f}`} from={f} durationInFrames={12} layout="none">
          <Audio src={sfx("click")} volume={0.38} />
        </Sequence>
      ))}
      <Sequence from={210} durationInFrames={30} layout="none">
        <Audio src={sfx("whip")} volume={0.35} />
      </Sequence>
      <Sequence from={240} durationInFrames={40} layout="none">
        <Audio src={sfx("impact")} volume={0.72} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** 全片：完整 BGM + 卡点音效（时长跟随 DURATION_FRAMES） */
export const FullBeatAudio: React.FC = () => {
  const total = DURATION_FRAMES;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <FullBgm durationInFrames={total} />

      {[8, 16, 24, 32, 40, 48].map((f) => (
        <Sequence key={`tick-${f}`} from={f} durationInFrames={12} layout="none">
          <Audio src={sfx("tick")} volume={0.32} />
        </Sequence>
      ))}
      <Sequence from={60} durationInFrames={45} layout="none">
        <Audio src={sfx("ding")} volume={0.28} />
      </Sequence>
      {[72, 88, 104].map((f) => (
        <Sequence key={`opt-${f}`} from={f} durationInFrames={12} layout="none">
          <Audio src={sfx("click")} volume={0.38} />
        </Sequence>
      ))}
      <Sequence from={210} durationInFrames={30} layout="none">
        <Audio src={sfx("whip")} volume={0.35} />
      </Sequence>
      <Sequence from={240} durationInFrames={40} layout="none">
        <Audio src={sfx("impact")} volume={0.72} />
      </Sequence>

      {/* 幽灵红圈 / 无弹孔要害 */}
      <Sequence from={GHOST_FROM + 18} durationInFrames={28} layout="none">
        <Audio src={sfx("whoosh-soft")} volume={0.42} />
      </Sequence>
      <Sequence from={GHOST_FROM + 36} durationInFrames={18} layout="none">
        <Audio src={sfx("tick")} volume={0.28} />
      </Sequence>

      {/* 筛子 */}
      {[18, 28, 38, 48, 58].map((off) => (
        <Sequence
          key={`sieve-${off}`}
          from={SIEVE_FROM + off}
          durationInFrames={10}
          layout="none"
        >
          <Audio src={sfx("tick")} volume={0.22} />
        </Sequence>
      ))}
      <Sequence from={SIEVE_FROM + 70} durationInFrames={25} layout="none">
        <Audio src={sfx("switch")} volume={0.3} />
      </Sequence>

      {/* 片名 */}
      <Sequence from={TITLE_FROM + 8} durationInFrames={50} layout="none">
        <Audio src={sfx("chime")} volume={0.48} />
      </Sequence>

      {/* 三例迁移 */}
      {[0, 80, 160].map((off) => (
        <Sequence
          key={`tr-${off}`}
          from={TRANSFER_FROM + off + 6}
          durationInFrames={20}
          layout="none"
        >
          <Audio src={sfx("page-turn")} volume={0.32} />
        </Sequence>
      ))}
      {[40, 120, 200].map((off) => (
        <Sequence
          key={`fall-${off}`}
          from={TRANSFER_FROM + off}
          durationInFrames={20}
          layout="none"
        >
          <Audio src={sfx("whoosh")} volume={0.22} />
        </Sequence>
      ))}

      {/* 缺席？ */}
      <Sequence from={ASK_FROM + 110} durationInFrames={40} layout="none">
        <Audio src={sfx("ding")} volume={0.4} />
      </Sequence>

      {/* 金句 */}
      <Sequence from={CLOSE_FROM + 20} durationInFrames={50} layout="none">
        <Audio src={sfx("resolve")} volume={0.52} />
      </Sequence>

      {/* outro 收束 */}
      <Sequence from={OUTRO_FROM + 6} durationInFrames={40} layout="none">
        <Audio src={sfx("chime")} volume={0.32} />
      </Sequence>
      <Sequence from={OUTRO_FROM + 55} durationInFrames={35} layout="none">
        <Audio src={sfx("switch")} volume={0.22} />
      </Sequence>
    </AbsoluteFill>
  );
};
