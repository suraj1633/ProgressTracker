import "./DifficultyBadge.css";

const DifficultyBadge = ({
  difficulty,
}) => {
  return (
    <span
      className={`difficulty-pill ${difficulty.toLowerCase()}`}
    >
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;