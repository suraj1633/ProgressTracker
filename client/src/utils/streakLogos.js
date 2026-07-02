import LogoStarter from "../assets/logo_streak-theme-starter.svg";
import LogoSpark from "../assets/logo_streak-theme-spark.svg";
import LogoWeek from "../assets/logo_streak-theme-week.svg";
import LogoBonfire from "../assets/logo_streak-theme-bonfire.svg";
import LogoInferno from "../assets/logo_streak-theme-inferno.svg";

import LogoMint from "../assets/logo_streak-theme-mint.svg";
import LogoForest from "../assets/logo_streak-theme-forest.svg";

import LogoDiamond from "../assets/logo_streak-theme-diamond.svg";
import LogoMonth from "../assets/logo_streak-theme-month.svg";
import LogoBlueFlare from "../assets/logo_streak-theme-blue-flare.svg";
import LogoFrost from "../assets/logo_streak-theme-frost.svg";

import LogoQuarter from "../assets/logo_streak-theme-quarter.svg";
import LogoObsidian from "../assets/logo_streak-theme-obsidian.svg";
import LogoGoldenFlare from "../assets/logo_streak-theme-golden-flare.svg";

import LogoStorm from "../assets/logo_streak-theme-storm.svg";
import LogoCosmic from "../assets/logo_streak-theme-cosmic.svg";
import LogoVioletFlare from "../assets/logo_streak-theme-violet-flare.svg";

import LogoTwoMonth from "../assets/logo_streak-theme-two-month.svg";

import LogoCherry from "../assets/logo_streak-theme-cherry.svg";
import LogoCrimson from "../assets/logo_streak-theme-crimson.svg";

export const LOGOS_BY_THEME = {
  "streak-theme-first-steps": LogoStarter,
  "streak-theme-starter": LogoStarter,
  "streak-theme-spark": LogoSpark,
  "streak-theme-week": LogoWeek,
  "streak-theme-bonfire": LogoBonfire,
  "streak-theme-inferno": LogoInferno,

  "streak-theme-mint": LogoMint,
  "streak-theme-forest": LogoForest,

  "streak-theme-diamond": LogoDiamond,
  "streak-theme-month": LogoMonth,
  "streak-theme-blue-flare": LogoBlueFlare,
  "streak-theme-frost": LogoFrost,

  "streak-theme-quarter": LogoQuarter,
  "streak-theme-obsidian": LogoObsidian,
  "streak-theme-golden-flare": LogoGoldenFlare,

  "streak-theme-storm": LogoStorm,
  "streak-theme-cosmic": LogoCosmic,
  "streak-theme-violet-flare": LogoVioletFlare,

  "streak-theme-two-month": LogoTwoMonth,

  "streak-theme-cherry": LogoCherry,
  "streak-theme-crimson": LogoCrimson,
};

export const getLogoForTheme = (themeClass) => {
  return (
      LOGOS_BY_THEME[themeClass] ||
      LogoStarter
  );
};
