import Navbar from "../components/Navbar/Navbar";
import Dropdown from "../components/Graph/Dropdown";
import { useAuth } from "../context/AuthContext";
import { useProgress } from "../context/ProgressContext";
import { useEffect, useState } from "react";
import {
  HiCheckBadge,
  HiCheck,
  HiPencilSquare,
  HiOutlineCamera,
  HiOutlineTrash,
  HiXMark,
} from "react-icons/hi2";
import {
  SiCodechef,
  SiCodeforces,
  SiGithub,
  SiLeetcode,
} from "react-icons/si";
import {
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
  "streak-theme-first-steps": "First Steps",
  "streak-theme-starter": "Starter Milestone",
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
    MILESTONE_NAMES_BY_THEME["streak-theme-first-steps"];

const getProgressPercent = (solved, total) =>
    total > 0 ? Math.min(Math.max((solved / total) * 100, 0), 100) : 0;

const getEffectiveAppStreak = (fallback = 0) => {
  if (typeof document === "undefined") return fallback;

  const appStreak = Number(
      document.querySelector(".app")?.getAttribute("data-streak")
  );

  return Number.isFinite(appStreak)
      ? appStreak
      : fallback;
};

const PLATFORM_LINKS = [
  {
    key: "leetcode",
    label: "LeetCode",
    placeholder: "https://leetcode.com/u/username",
    Icon: SiLeetcode,
  },
  {
    key: "codeforces",
    label: "Codeforces",
    placeholder: "https://codeforces.com/profile/username",
    Icon: SiCodeforces,
  },
  {
    key: "codechef",
    label: "CodeChef",
    placeholder: "https://www.codechef.com/users/username",
    Icon: SiCodechef,
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
    Icon: SiGithub,
  },
];

const getDefaultPlatformLinks = (user) =>
    PLATFORM_LINKS.reduce(
        (links, platform) => ({
          ...links,
          [platform.key]: user?.platformLinks?.[platform.key] || "",
        }),
        {}
    );

const PLATFORM_OPTIONS =
    PLATFORM_LINKS.map((platform) => ({
      value: platform.key,
      label: platform.label,
    }));

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
  const { user, updateProfile } = useAuth();
  const { dashboardStats, difficultyCounts, overallProgress, topics } = useProgress();
  const storageKey = getProfileImageKey(user);
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem(storageKey));
  const [pendingImage, setPendingImage] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [pendingImageSize, setPendingImageSize] = useState(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    platformLinks: getDefaultPlatformLinks(user),
  });
  const [selectedPlatformKey, setSelectedPlatformKey] =
      useState(PLATFORM_LINKS[0].key);
  const [profileSaveError, setProfileSaveError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const initial = user?.name?.[0]?.toUpperCase() || "U";
  const streak = Number(dashboardStats?.streak) || 0;
  const [displayStreak, setDisplayStreak] =
      useState(() => getEffectiveAppStreak(streak));
  const solvedQuestions = overallProgress?.completed || 0;
  const totalQuestions = overallProgress?.total || 0;
  const overallCompletionPercent = getProgressPercent(solvedQuestions, totalQuestions);
  const streakThemeClass = getStreakThemeClass(displayStreak);
  const activeMilestone = {
    streak: displayStreak,
    themeClass: streakThemeClass,
  };

  useEffect(() => {
    setDisplayStreak(getEffectiveAppStreak(streak));
  }, [streak]);

  useEffect(() => {
    const handleStreakThemeApplied = (event) => {
      const nextStreak =
          Number(event.detail?.streak);

      if (Number.isFinite(nextStreak)) {
        setDisplayStreak(nextStreak);
      }
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
  }, []);

  const milestoneLabel = getMilestoneLabel(activeMilestone.themeClass);
  const milestoneIcon = getMilestoneIconForTheme(activeMilestone.themeClass);
  const selectedPlatform =
      PLATFORM_LINKS.find(
          (platform) => platform.key === selectedPlatformKey
      ) || PLATFORM_LINKS[0];

  useEffect(() => {
    const modalOpen =
        Boolean(pendingImage) ||
        isProfileEditorOpen;

    if (!modalOpen) return;

    const scrollY =
        window.scrollY;
    const scrollbarWidth =
        window.innerWidth -
        document.documentElement.clientWidth;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };
    const previousHtmlOverflow =
        document.documentElement.style.overflow;

    document.documentElement.style.overflow =
        "hidden";
    document.body.style.overflow =
        "hidden";
    document.body.style.position =
        "fixed";
    document.body.style.top =
        `-${scrollY}px`;
    document.body.style.width =
        "100%";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
          `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow =
          previousHtmlOverflow;
      document.body.style.overflow =
          previousBodyStyles.overflow;
      document.body.style.position =
          previousBodyStyles.position;
      document.body.style.top =
          previousBodyStyles.top;
      document.body.style.width =
          previousBodyStyles.width;
      document.body.style.paddingRight =
          previousBodyStyles.paddingRight;

      window.scrollTo(0, scrollY);
    };
  }, [pendingImage, isProfileEditorOpen]);

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

  const openProfileEditor = () => {
    const nextPlatformLinks = getDefaultPlatformLinks(user);
    const firstLinkedPlatform =
        PLATFORM_LINKS.find(
            (platform) => nextPlatformLinks[platform.key]
        ) || PLATFORM_LINKS[0];

    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      platformLinks: nextPlatformLinks,
    });
    setSelectedPlatformKey(firstLinkedPlatform.key);
    setProfileSaveError("");
    setIsProfileEditorOpen(true);
  };

  const closeProfileEditor = () => {
    if (isSavingProfile) return;

    setIsProfileEditorOpen(false);
    setProfileSaveError("");
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handlePlatformFieldChange = (event) => {
    const { value } = event.target;

    setProfileForm((currentForm) => ({
      ...currentForm,
      platformLinks: {
        ...currentForm.platformLinks,
        [selectedPlatformKey]: value,
      },
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const nextName = profileForm.name.trim();
    const nextEmail = profileForm.email.trim().toLowerCase();
    const nextPlatformLinks =
        PLATFORM_LINKS.reduce(
            (links, platform) => ({
              ...links,
              [platform.key]:
                  profileForm.platformLinks?.[platform.key]?.trim() || "",
            }),
            {}
        );

    if (!nextName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setProfileSaveError("Enter a valid name and email.");
      return;
    }

    const hasInvalidPlatformLink =
        Object.values(nextPlatformLinks).some((link) => {
          if (!link) return false;

          try {
            const url = new URL(link);

            return !["http:", "https:"].includes(url.protocol);
          } catch {
            return true;
          }
        });

    if (hasInvalidPlatformLink) {
      setProfileSaveError("Platform links must be valid URLs.");
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError("");

    try {
      await updateProfile({
        name: nextName,
        email: nextEmail,
        platformLinks: nextPlatformLinks,
      });

      if (profileImage && user?.email && nextEmail !== user.email) {
        localStorage.setItem(
          `profileImage:${nextEmail}`,
          profileImage
        );
        localStorage.removeItem(storageKey);
      }

      window.dispatchEvent(new Event("profile-image-updated"));
      setIsProfileEditorOpen(false);
    } catch (error) {
      setProfileSaveError(
        error.response?.data?.message ||
          "Unable to update profile right now."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
      <>
        <Navbar />
        <div className="profile-page">
          <main className="profile-content">

            <div className="analytics-header-section text-external profile-header-row">
              <div>
                <h1>Profile</h1>
                <p>Your account details.</p>
              </div>
            </div>

            <div className="profile-unified-block-card horizontal-split">

              {/* Left Column - Sidebar Info */}
              <div className="profile-left-sidebar-col">
                <button
                    type="button"
                    className="profile-edit-button profile-sidebar-edit-button"
                    onClick={openProfileEditor}
                    aria-label="Edit profile"
                    title="Edit profile"
                >
                  <HiPencilSquare />
                </button>

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

                <div className="profile-starter-milestone-card">
                  <div className="starter-milestone-icon-shell">
                    <img
                        src={milestoneIcon}
                        alt=""
                        className="starter-milestone-icon"
                        aria-hidden="true"
                    />
                  </div>
                  <div className="starter-milestone-copy">
                    <span className="starter-milestone-kicker">Milestone</span>
                    <strong>{milestoneLabel}</strong>
                    <span>
                      Streak <b>{activeMilestone.streak} D</b>
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
                  <div className="meta-info-item platform-meta-item">
                    <label>Platform Profiles</label>
                    <div className="platform-link-list">
                      {PLATFORM_LINKS.some((platform) => user?.platformLinks?.[platform.key]) ? (
                          PLATFORM_LINKS.map((platform) =>
                              user?.platformLinks?.[platform.key] ? (
                                  <a
                                      key={platform.key}
                                      href={user.platformLinks[platform.key]}
                                      target="_blank"
                                      rel="noreferrer"
                                      aria-label={platform.label}
                                      title={platform.label}
                                  >
                                    <platform.Icon aria-hidden="true" />
                                  </a>
                              ) : null
                          )
                      ) : (
                          <span>No platform links</span>
                      )}
                    </div>
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

        {isProfileEditorOpen && (
            <div className="profile-cropper-backdrop" role="dialog" aria-modal="true" aria-label="Edit profile information">
              <form className="profile-editor-modal" onSubmit={handleProfileSubmit}>
                <div className="profile-cropper-header">
                  <div>
                    <h2>Edit profile</h2>
                    <p>Update your account details and coding profile links.</p>
                  </div>
                  <button type="button" className="profile-crop-close" onClick={closeProfileEditor} aria-label="Close edit profile dialog">
                    <HiXMark />
                  </button>
                </div>

                <div className="profile-editor-fields">
                  <label>
                    <span>Name</span>
                    <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileFieldChange}
                        maxLength="80"
                        autoComplete="name"
                        required
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileFieldChange}
                        autoComplete="email"
                        required
                    />
                  </label>
                  <div className="profile-editor-platforms">
                    <span className="profile-editor-section-title">Platform profiles</span>
                    <div className="profile-platform-picker">
                      <label>
                        <span>Platform</span>
                        <Dropdown
                            value={selectedPlatformKey}
                            width="100%"
                            portal={true}
                            closeOnScroll={false}
                            options={PLATFORM_OPTIONS}
                            onChange={setSelectedPlatformKey}
                        />
                      </label>

                      <label>
                        <span>{selectedPlatform.label} link</span>
                        <input
                            type="url"
                            value={profileForm.platformLinks?.[selectedPlatform.key] || ""}
                            onChange={handlePlatformFieldChange}
                            placeholder={selectedPlatform.placeholder}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {profileSaveError && (
                    <p className="profile-editor-error">{profileSaveError}</p>
                )}

                <div className="profile-cropper-actions">
                  <button type="button" className="profile-crop-secondary" onClick={closeProfileEditor} disabled={isSavingProfile}>
                    Cancel
                  </button>
                  <button type="submit" className="profile-crop-primary" disabled={isSavingProfile}>
                    <HiCheck />
                    <span>{isSavingProfile ? "Saving" : "Save changes"}</span>
                  </button>
                </div>
              </form>
            </div>
        )}
      </>
  );
};

export default Profile;
