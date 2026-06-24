import {
  Link,
  Navigate,
} from "react-router-dom";
import {
  HiArrowRight,
  HiArrowRightOnRectangle,
  HiClock,
  HiFire,
  HiUserPlus,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo_streak-theme-starter.svg";

import "../components/Navbar/Navbar.css";
import "./Home.css";

const Home = () => {
  const { user, loading } =
    useAuth();

  if (loading) {
    return (
      <div className="route-loader">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <main className="home-page">
      <nav className="navbar">
        <Link
          to="/"
          className="navbar-logo"
          aria-label="Home"
          title="Home"
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

        <div className="navbar-links home-navbar-links">
          <Link to="/login">
            <HiArrowRightOnRectangle />
            Login
          </Link>

          <Link
            to="/signup"
          >
            <HiUserPlus />
            Sign up
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-copy">
          <h1>
            Track DSA Progress
          </h1>

          <p>
            Turn scattered practice into a
            clear routine with topics,
            progress, streaks, and activity
            history in one place.
          </p>

          <div className="home-actions">
            <Link
              to="/signup"
              className="home-primary-action"
            >
              Create account
              <HiArrowRight />
            </Link>

            <Link
              to="/login"
              className="home-secondary-action"
            >
              Login
            </Link>
          </div>
        </div>

        <aside
          className="home-preview"
          aria-label="Tracker preview"
        >
          <div className="home-preview-top">
            <div>
              <span>Today</span>
              <strong>
                Practice snapshot
              </strong>
            </div>

            <div className="home-preview-streak">
              <HiFire />
              7 day streak
            </div>
          </div>

          <div className="home-preview-stats">
            <div>
              <span>Solved</span>
              <strong>126</strong>
            </div>

            <div>
              <span>Topics</span>
              <strong>8</strong>
            </div>

            <div>
              <span>Left</span>
              <strong>42</strong>
            </div>
          </div>

          <div className="home-topic-list">
            <div>
              <span>Arrays</span>
              <strong>82%</strong>
              <small>
                <i className="arrays-progress" />
              </small>
            </div>

            <div>
              <span>Dynamic Programming</span>
              <strong>46%</strong>
              <small>
                <i className="dp-progress" />
              </small>
            </div>

            <div>
              <span>Graphs</span>
              <strong>61%</strong>
              <small>
                <i className="graphs-progress" />
              </small>
            </div>
          </div>

          <div className="home-preview-footer">
            <HiClock />
            Plan today. Review tomorrow.
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Home;
