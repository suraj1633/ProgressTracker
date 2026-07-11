import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";

import {
  HiOutlineChartBar,
  HiOutlineSquares2X2,
  HiOutlineLightBulb,
  HiOutlineUserGroup,
  HiOutlineUserCircle,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import {
  getActiveStreakThemeClass,
} from "../../utils/streakTheme";
import {
  getLogoForTheme,
} from "../../utils/streakLogos";

import "./Navbar.css";

const getProfileImageKey = (
  user
) =>
  user?.email
    ? `profileImage:${user.email}`
    : "profileImage";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } =
    useAuth();
  const [
    activeTheme,
    setActiveTheme,
  ] = useState(
    getActiveStreakThemeClass
  );
  const [
    profileImage,
    setProfileImage,
  ] = useState(null);

  useEffect(() => {
    const syncLogo = () => {
      setActiveTheme(
        getActiveStreakThemeClass()
      );
    };

    syncLogo();

    window.addEventListener(
      "streak-theme-applied",
      syncLogo
    );

    return () => {
      window.removeEventListener(
        "streak-theme-applied",
        syncLogo
      );
    };
  }, []);

  useEffect(() => {
    const syncProfileImage =
      () => {
        setProfileImage(
          localStorage.getItem(
            getProfileImageKey(
              user
            )
          )
        );
      };

    syncProfileImage();

    window.addEventListener(
      "profile-image-updated",
      syncProfileImage
    );

    window.addEventListener(
      "storage",
      syncProfileImage
    );

    return () => {
      window.removeEventListener(
        "profile-image-updated",
        syncProfileImage
      );

      window.removeEventListener(
        "storage",
        syncProfileImage
      );
    };
  }, [user]);

  const logo =
    getLogoForTheme(
      activeTheme
    );

  const handleLogout = () => {
    logout();
    navigate("/", {
      replace: true,
    });
  };

  const navItems = (
    <>
      <Link
        to="/dashboard"
        title="Dashboard"
        aria-label="Dashboard"
        className={
          location.pathname ===
          "/dashboard"
            ? "active-link"
            : ""
        }
      >
        <HiOutlineSquares2X2 />

        Dashboard
      </Link>

      <Link
        to="/analytics"
        title="Analytics"
        aria-label="Analytics"
        className={
          location.pathname ===
          "/analytics"
            ? "active-link"
            : ""
        }
      >
        <HiOutlineChartBar />

        Analytics
      </Link>

      <Link
        to="/tips"
        title="Tips"
        aria-label="Tips"
        className={
          location.pathname ===
          "/tips"
            ? "active-link"
            : ""
        }
      >
        <HiOutlineLightBulb />

        Tips
      </Link>

      <Link
        to="/friends"
        title="Mates"
        aria-label="Mates"
        className={
          location.pathname ===
          "/friends"
            ? "active-link"
            : ""
        }
      >
        <HiOutlineUserGroup />

        Mates
      </Link>

      <Link
        to="/profile"
        title="Profile"
        aria-label="Profile"
        className={
          location.pathname ===
          "/profile"
            ? "active-link"
            : ""
        }
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt=""
            className="navbar-profile-image"
            aria-hidden="true"
          />
        ) : (
          <HiOutlineUserCircle />
        )}

        Profile
      </Link>

      <button
        type="button"
        className="navbar-logout"
        onClick={handleLogout}
        title="Logout"
        aria-label="Logout"
      >
        <HiArrowRightOnRectangle />

        Logout
      </button>
    </>
  );

  return (
    <>
      <nav className="navbar">
        <Link
          to="/dashboard"
          className="navbar-logo"
          aria-label="Dashboard"
          title="Dashboard"
        >
          <img
            src={logo}
            alt=""
            className="navbar-logo-img"
            aria-hidden="true"
          />

          <div className="logo-text">
            <span>DSA</span> Tracker
          </div>
        </Link>

        <div className="navbar-links">
          {navItems}
        </div>
      </nav>

      <div
        className="navbar-spacer"
        aria-hidden="true"
      />

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        {navItems}
      </nav>
    </>
  );
};

export default Navbar;
