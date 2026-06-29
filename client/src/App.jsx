import AppRoutes from "./routes";
import {
  useEffect,
  useState,
} from "react";
import { useProgress } from "./context/ProgressContext";
import {
  getStreakThemeClass,
  getStoredStreakThemeClass,
  persistActiveStreakThemeClass,
  STREAK_THEME_CLASSES,
} from "./utils/streakTheme";
import {
  getLogoForTheme,
} from "./utils/streakLogos";

const normalizeStreak = (
  value
) => {
  const streak =
    Number(value);

  return Number.isFinite(
    streak
  )
    ? streak
    : 0;
};

function App() {
  const {
    dashboardStats,
    loading: progressLoading,
  } =
    useProgress();

  const dashboardStreak =
    normalizeStreak(
      dashboardStats?.streak
    );

  const [
    manualStreakChange,
    setManualStreakChange,
  ] = useState(
    {
      streak: null,
      dashboardStreak: null,
    }
  );

  const hasCurrentManualStreak =
    manualStreakChange.streak !==
      null &&
    manualStreakChange.dashboardStreak ===
      dashboardStreak;

  const streak =
    hasCurrentManualStreak
      ? manualStreakChange.streak
      : dashboardStreak;

  const resolvedThemeClass =
    getStreakThemeClass(
      streak
    );

  const themeClass =
    progressLoading &&
    !hasCurrentManualStreak
      ? getStoredStreakThemeClass()
      : resolvedThemeClass;

  useEffect(() => {
    const handleStreakThemeChange =
      (event) => {
        const nextStreak =
          Number(
            event.detail?.streak
          );

        if (
          Number.isFinite(
            nextStreak
          )
        ) {
          setManualStreakChange(
            {
              streak: nextStreak,
              dashboardStreak,
            }
          );
        }
      };

    window.addEventListener(
      "streak-theme-change",
      handleStreakThemeChange
    );

    return () => {
      window.removeEventListener(
        "streak-theme-change",
        handleStreakThemeChange
      );
    };
  }, [dashboardStreak]);

  useEffect(() => {
    document.documentElement.classList.remove(
      ...STREAK_THEME_CLASSES
    );

    document.documentElement.classList.add(
      themeClass
    );

    persistActiveStreakThemeClass(
      themeClass
    );

    const favicon =
      document.querySelector(
        "link[rel='icon']"
      );

    if (favicon) {
      favicon.href =
        getLogoForTheme(
          themeClass
        );
    }

    window.dispatchEvent(
      new CustomEvent(
        "streak-theme-applied",
        {
          detail: {
            themeClass,
            streak,
          },
        }
      )
    );

    return () => {
      document.documentElement.classList.remove(
        ...STREAK_THEME_CLASSES
      );
    };
  }, [themeClass, streak]);

  return (
    <div
      className={`app ${themeClass}`}
      data-streak={streak}
    >
      <AppRoutes />
    </div>
  );
}

export default App;
