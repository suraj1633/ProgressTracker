import {
  useEffect,
  useState,
} from "react";

import {
  getActiveStreakThemeClass,
} from "../../utils/streakTheme";
import {
  getLogoForTheme,
} from "../../utils/streakLogos";

import "./RouteLoader.css";

const RouteLoader = () => {
  const [
    activeTheme,
    setActiveTheme,
  ] = useState(
    getActiveStreakThemeClass
  );

  useEffect(() => {
    const syncTheme = () => {
      setActiveTheme(
        getActiveStreakThemeClass()
      );
    };

    syncTheme();

    window.addEventListener(
      "streak-theme-applied",
      syncTheme
    );

    return () => {
      window.removeEventListener(
        "streak-theme-applied",
        syncTheme
      );
    };
  }, []);

  const logo =
    getLogoForTheme(
      activeTheme
    );

  return (
    <div className="route-loader">
      <div className="route-loader-card">
        <div className="route-loader-logo-shell">
          <img
            src={logo}
            alt=""
            aria-hidden="true"
          />
        </div>

        <span>Loading</span>
      </div>
    </div>
  );
};

export default RouteLoader;
