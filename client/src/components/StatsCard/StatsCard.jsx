import CountUpModule from "react-countup";
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
      lower.includes(
        "completion"
      )
    )
      return "completion";

    if (
      lower.includes("streak")
    )
      return "streak";

    return "default";
  };

  return (
    <div
      className={`stats-card ${getCardType()}`}
    >
      <div className="card-shine" />

      <div className="stats-top">
        <div>
          <p className="stats-title">
            {title}
          </p>

          {subtitle && (
            <span className="stats-subtitle">
              {subtitle}
            </span>
          )}
        </div>

        {icon && (
          <div className="stats-icon">
            {icon}
          </div>
        )}
      </div>

      <h2 className="stats-value">
        <CountUp
          start={0}
          end={numericValue}
          duration={1.3}
        />

        {showPercent && "%"}
      </h2>
    </div>
  );
};

export default StatsCard;