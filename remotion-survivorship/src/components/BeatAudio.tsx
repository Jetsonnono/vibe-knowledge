import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../theme";

const sfx = (name: string) => staticFile(`sfx/${name}.wav`);

/** 开头 10s 相对时间轴卡点（Opening10s 独立预览也可用） */
export const OpeningBeatAudio: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
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

const PadBed: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const volume = interpolate(
    frame,
    [0, 20, durationInFrames - 40, durationInFrames],
    [0, 0.1, 0.1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <Audio src={sfx("pad")} volume={volume} loop />;
};

/**
 * 全片 60s 卡点音效 + 极轻垫底
 * 对齐视觉节拍：弹孔 / 错了 / 幽灵 / 筛子 / 片名 / 迁移 / ？ / 金句
 */
export const FullBeatAudio: React.FC = () => {
  const total = 60 * FPS;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <PadBed durationInFrames={total} />

      {/* —— 0–10s 开头 —— */}
      <OpeningBeatAudio />

      {/* 幽灵红圈 / 反转 */}
      <Sequence from={10 * FPS + 40} durationInFrames={30} layout="none">
        <Audio src={sfx("whoosh-soft")} volume={0.42} />
      </Sequence>
      <Sequence from={10 * FPS + 70} durationInFrames={20} layout="none">
        <Audio src={sfx("tick")} volume={0.28} />
      </Sequence>

      {/* 筛子：落入 + 金点亮 */}
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

      {/* 三例迁移换题 */}
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
      {/* 失败坠落轻声 */}
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

      {/* 缺席？落下 */}
      <Sequence from={42 * FPS + 110} durationInFrames={40} layout="none">
        <Audio src={sfx("ding")} volume={0.4} />
      </Sequence>

      {/* 金句收束 */}
      <Sequence from={50 * FPS + 24} durationInFrames={55} layout="none">
        <Audio src={sfx("resolve")} volume={0.52} />
      </Sequence>
    </AbsoluteFill>
  );
};
