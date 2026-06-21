export const STREAK_THEME_CLASSES = [
  "streak-theme-starter",
  "streak-theme-spark",
  "streak-theme-week",
  "streak-theme-bonfire",
  "streak-theme-inferno",
  "streak-theme-mint",
  "streak-theme-forest",
  "streak-theme-diamond",
  "streak-theme-month",
  "streak-theme-blue-flare",
  "streak-theme-frost",
  "streak-theme-quarter",
  "streak-theme-obsidian",
  "streak-theme-golden-flare",
  "streak-theme-storm",
  "streak-theme-cosmic",
  "streak-theme-violet-flare",
  "streak-theme-two-month",
  "streak-theme-cherry",
  "streak-theme-crimson",
];

export const getStreakThemeClass = (
    streak
) => {
  const value = Number(streak) || 0;

  // Red
  if (value >= 365)
    return "streak-theme-crimson";

  // Pink
  if (value >= 300)
    return "streak-theme-cherry";

  // Purple
  if (value >= 270)
    return "streak-theme-two-month";

  // Violet
  if (value >= 240)
    return "streak-theme-violet-flare";

  // Magenta
  if (value >= 210)
    return "streak-theme-cosmic";

  // Indigo
  if (value >= 180)
    return "streak-theme-storm";

  // Golden Yellow
  if (value >= 150)
    return "streak-theme-golden-flare";

  // Black + Gold
  if (value >= 135)
    return "streak-theme-obsidian";

  // Yellow
  if (value >= 120)
    return "streak-theme-quarter";

  // Ice Blue
  if (value >= 105)
    return "streak-theme-frost";

  // Blue
  if (value >= 90)
    return "streak-theme-blue-flare";

  // Sky Blue
  if (value >= 75)
    return "streak-theme-month";

  // White + Cyan
  if (value >= 60)
    return "streak-theme-diamond";

  // Green
  if (value >= 45)
    return "streak-theme-forest";

  // Light Green
  if (value >= 30)
    return "streak-theme-mint";

  // Deep Red/Orange
  if (value >= 21)
    return "streak-theme-inferno";

  // Deep Orange
  if (value >= 14)
    return "streak-theme-bonfire";

  // Orange
  if (value >= 7)
    return "streak-theme-week";

  // Light Orange
  if (value >= 3)
    return "streak-theme-spark";

  return "streak-theme-starter";
};

export const getStreakCardClass = (
    streak
) =>
    getStreakThemeClass(streak).replace(
        "streak-theme-",
        "streak-"
    );

export const getActiveStreakThemeClass =
    () => {
      if (
          typeof document === "undefined"
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

/**
 * Aggressive fire scaling.
 * 0 → 365 streak maps smoothly to 0 → 1.
 * High streaks become significantly more intense.
 */
export const getStreakPower = (
    streak
) => {
  const value = Number(streak) || 0;

  return Math.pow(
      Math.min(
          value / 365,
          1
      ),
      0.65
  );
};