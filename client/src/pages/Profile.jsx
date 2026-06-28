import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { useProgress } from "../context/ProgressContext";
import { useEffect, useState } from "react";
import {
  HiCheckBadge,
  HiOutlineCamera,
  HiOutlineTrash,
  HiXMark,
} from "react-icons/hi2";
import {
  getActiveStreakThemeClass,
  getStreakThemeClass,
} from "../utils/streakTheme";
import { getMilestoneIconForTheme } from "../utils/milestoneIcons";

import "./Profile.css";

const getProfileImageKey = (user) =>
    user?.email ? `profileImage:${user.email}` : "profileImage";

const formatDate = (value) =>
    value
        ? new Intl.DateTimeFormat("en", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(value))
        : "Not available";

const MILESTONE_NAMES_BY_THEME = {
  "streak-theme-starter": "Origin Spark",
  "streak-theme-spark": "Volt Ember",
  "streak-theme-week": "Trophy Initiate",
  "streak-theme-bonfire": "Bonfire Vanguard",
  "streak-theme-inferno": "Lava Warden",
  "streak-theme-mint": "Mint Momentum",
  "streak-theme-forest": "Emerald Trailblazer",
  "streak-theme-diamond": "Prism Sentinel",
  "streak-theme-month": "Orbit Scholar",
  "streak-theme-blue-flare": "Azure Blade",
  "streak-theme-frost": "Frostguard",
  "streak-theme-quarter": "Violet Coinmaster",
  "streak-theme-obsidian": "Obsidian Crown",
  "streak-theme-golden-flare": "Gilded Sunbearer",
  "streak-theme-storm": "Stormforged",
  "streak-theme-cosmic": "Cosmic Riftwalker",
  "streak-theme-violet-flare": "Phoenix Feather",
  "streak-theme-two-month": "Twin-Star Legend",
  "streak-theme-cherry": "Sakura Eclipse",
  "streak-theme-crimson": "Crimson Ascendant",
};

const getMilestoneLabel = (themeClass) =>
    MILESTONE_NAMES_BY_THEME[themeClass] ||
    MILESTONE_NAMES_BY_THEME["streak-theme-starter"];

const getProgressPercent = (solved, total) =>
    total > 0 ? Math.min(Math.max((solved / total) * 100, 0), 100) : 0;

const getActiveAppStreak = (fallback = 0) => {
  if (typeof document === "undefined") return fallback;

  const appStreak = Number(
      document.querySelector(".app")?.getAttribute("data-streak")
  );

  return Number.isFinite(appStreak) ? appStreak : fallback;
};

const getCropStyle = (image, zoom, x, y, size) => {
  const width = size?.width || 1;
  const height = size?.height || 1;
  const aspect = width / height;
  const coverWidth = aspect >= 1 ? aspect * 100 : 100;
  const coverHeight = aspect >= 1 ? 100 : (1 / aspect) * 100;

  return {
    backgroundImage: `url(${image})`,
    backgroundSize: `${coverWidth * zoom}% ${coverHeight * zoom}%`,
    backgroundPosition: `${50 + x}% ${50 + y}%`,
  };
};

const CIRC = 2 * Math.PI * 72;
const TOTAL_ARC_DEG = 294;
const GAP_DEG = 8;
const LANE_DEG = (TOTAL_ARC_DEG - GAP_DEG * 2) / 3;

const degToPx = (deg) => (CIRC * deg) / 360;
const LANE_PX = degToPx(LANE_DEG);
const GAP_PX = degToPx(GAP_DEG);
const RING_START_DEG = 123;

function buildLaneDash(filledPx) {
  return `${filledPx} ${CIRC - filledPx}`;
}

function buildLaneOffset(laneIndex) {
  return -(laneIndex * (LANE_PX + GAP_PX));
}

