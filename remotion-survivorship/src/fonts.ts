import { loadFont as loadSans } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as loadSerif } from "@remotion/google-fonts/NotoSerifSC";

export const sans = loadSans("normal", {
  weights: ["500"],
  subsets: ["chinese-simplified"],
  ignoreTooManyRequestsWarning: true,
});

export const serif = loadSerif("normal", {
  weights: ["700"],
  subsets: ["chinese-simplified"],
  ignoreTooManyRequestsWarning: true,
});
