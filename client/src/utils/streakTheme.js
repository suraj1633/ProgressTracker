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

export const STREAK_MILESTONES = [
  {
    days: 0,
    themeClass: "streak-theme-starter",
  },
  {
    days: 3,
    themeClass: "streak-theme-spark",
  },
  {
    days: 7,
    themeClass: "streak-theme-week",
  },
  {
    days: 14,
    themeClass: "streak-theme-bonfire",
  },
  {
    days: 21,
    themeClass: "streak-theme-inferno",
  },
  {
    days: 30,
    themeClass: "streak-theme-mint",
  },
  {
    days: 45,
    themeClass: "streak-theme-forest",
  },
  {
    days: 60,
    themeClass: "streak-theme-diamond",
  },
  {
    days: 75,
    themeClass: "streak-theme-month",
  },
  {
    days: 90,
    themeClass: "streak-theme-blue-flare",
  },
  {
    days: 105,
    themeClass: "streak-theme-frost",
  },
  {
    days: 120,
    themeClass: "streak-theme-quarter",
  },
  {
    days: 145,
    themeClass: "streak-theme-golden-flare",
  },
  {
    days: 180,
    themeClass: "streak-theme-storm",
  },
  {
    days: 210,
    themeClass: "streak-theme-cosmic",
  },
  {
    days: 240,
    themeClass: "streak-theme-violet-flare",
  },
  {
    days: 270,
    themeClass: "streak-theme-two-month",
  },
  {
    days: 300,
    themeClass: "streak-theme-cherry",
  },
  {
    days: 365,
    themeClass: "streak-theme-crimson",
  },
];

export const STREAK_THEME_STORAGE_KEY =
  "activeStreakTheme";

export const getStoredStreakThemeClass =
    () => {
      if (
          typeof window === "undefined"
      ) {
        return "streak-theme-starter";
      }

      let storedTheme =
        "streak-theme-starter";

      try {
        storedTheme =
          window.localStorage.getItem(
            STREAK_THEME_STORAGE_KEY
          );
      } catch {
        return "streak-theme-starter";
      }

      return STREAK_THEME_CLASSES.includes(
          storedTheme
      )
        ? storedTheme
        : "streak-theme-starter";
    };

export const persistActiveStreakThemeClass =
    (themeClass) => {
      if (
          typeof window === "undefined" ||
          !STREAK_THEME_CLASSES.includes(
              themeClass
          )
      ) {
        return;
      }

      try {
        window.localStorage.setItem(
          STREAK_THEME_STORAGE_KEY,
          themeClass
        );
      } catch {
        // Ignore storage failures; the active DOM class still applies the theme.
      }
    };

export const getStreakThemeClass = (
    streak
) => {
  const value = Number(streak) || 0;

  return STREAK_MILESTONES.reduce(
      (activeTheme, milestone) =>
          value >= milestone.days
              ? milestone.themeClass
              : activeTheme,
      "streak-theme-starter"
  );
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
          ) || getStoredStreakThemeClass()
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
