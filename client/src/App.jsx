import AppRoutes from "./routes";
import {
  useEffect,
  useState,
} from "react";
import { useProgress } from "./context/ProgressContext";
import {
  getStreakThemeClass,
  STREAK_THEME_CLASSES,
} from "./utils/streakTheme";
import {
  getLogoForTheme,
} from "./utils/streakLogos";

function App() {
  const { dashboardStats } =
    useProgress();

  const [
    renderedStreak,
    setRenderedStreak,
  ] = useState(null);

  const streak =
    renderedStreak ??
    dashboardStats?.streak ??
    0;

  const themeClass =
    getStreakThemeClass(
      streak
    );

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
          setRenderedStreak(
            nextStreak
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
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove(
      ...STREAK_THEME_CLASSES
    );

    document.documentElement.classList.add(
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
