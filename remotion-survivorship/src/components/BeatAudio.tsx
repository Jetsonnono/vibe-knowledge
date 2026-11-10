import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FPS } from "../theme";

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
  // ~–3dB ≈ 0.70；留白窗内不叠加 duck（impact 前 7.6–8.0s / resolve 前 50.25–50.75s）
  const duckDing = interpolate(
    frame,
    [55, 60, 72, 88],
    [1, 0.72, 0.75, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // impact：从命中后开始轻 duck，避开 7.6–8.0 轻收窗
  const duckWrong = interpolate(
    frame,
    [242, 248, 265, 285],
    [1, 0.7, 0.74, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckTitle = interpolate(
    frame,
    [28 * FPS + 6, 28 * FPS + 14, 28 * FPS + 45, 28 * FPS + 70],
    [1, 0.72, 0.76, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duckAsk = interpolate(
    frame,
    [42 * FPS + 108, 42 * FPS + 115, 42 * FPS + 135, 42 * FPS + 155],
    [1, 0.72, 0.76, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // resolve：命中后轻 duck，避开 50.25–50.75 轻收窗（~1507–1522f）
  const duckClose = interpolate(
    frame,
    [50 * FPS + 26, 50 * FPS + 34, 50 * FPS + 70, 50 * FPS + 100],
    [1, 0.7, 0.75, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  volume *= duckDing * duckWrong * duckTitle * duckAsk * duckClose;

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
      {/* 弹孔点亮轻点 */}
      {[8, 16, 24, 32, 40, 48].map((f) => (
        <Sequence key={`tick-${f}`} from={f} durationInFrames={12} layout="none">
          <Audio src={sfx("tick")} volume={0.32} />
        </Sequence>
      ))}
      {/* 提问 */}
      <Sequence from={60} durationInFrames={45} layout="none">
        <Audio src={sfx("ding")} volume={0.28} />
      </Sequence>
      {/* A/B/C 入场 */}
      {[72, 88, 104].map((f) => (
        <Sequence key={`opt-${f}`} from={f} durationInFrames={12} layout="none">
          <Audio src={sfx("click")} volume={0.38} />
        </Sequence>
      ))}
      {/* 划掉多数人答案 */}
      <Sequence from={210} durationInFrames={30} layout="none">
        <Audio src={sfx("whip")} volume={0.35} />
      </Sequence>
      {/* 「错了。」重拍 */}
      <Sequence from={240} durationInFrames={40} layout="none">
        <Audio src={sfx("impact")} volume={0.72} />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * 全片 60s：完整 BGM + 卡点音效
 */
export const FullBeatAudio: React.FC = () => {
  const total = 60 * FPS;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <FullBgm durationInFrames={total} />

      {/* —— 0–10s 开头卡点（BGM 已由 FullBgm 播，这里只挂 SFX） —— */}
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

      {/* 幽灵红圈 / 反转 */}
      <Sequence from={10 * FPS + 40} durationInFrames={30} layout="none">
        <Audio src={sfx("whoosh-soft")} volume={0.42} />
      </Sequence>
      <Sequence from={10 * FPS + 70} durationInFrames={20} layout="none">
        <Audio src={sfx("tick")} volume={0.28} />
      </Sequence>

      {/* 筛子 */}
      {[18, 28, 38, 48, 58].map((off) => (
        <Sequence
          key={`sieve-${off}`}
          from={22 * FPS + off}
          durationInFrames={10}
          layout="none"
        >
          <Audio src={sfx("tick")} volume={0.22} />
        </Sequence>
      ))}
      <Sequence from={22 * FPS + 70} durationInFrames={25} layout="none">
        <Audio src={sfx("switch")} volume={0.3} />
      </Sequence>

      {/* 片名 */}
      <Sequence from={28 * FPS + 8} durationInFrames={50} layout="none">
        <Audio src={sfx("chime")} volume={0.48} />
      </Sequence>

      {/* 三例迁移 */}
      {[0, 80, 160].map((off) => (
        <Sequence
          key={`tr-${off}`}
          from={34 * FPS + off + 6}
          durationInFrames={20}
          layout="none"
        >
          <Audio src={sfx("page-turn")} volume={0.32} />
        </Sequence>
      ))}
      {[40, 120, 200].map((off) => (
        <Sequence
          key={`fall-${off}`}
          from={34 * FPS + off}
          durationInFrames={20}
          layout="none"
        >
          <Audio src={sfx("whoosh")} volume={0.22} />
        </Sequence>
      ))}

      {/* 缺席？ */}
      <Sequence from={42 * FPS + 110} durationInFrames={40} layout="none">
        <Audio src={sfx("ding")} volume={0.4} />
      </Sequence>

      {/* 金句 */}
      <Sequence from={50 * FPS + 24} durationInFrames={55} layout="none">
        <Audio src={sfx("resolve")} volume={0.52} />
      </Sequence>
    </AbsoluteFill>
  );
};
