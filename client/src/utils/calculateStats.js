export const calculateStats = (topics) => {
  const totalProblems = topics.length;

  const solvedProblems = topics.filter(
    (topic) => topic.completed
  ).length;

  const easySolved = topics.filter(
    (topic) =>
      topic.completed &&
      topic.difficulty === "Easy"
  ).length;

  const mediumSolved = topics.filter(
    (topic) =>
      topic.completed &&
      topic.difficulty === "Medium"
  ).length;

  const hardSolved = topics.filter(
    (topic) =>
      topic.completed &&
      topic.difficulty === "Hard"
  ).length;

  const completionPercentage =
    totalProblems === 0
      ? 0
      : Math.round(
          (solvedProblems / totalProblems) * 100
        );

  return {
    totalProblems,
    solvedProblems,
    easySolved,
    mediumSolved,
    hardSolved,
    completionPercentage,
  };
};