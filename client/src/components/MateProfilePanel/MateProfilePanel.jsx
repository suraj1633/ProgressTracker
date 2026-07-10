import {
  useState,
} from "react";
import {
  HiArrowLeft,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserMinus,
  HiOutlineUserPlus,
  HiUsers,
} from "react-icons/hi2";

import {
  getStreakThemeClass,
} from "../../utils/streakTheme";
import { getMilestoneIconForTheme } from "../../utils/milestoneIcons";
import {
  getDifficultyGaugeVars,
  getPercent,
  MATE_THEME_VARS,
  PLATFORM_LINKS,
} from "../../pages/Friends";
import "../MateChatPanel/MateChatPanel.css";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "Not available";

const MateProfilePanel = ({
  selectedUser,
  onBack,
  onMessage,
  onOpenProfile,
  onStatusChange,
  embedded = false,
}) => {
  const [isUpdating, setIsUpdating] =
    useState(false);
  const status =
    selectedUser.status || "none";

  const updateMateStatus = async (
    nextStatus
  ) => {
    if (!onStatusChange || isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await onStatusChange(
        selectedUser.id,
        nextStatus
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const mateThemeClass =
    getStreakThemeClass(
      selectedUser.streak
    );
  const milestoneIcon =
    getMilestoneIconForTheme(
      mateThemeClass
    );
  const mateThemeVars =
    MATE_THEME_VARS[
      mateThemeClass
    ] ||
    MATE_THEME_VARS[
      "streak-theme-first-steps"
    ];
  const completion = getPercent(
    selectedUser.solved,
    selectedUser.total
  );
  const gaugeVars =
    getDifficultyGaugeVars(
      selectedUser.difficulty
    );
  const renderMateActions = () => (
    <div className="mate-actions mate-profile-actions">
      {status === "mate" ? (
        <button
          type="button"
          className="mate-action primary"
          onClick={onMessage}
          disabled={isUpdating}
        >
          <HiOutlineChatBubbleLeftRight />
          Message
        </button>
      ) : status === "request" ? (
        <button
          type="button"
          className="mate-action primary"
          onClick={() =>
            updateMateStatus("mate")
          }
          disabled={isUpdating}
        >
          <HiUsers />
          Accept Mate
        </button>
      ) : status === "interest" ? (
        <button
          type="button"
          className="mate-action"
          disabled
        >
          <HiOutlineUserPlus />
          Interest Sent
        </button>
      ) : (
        <button
          type="button"
          className="mate-action primary"
          onClick={() =>
            updateMateStatus(
              "interest"
            )
          }
          disabled={isUpdating}
        >
          <HiOutlineUserPlus />
          Add Mate
        </button>
      )}

      {status === "mate" && (
        <button
          type="button"
          className="mate-action danger"
          onClick={() =>
            updateMateStatus("none")
          }
          disabled={isUpdating}
        >
          <HiOutlineUserMinus />
          Ditch
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`mate-profile-panel ${
        embedded ? "embedded" : ""
      }`}
    >
      <div
        className="profile-unified-block-card horizontal-split"
      >
        <header className="mate-chat-header mate-profile-header-row">
          <button
            type="button"
            className="mate-chat-person"
            onClick={onOpenProfile}
            disabled={!onOpenProfile}
            aria-label={`Open ${selectedUser.name} profile`}
            title={`${selectedUser.name} profile`}
          >
            <img
              src={selectedUser.avatar}
              alt=""
              aria-hidden="true"
            />

            <div>
              <h1>{selectedUser.name}</h1>
              <p>@{selectedUser.username}</p>
            </div>
          </button>

          {onBack && (
            <button
              type="button"
              className="mate-chat-back"
              onClick={onBack}
              aria-label="Back to mates"
              title="Back to mates"
            >
              <HiArrowLeft />
            </button>
          )}
        </header>

        <div className="profile-left-sidebar-col">
          <div className="profile-avatar-inner-card">
            <div className="profile-avatar-menu-wrap">
              <div className="profile-avatar-container mate-avatar-static">
                <img
                  src={selectedUser.avatar}
                  alt={`${selectedUser.name} profile`}
                  className="profile-avatar-img"
                />
              </div>
            </div>

            <div className="profile-user-identity">
              <h2>{selectedUser.name}</h2>
              <p>@{selectedUser.username}</p>
            </div>

            {renderMateActions()}
          </div>

          <div
            className="profile-starter-milestone-card"
            style={mateThemeVars}
          >
            <div className="starter-milestone-icon-shell">
              <img
                src={milestoneIcon}
                alt=""
                className="starter-milestone-icon"
                aria-hidden="true"
              />
            </div>
            <div className="starter-milestone-copy">
              <span className="starter-milestone-kicker">
                Milestone
              </span>
              <strong>
                {selectedUser.milestone}
              </strong>
              <span>
                Streak{" "}
                <b>
                  {selectedUser.streak} D
                </b>
              </span>
            </div>
          </div>

          <div className="mate-profile-action-slot">
            {renderMateActions()}
          </div>
        </div>

        <div className="profile-main-analytics-col">
          <div className="dashboard-analytics-row">
            <div
              className="gauge-holder-box enlarged-left-end"
              aria-label={`${Math.round(
                completion
              )}% complete`}
              title={`${Math.round(
                completion
              )}% complete`}
              tabIndex={0}
            >
              <div
                className="mate-gauge"
                style={gaugeVars}
              >
                <div className="mate-gauge-center mate-gauge-center-default">
                  <strong>
                    {selectedUser.solved}
                    <span>
                      /{selectedUser.total}
                    </span>
                  </strong>
                  <small>Solved</small>
                  <small className="mate-gauge-attempting">
                    <b>
                      {Math.max(
                        selectedUser.total -
                          selectedUser.solved,
                        0
                      )}
                    </b>{" "}
                    Attempting
                  </small>
                </div>

                <div className="mate-gauge-center mate-gauge-center-hover">
                  <strong>
                    {Math.round(
                      completion
                    )}
                    %
                  </strong>
                  <small>Complete</small>
                </div>
              </div>
            </div>

            <div className="difficulty-vertical-pillars-container alignment-right-side">
              <div className="difficulty-vertical-pillars stack-vertical">
                {Object.entries(
                  selectedUser.difficulty
                ).map(
                  ([
                    difficulty,
                    stats,
                  ]) => (
                    <div
                      key={difficulty}
                      className={`diff-pillar-card square-box ${difficulty.toLowerCase()}`}
                    >
                      <span className="diff-pillar-name">
                        {difficulty}
                      </span>
                      <span className="diff-pillar-ratio">
                        <span className="diff-pillar-solved">
                          {stats.solved}
                        </span>
                        /{stats.total}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="account-meta-grid full-row-layout">
            <div className="meta-info-item">
              <label>Full Name</label>
              <strong>
                {selectedUser.name}
              </strong>
            </div>

            <div className="meta-info-item">
              <label>
                Active Streak
              </label>
              <strong>
                {selectedUser.streak} days
              </strong>
            </div>

            <div className="meta-info-item">
              <label>Joined Date</label>
              <strong>
                {formatDate(
                  selectedUser.joinedAt
                )}
              </strong>
            </div>

            <div className="meta-info-item platform-meta-item">
              <label>
                Platform Profiles
              </label>
              <div className="platform-link-list">
                {PLATFORM_LINKS.map(
                  (platform) => {
                    const href =
                      selectedUser
                        .platforms[
                        platform.key
                      ];

                    if (!href) {
                      return null;
                    }

                    return (
                      <a
                        key={platform.key}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={
                          platform.label
                        }
                        title={
                          platform.label
                        }
                      >
                        <platform.Icon aria-hidden="true" />
                      </a>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="mate-profile-panel-spacer"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default MateProfilePanel;
