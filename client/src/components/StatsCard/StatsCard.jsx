import { useEffect } from "react";
import CountUpModule from "react-countup";
import {
  getStreakCardClass,
} from "../../utils/streakTheme";
import "./StatsCard.css";

const CountUp =
  CountUpModule.default ||
  CountUpModule;

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
}) => {
  const numericValue =
    parseInt(value) || 0;

  const showPercent =
    typeof value === "string" &&
    value.includes("%");

  const getCardType = () => {
    const lower =
      title.toLowerCase();

    if (lower.includes("easy"))
      return "easy";

    if (
      lower.includes("medium")
    )
      return "medium";

    if (lower.includes("hard"))
      return "hard";

    if (
      lower.includes("solved")
    )
      return "solved";

    if (
      lower.includes("streak")
    )
      return "streak";

    return "default";
  };

  const cardType = getCardType();

  const streakPower =
    cardType === "streak"
      ? Math.min(
          Math.sqrt(
            numericValue
          ) / Math.sqrt(30),
          1
        )
      : 0;

  const getStreakTier = () => {
    if (cardType !== "streak")
      return "";

    return getStreakCardClass(
      numericValue
    );
  };

  const streakTier =
    getStreakTier();

  useEffect(() => {
    if (cardType !== "streak")
      return;

    window.dispatchEvent(
      new CustomEvent(
        "streak-theme-change",
        {
          detail: {
            streak:
              numericValue,
          },
        }
      )
    );
  }, [cardType, numericValue]);

  return (
    <div
      className={`stats-card ${cardType} ${streakTier}`}
      style={{
        "--streak-power":
          streakPower,
      }}
    >
      <div
        className={`stats-art stats-art-${cardType}`}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="stats-top">
        <div className="stats-copy">
          <p className="stats-title">
            {title}
          </p>
        </div>

        {icon && (
          <div className="stats-icon">
            {icon}
          </div>
        )}
      </div>

      <div className="stats-body">
        <h2 className="stats-value">
          <CountUp
            start={0}
            end={numericValue}
            duration={1.3}
          />

          {showPercent && "%"}
        </h2>

        {subtitle && (
          <span className="stats-subtitle">
            {subtitle}
          </span>
        )}
      </div>

    </div>
  );
};

export default StatsCard;
