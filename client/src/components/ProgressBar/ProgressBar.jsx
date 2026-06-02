import "./ProgressBar.css";

const ProgressBar = ({
  completed = 0,
  total = 0,
}) => {
  const percentage =
    total === 0
      ? 0
      : (
          (completed / total) *
          100
        ).toFixed(1);

  return (
    <div className="progress-wrapper">
      <div className="progress-info">
        <span>
          {completed} / {total}
        </span>

        <span>
          {percentage}%
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;