import LogoStarter from "../assets/logo_streak-theme-starter.svg";
import LogoSpark from "../assets/logo_streak-theme-spark.svg";
import LogoWeek from "../assets/logo_streak-theme-week.svg";
import LogoBonfire from "../assets/logo_streak-theme-bonfire.svg";
import LogoFlare from "../assets/logo_streak-theme-flare.svg";
import LogoMonth from "../assets/logo_streak-theme-month.svg";
import LogoBlueFlare from "../assets/logo_streak-theme-blue-flare.svg";
import LogoTwoMonth from "../assets/logo_streak-theme-two-month.svg";
import LogoVioletFlare from "../assets/logo_streak-theme-violet-flare.svg";
import LogoQuarter from "../assets/logo_streak-theme-quarter.svg";

export const LOGOS_BY_THEME = {
  "streak-theme-starter":
    LogoStarter,
  "streak-theme-spark":
    LogoSpark,
  "streak-theme-week":
    LogoWeek,
  "streak-theme-bonfire":
    LogoBonfire,
  "streak-theme-flare":
    LogoFlare,
  "streak-theme-month":
    LogoMonth,
  "streak-theme-blue-flare":
    LogoBlueFlare,
  "streak-theme-two-month":
    LogoTwoMonth,
  "streak-theme-violet-flare":
    LogoVioletFlare,
  "streak-theme-quarter":
    LogoQuarter,
};

export const getLogoForTheme = (
  themeClass
) =>
  LOGOS_BY_THEME[
    themeClass
  ] || LogoStarter;
