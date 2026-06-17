import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.svg";

import {
  HiOutlineChartBar,
  HiOutlineSquares2X2,
  HiOutlineLightBulb,
} from "react-icons/hi2";

import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
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
        <Link
          to="/"
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
      </div>
    </nav>
  );
};

export default Navbar;
