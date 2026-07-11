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
import {
  createMateInboxStream,
  getMates,
  MATE_CHAT_UPDATED_EVENT,
} from "../../services/mateApi";

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
  const [
    messageNotice,
    setMessageNotice,
  ] = useState(null);
  const [
    unreadMessages,
    setUnreadMessages,
  ] = useState({});

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

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let isMounted = true;
    const mateById = new Map();
    let noticeTimeout = null;

    const showMessageNotice = (
      mate,
      message
    ) => {
      const notice = {
        id: `${mate.id}:${message.id}`,
        title: `${mate.name} sent a message`,
        text: message.text,
        avatar: mate.avatar,
      };

      setMessageNotice(notice);

      if (noticeTimeout) {
        clearTimeout(noticeTimeout);
      }

      noticeTimeout = setTimeout(
        () => {
          setMessageNotice(null);
        },
        4200
      );

      if (document.hidden) {
        document.title =
          notice.title;
      }

      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(notice.title, {
          body: notice.text,
          icon: notice.avatar,
        });
      }
    };

    const openStreams = async () => {
      try {
        const mates = await getMates();

        if (!isMounted) {
          return;
        }

        mates.forEach((mate) => {
          mateById.set(mate.id, mate);
        });
      } catch {
        // Notifications can still work from stream payload ids.
      }
    };

    openStreams();

    const stream =
      createMateInboxStream(
        ({ userId, message }) => {
          window.dispatchEvent(
            new CustomEvent(
              MATE_CHAT_UPDATED_EVENT,
              {
                detail: {
                  userId,
                  message,
                },
              }
            )
          );

          if (
            message.sender === "mate" &&
            !message.isDeleted
          ) {
            const mate =
              mateById.get(userId) || {
                id: userId,
                name: "Your mate",
                avatar: "",
              };

            setUnreadMessages(
              (currentUnread) => ({
                ...currentUnread,
                [userId]:
                  (currentUnread[
                    userId
                  ] || 0) + 1,
              })
            );

            showMessageNotice(
              mate,
              message
            );
          }
        }
      );

    const resetTitle = () => {
      document.title = "DSA Tracker";
    };

    const requestNotifications = () => {
      if (
        "Notification" in window &&
        Notification.permission ===
          "default"
      ) {
        Notification.requestPermission();
      }
    };

    window.addEventListener(
      "focus",
      resetTitle
    );
    window.addEventListener(
      "pointerdown",
      requestNotifications,
      {
        once: true,
      }
    );

    return () => {
      isMounted = false;

      stream?.close();

      if (noticeTimeout) {
        clearTimeout(noticeTimeout);
      }

      window.removeEventListener(
        "focus",
        resetTitle
      );
      window.removeEventListener(
        "pointerdown",
        requestNotifications
      );
    };
  }, [user]);

  const logo =
    getLogoForTheme(
      activeTheme
    );
  const unreadMessageCount =
    Object.values(unreadMessages).reduce(
      (total, count) =>
        total + count,
      0
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
        onClick={() => {
          setUnreadMessages({});
        }}
        className={
          location.pathname ===
          "/friends"
            ? "active-link"
            : ""
        }
      >
        <HiOutlineUserGroup />

        Mates

        {unreadMessageCount > 0 && (
          <span
            className="navbar-unread-badge"
            aria-label={`${unreadMessageCount} unread messages`}
          >
            {unreadMessageCount > 9
              ? "9+"
              : unreadMessageCount}
          </span>
        )}
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

      {messageNotice && (
        <div
          className="navbar-message-notice"
          role="status"
          aria-live="polite"
        >
          <img
            src={messageNotice.avatar}
            alt=""
            aria-hidden="true"
          />

          <div>
            <strong>
              {messageNotice.title}
            </strong>
            <span>
              {messageNotice.text}
            </span>
          </div>
        </div>
      )}

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
