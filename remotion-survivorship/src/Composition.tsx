import React from "react";
import { Composition } from "remotion";
import { Opening10s } from "./Opening10s";
import { SurvivorshipBias } from "./SurvivorshipBias";
import { sans, serif } from "./fonts";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./theme";

const waitFonts = async () => {
  await Promise.all([sans.waitUntilDone(), serif.waitUntilDone()]);
  return {};
};

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="Opening10s"
        component={Opening10s}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        calculateMetadata={waitFonts}
      />
      {/* 全片骨架先挂着，本步不审、不渲染 */}
      <Composition
        id="SurvivorshipBias"
        component={SurvivorshipBias}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        calculateMetadata={waitFonts}
      />
    </>
  );
};
