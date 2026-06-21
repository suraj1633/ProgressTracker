export const STREAK_THEME_CLASSES = [
  "streak-theme-starter",
  "streak-theme-spark",
  "streak-theme-week",
  "streak-theme-bonfire",
  "streak-theme-flare",
  "streak-theme-month",
  "streak-theme-blue-flare",
  "streak-theme-two-month",
  "streak-theme-violet-flare",
  "streak-theme-quarter",
];

export const getStreakThemeClass = (
  streak
) => {
  const value =
    Number(streak) || 0;

  if (value >= 90)
    return "streak-theme-quarter";

  if (value >= 75)
    return "streak-theme-violet-flare";

  if (value >= 60)
    return "streak-theme-two-month";

  if (value >= 45)
    return "streak-theme-blue-flare";

  if (value >= 30)
    return "streak-theme-month";

  if (value >= 21)
    return "streak-theme-flare";

  if (value >= 14)
    return "streak-theme-bonfire";

  if (value >= 7)
    return "streak-theme-week";

  if (value >= 3)
    return "streak-theme-spark";

  return "streak-theme-starter";
};

export const getStreakCardClass = (
  streak
) =>
  getStreakThemeClass(streak)
    .replace(
      "streak-theme-",
      "streak-"
    );

export const getActiveStreakThemeClass =
  () => {
    if (
      typeof document ===
      "undefined"
    ) {
      return "streak-theme-starter";
    }

    return (
      STREAK_THEME_CLASSES.find(
        (themeClass) =>
          document.documentElement.classList.contains(
            themeClass
          )
      ) || "streak-theme-starter"
    );
  };