const DonutGauge = ({ solved, total, completionPct, easePct, medPct, hardPct }) => {
  const easyFill = degToPx(LANE_DEG * (easePct / 100));
  const medFill = degToPx(LANE_DEG * (medPct / 100));
  const hardFill = degToPx(LANE_DEG * (hardPct / 100));
  const trackDash = `${LANE_PX} ${CIRC - LANE_PX}`;
  const easyOffset = buildLaneOffset(0);
  const medOffset = buildLaneOffset(1);
  const hardOffset = buildLaneOffset(2);

  return (
      <svg className="profile-gauge-svg" viewBox="0 0 180 180" aria-hidden="true">
        <g style={{ transform: `rotate(${RING_START_DEG}deg)`, transformOrigin: "90px 90px" }}>
          <circle className="gauge-track gauge-track-easy" cx="90" cy="90" r="72" fill="none" strokeWidth="9" strokeDasharray={trackDash} strokeDashoffset={easyOffset} />
          <circle className="gauge-track gauge-track-medium" cx="90" cy="90" r="72" fill="none" strokeWidth="9" strokeDasharray={trackDash} strokeDashoffset={medOffset} />
          <circle className="gauge-track gauge-track-hard" cx="90" cy="90" r="72" fill="none" strokeWidth="9" strokeDasharray={trackDash} strokeDashoffset={hardOffset} />

          <circle className="gauge-progress gauge-progress-easy" cx="90" cy="90" r="72" fill="none" stroke="var(--difficulty-easy)" strokeWidth="9" strokeDasharray={buildLaneDash(easyFill)} style={{ "--lane-offset": `${easyOffset}px`, "--lane-fill": `${easyFill}px` }} />
          <circle className="gauge-progress gauge-progress-medium" cx="90" cy="90" r="72" fill="none" stroke="var(--difficulty-medium)" strokeWidth="9" strokeDasharray={buildLaneDash(medFill)} style={{ "--lane-offset": `${medOffset}px`, "--lane-fill": `${medFill}px` }} />
          <circle className="gauge-progress gauge-progress-hard" cx="90" cy="90" r="72" fill="none" stroke="var(--difficulty-hard)" strokeWidth="9" strokeDasharray={buildLaneDash(hardFill)} style={{ "--lane-offset": `${hardOffset}px`, "--lane-fill": `${hardFill}px` }} />
        </g>
        <g className="gauge-center gauge-center-default">
          <text x="90" y="78" textAnchor="middle" className="gauge-text-solved-count">
            {solved}
            <tspan className="gauge-text-total">/{total}</tspan>
          </text>
          <text x="90" y="105" textAnchor="middle" className="gauge-text-solved-label">
            <tspan className="gauge-text-check">✓ </tspan>Solved
          </text>
          <text x="90" y="129" textAnchor="middle" className="gauge-text-attempting">
            <tspan style={{ fill: 'var(--text-primary)', fontWeight: '800' }}>{Math.max(total - solved, 0)} </tspan>Attempting
          </text>
        </g>
        <g className="gauge-center gauge-center-hover">
          <text x="90" y="84" textAnchor="middle" className="gauge-text-percent">
            {Math.round(completionPct)}%
          </text>
          <text x="90" y="108" textAnchor="middle" className="gauge-text-percent-label">
            Complete
          </text>
        </g>
      </svg>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const { dashboardStats, difficultyCounts, overallProgress, topics } = useProgress();
  const storageKey = getProfileImageKey(user);
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem(storageKey));
  const [pendingImage, setPendingImage] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [pendingImageSize, setPendingImageSize] = useState(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  useEffect(() => {
    setProfileImage(localStorage.getItem(storageKey));
  }, [storageKey]);

  const initial = user?.name?.[0]?.toUpperCase() || "U";
  const streak = dashboardStats?.streak || 0;
  const solvedQuestions = overallProgress?.completed || 0;
  const totalQuestions = overallProgress?.total || 0;
  const overallCompletionPercent = getProgressPercent(solvedQuestions, totalQuestions);
  const streakThemeClass = getStreakThemeClass(streak);
  const [activeMilestone, setActiveMilestone] = useState(() => ({
    streak: getActiveAppStreak(streak),
    themeClass: getActiveStreakThemeClass(),
  }));

  useEffect(() => {
    const activeThemeClass = getActiveStreakThemeClass();

    setActiveMilestone({
      streak: getActiveAppStreak(streak),
      themeClass:
          activeThemeClass === "streak-theme-starter" &&
          streakThemeClass !== "streak-theme-starter"
              ? streakThemeClass
              : activeThemeClass ||
          streakThemeClass,
    });
  }, [streak, streakThemeClass]);

  useEffect(() => {
    const handleStreakThemeApplied = (event) => {
      setActiveMilestone({
        streak: getActiveAppStreak(Number(event.detail?.streak) || streak),
        themeClass:
            event.detail?.themeClass ||
            getActiveStreakThemeClass(),
      });
    };

    window.addEventListener(
        "streak-theme-applied",
        handleStreakThemeApplied
    );

    return () => {
      window.removeEventListener(
          "streak-theme-applied",
          handleStreakThemeApplied
      );
    };
  }, [streak]);

  const milestoneLabel = getMilestoneLabel(activeMilestone.themeClass);
  const milestoneIcon = getMilestoneIconForTheme(activeMilestone.themeClass);

  const difficultyTotals = topics.reduce(
      (acc, topic) => {
        topic.questions?.forEach((question) => {
          if (question.difficulty && acc[question.difficulty] !== undefined) {
            acc[question.difficulty] += 1;
          }
        });
        return acc;
      },
      { Easy: 0, Medium: 0, Hard: 0 }
  );

  const difficultyProgress = {
    Easy: getProgressPercent(difficultyCounts.Easy, difficultyTotals.Easy),
    Medium: getProgressPercent(difficultyCounts.Medium, difficultyTotals.Medium),
    Hard: getProgressPercent(difficultyCounts.Hard, difficultyTotals.Hard),
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = reader.result;
      if (typeof image !== "string") return;
      setCropZoom(1);
      setCropX(0);
      setCropY(0);
      const previewImage = new Image();
      previewImage.onload = () => {
        setPendingImageSize({
          width: previewImage.naturalWidth,
          height: previewImage.naturalHeight,
        });
        setPendingImage(image);
      };
      previewImage.src = image;
    };
    reader.readAsDataURL(file);
    setIsAvatarMenuOpen(false);
  };

  const closeCropper = () => {
    setPendingImage(null);
    setPendingImageSize(null);
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
  };

  const saveCroppedImage = () => {
    if (!pendingImage) return;

    const image = new Image();
    image.onload = () => {
      const outputSize = 512;
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");
      const baseScale = Math.max(
          outputSize / image.naturalWidth,
          outputSize / image.naturalHeight
      );
      const scale = baseScale * cropZoom;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const overflowX = Math.max(drawWidth - outputSize, 0);
      const overflowY = Math.max(drawHeight - outputSize, 0);
      const drawX = (outputSize - drawWidth) / 2 - (cropX / 50) * (overflowX / 2);
      const drawY = (outputSize - drawHeight) / 2 - (cropY / 50) * (overflowY / 2);

      context.drawImage(
          image,
          drawX,
          drawY,
          drawWidth,
          drawHeight
      );

      const croppedImage = canvas.toDataURL("image/jpeg", 0.92);
      localStorage.setItem(storageKey, croppedImage);
      setProfileImage(croppedImage);
      window.dispatchEvent(new Event("profile-image-updated"));
      closeCropper();
    };

    image.src = pendingImage;
  };

  const removeImage = () => {
    localStorage.removeItem(storageKey);
    setProfileImage(null);
    setIsAvatarMenuOpen(false);
    window.dispatchEvent(new Event("profile-image-updated"));
  };

  return (
      <>
        <Navbar />
        <div className="profile-page">
          <main className="profile-content">

            <div className="analytics-header-section text-external">
              <h1>Profile</h1>
              <p>View and manage your account information.</p>
            </div>

            <div className="profile-unified-block-card horizontal-split">

              {/* Left Column - Sidebar Info */}
              <div className="profile-left-sidebar-col">
                <div className="profile-avatar-inner-card">
                  <div className="profile-avatar-menu-wrap">
                    <button
                        type="button"
                        className="profile-avatar-container"
                        onClick={() => setIsAvatarMenuOpen((isOpen) => !isOpen)}
                        aria-expanded={isAvatarMenuOpen}
                        aria-label="Profile image options"
                    >
                      {profileImage ? (
                          <img src={profileImage} alt={`${user?.name || "User"} profile`} className="profile-avatar-img" />
                      ) : (
                          <span className="profile-avatar-placeholder">{initial}</span>
                      )}
                    </button>

                    {isAvatarMenuOpen && (
                        <div className="profile-avatar-menu">
                          <label className="profile-avatar-menu-item">
                            <HiOutlineCamera />
                            <span>Upload New</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                          </label>
                          {profileImage && (
                              <button type="button" className="profile-avatar-menu-item danger" onClick={removeImage}>
                                <HiOutlineTrash />
                                <span>Remove Image</span>
                              </button>
                          )}
                        </div>
                    )}
                  </div>

                  <div className="profile-user-identity">
                    <h2>{user?.name || "User"}</h2>
                    <p>{user?.email || "No email available"}</p>
                  </div>

                  <div className={user?.isVerified ? "profile-status-badge verified" : "profile-status-badge"}>
                    <HiCheckBadge />
                    <span>{user?.isVerified ? "Verified Account" : "Unverified Status"}</span>
                  </div>

                </div>

                <div className="profile-streak-showcase visual-match">
                  <div className="milestone-icon-wrapper">
                    <img
                        src={milestoneIcon}
                        alt=""
                        className="profile-milestone-svg"
                        aria-hidden="true"
                    />
                  </div>
                  <div className="milestone-details-wrapper">
                    <span className="milestone-title-tag">{milestoneLabel}</span>
                    <span className="milestone-counter-tag">
                      Streak: <span className="milestone-streak-value">{activeMilestone.streak} D</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Workspace Side */}
              <div className="profile-main-analytics-col">

                {/* Unified Box with enlarged left Gauge & stacked right Squares */}
                <div className="dashboard-analytics-row">
                  <div
                      className="gauge-holder-box enlarged-left-end"
                      aria-label={`${Math.round(overallCompletionPercent)}% complete`}
                      title={`${Math.round(overallCompletionPercent)}% complete`}
                      tabIndex={0}
                  >
                    <DonutGauge
                        solved={solvedQuestions}
                        total={totalQuestions}
                        completionPct={overallCompletionPercent}
                        easePct={difficultyProgress.Easy}
                        medPct={difficultyProgress.Medium}
                        hardPct={difficultyProgress.Hard}
                    />
                  </div>

                  <div className="difficulty-vertical-pillars-container alignment-right-side">
                    <div className="difficulty-vertical-pillars stack-vertical">

                      <div className="diff-pillar-card square-box easy">
                        <span className="diff-pillar-name">Easy</span>
                        <span className="diff-pillar-ratio">
                          <span className="diff-pillar-solved">{difficultyCounts.Easy}</span>/{difficultyTotals.Easy}
                        </span>
                      </div>

                      <div className="diff-pillar-card square-box medium">
                        <span className="diff-pillar-name">Medium</span>
                        <span className="diff-pillar-ratio">
                          <span className="diff-pillar-solved">{difficultyCounts.Medium}</span>/{difficultyTotals.Medium}
                        </span>
                      </div>

                      <div className="diff-pillar-card square-box hard">
                        <span className="diff-pillar-name">Hard</span>
                        <span className="diff-pillar-ratio">
                          <span className="diff-pillar-solved">{difficultyCounts.Hard}</span>/{difficultyTotals.Hard}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Information Fields */}
                <div className="account-meta-grid full-row-layout">
                  <div className="meta-info-item">
                    <label>Full Profile Username</label>
                    <strong>{user?.name || "User"}</strong>
                  </div>
                  <div className="meta-info-item">
                    <label>Configured Primary Mail</label>
                    <strong>{user?.email || "No email available"}</strong>
                  </div>
                  <div className="meta-info-item">
                    <label>System Registration Timestamp</label>
                    <strong>{formatDate(user?.createdAt)}</strong>
                  </div>
                </div>

              </div>

            </div>
          </main>
        </div>

        {pendingImage && (
            <div className="profile-cropper-backdrop" role="dialog" aria-modal="true" aria-label="Crop profile image">
              <div className="profile-cropper">
                <div className="profile-cropper-header">
                  <h2>Crop image</h2>
                  <button type="button" className="profile-crop-close" onClick={closeCropper} aria-label="Close crop image dialog">
                    <HiXMark />
                  </button>
                </div>

                <div className="profile-crop-preview-frame">
                  <div
                      className="profile-crop-preview"
                      style={getCropStyle(pendingImage, cropZoom, cropX, cropY, pendingImageSize)}
                  />
                </div>

                <div className="profile-crop-controls">
                  <label>
                    <span>Zoom</span>
                    <input
                        type="range"
                        min="1"
                        max="2.4"
                        step="0.05"
                        value={cropZoom}
                        onChange={(event) => setCropZoom(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>Horizontal</span>
                    <input
                        type="range"
                        min="-50"
                        max="50"
                        step="1"
                        value={cropX}
                        onChange={(event) => setCropX(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>Vertical</span>
                    <input
                        type="range"
                        min="-50"
                        max="50"
                        step="1"
                        value={cropY}
                        onChange={(event) => setCropY(Number(event.target.value))}
                    />
                  </label>
                </div>

                <div className="profile-cropper-actions">
                  <button type="button" className="profile-crop-secondary" onClick={closeCropper}>
                    Cancel
                  </button>
                  <button type="button" className="profile-crop-primary" onClick={saveCroppedImage}>
                    Save crop
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default Profile;
