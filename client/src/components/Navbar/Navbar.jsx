import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Logo from "../../assets/logo.svg";

import {
  HiOutlineChartBar,
  HiOutlineSquares2X2,
  HiOutlineLightBulb,
  HiOutlineUserCircle,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";

import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = (
    <>
      <Link
        to="/"
        title="Dashboard"
        aria-label="Dashboard"
        className={
          location.pathname === "/"
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
        <HiOutlineUserCircle />

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
      <div className="navbar-logo">
        <img
          src={Logo}
          alt="DSA Tracker"
          className="navbar-logo-img"
        />

        <div className="logo-text">
          <span>DSA</span> Tracker
        </div>
      </div>

      <div className="navbar-links">
        {navItems}
      </div>
      </nav>

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
