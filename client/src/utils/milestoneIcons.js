import StarterIcon from "../assets/milestones/streak-theme-starter__orange-energy-dot.svg";
import SparkIcon from "../assets/milestones/streak-theme-spark__electric-spark.svg";
import WeekIcon from "../assets/milestones/streak-theme-week__trophy-chip.svg";
import BonfireIcon from "../assets/milestones/streak-theme-bonfire__burning-log.svg";
import InfernoIcon from "../assets/milestones/streak-theme-inferno_lava-crystal.svg";
import MintIcon from "../assets/milestones/streak-theme-mint__fresh-energy-orb.svg";
import ForestIcon from "../assets/milestones/streak-theme-forest__emerald-leaf.svg";
import DiamondIcon from "../assets/milestones/streak-theme-diamond__prism-shard.svg";
import MonthIcon from "../assets/milestones/streak-theme-month__progress-ring.svg";
import BlueFlareIcon from "../assets/milestones/streak-theme-blue-flare__energy-blade.svg";
import FrostIcon from "../assets/milestones/streak-theme-frost_snowflake.svg";
import QuarterIcon from "../assets/milestones/streak-theme-quarter__purple-progress-coin.svg";
import ObsidianIcon from "../assets/milestones/streak-theme-obsidian__black-purple-shard.svg";
import GoldenFlareIcon from "../assets/milestones/streak-theme-golden-flare__radiant-laurel.svg";
import StormIcon from "../assets/milestones/streak-theme-storm_lightning.svg";
import CosmicIcon from "../assets/milestones/streak-theme-cosmic__galaxy-ring.svg";
import VioletFlareIcon from "../assets/milestones/streak-theme-violet-flare__purple-phoenix-feather.svg";
import TwoMonthIcon from "../assets/milestones/streak-theme-two-month__twin-gems.svg";
import CherryIcon from "../assets/milestones/streak-theme-cherry__cherry-blossom-petal.svg";
import CrimsonIcon from "../assets/milestones/streak-theme-crimson__intense-power-core.svg";

const MILESTONE_ICONS_BY_THEME = {
  "streak-theme-starter": StarterIcon,
  "streak-theme-spark": SparkIcon,
  "streak-theme-week": WeekIcon,
  "streak-theme-bonfire": BonfireIcon,
  "streak-theme-inferno": InfernoIcon,
  "streak-theme-mint": MintIcon,
  "streak-theme-forest": ForestIcon,
  "streak-theme-diamond": DiamondIcon,
  "streak-theme-month": MonthIcon,
  "streak-theme-blue-flare": BlueFlareIcon,
  "streak-theme-frost": FrostIcon,
  "streak-theme-quarter": QuarterIcon,
  "streak-theme-obsidian": ObsidianIcon,
  "streak-theme-golden-flare": GoldenFlareIcon,
  "streak-theme-storm": StormIcon,
  "streak-theme-cosmic": CosmicIcon,
  "streak-theme-violet-flare": VioletFlareIcon,
  "streak-theme-two-month": TwoMonthIcon,
  "streak-theme-cherry": CherryIcon,
  "streak-theme-crimson": CrimsonIcon,
};

export const getMilestoneIconForTheme = (themeClass) =>
  MILESTONE_ICONS_BY_THEME[themeClass] || StarterIcon;
