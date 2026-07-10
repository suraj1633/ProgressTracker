/* eslint-disable react-refresh/only-export-components */
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import {
  SiCodechef,
  SiCodeforces,
  SiGithub,
  SiLeetcode,
} from "react-icons/si";

import Navbar from "../components/Navbar/Navbar";
import MateChatPanel from "../components/MateChatPanel/MateChatPanel";
import MateProfilePanel from "../components/MateProfilePanel/MateProfilePanel";
import {
  getMates as fetchMates,
  MATE_CHAT_UPDATED_EVENT,
  MATE_STATUS_UPDATED_EVENT,
  updateMateStatus as persistMateStatus,
} from "../services/mateApi";

import "./Friends.css";

export const MATE_THEME_VARS = {
  "streak-theme-first-steps": {
    "--theme-accent": "#ff8738",
    "--theme-accent-2": "#ffbe68",
    "--theme-accent-soft": "rgba(255, 135, 56, .12)",
    "--theme-accent-muted": "rgba(255, 135, 56, .2)",
    "--theme-border": "rgba(255, 135, 56, .13)",
  },
  "streak-theme-starter": {
    "--theme-accent": "#ff8738",
    "--theme-accent-2": "#ffbe68",
    "--theme-accent-soft": "rgba(255, 135, 56, .12)",
    "--theme-accent-muted": "rgba(255, 135, 56, .2)",
    "--theme-border": "rgba(255, 135, 56, .13)",
  },
  "streak-theme-spark": {
    "--theme-accent": "#ff9f43",
    "--theme-accent-2": "#ffc078",
    "--theme-accent-soft": "rgba(255, 159, 67, .13)",
    "--theme-accent-muted": "rgba(255, 159, 67, .22)",
    "--theme-border": "rgba(255, 159, 67, .17)",
  },
  "streak-theme-week": {
    "--theme-accent": "#ffb020",
    "--theme-accent-2": "#ffd166",
    "--theme-accent-soft": "rgba(255, 176, 32, .14)",
    "--theme-accent-muted": "rgba(255, 176, 32, .24)",
    "--theme-border": "rgba(255, 176, 32, .18)",
  },
  "streak-theme-bonfire": {
    "--theme-accent": "#ff7a1a",
    "--theme-accent-2": "#ffcf7a",
    "--theme-accent-soft": "rgba(255, 122, 26, .15)",
    "--theme-accent-muted": "rgba(255, 122, 26, .25)",
    "--theme-border": "rgba(255, 122, 26, .2)",
  },
  "streak-theme-inferno": {
    "--theme-accent": "#ff4500",
    "--theme-accent-2": "#ffb347",
    "--theme-accent-soft": "rgba(255,69,0,.14)",
    "--theme-accent-muted": "rgba(255,69,0,.24)",
    "--theme-border": "rgba(255,69,0,.20)",
  },
  "streak-theme-mint": {
    "--theme-accent": "#86efac",
    "--theme-accent-2": "#dcfce7",
    "--theme-accent-soft": "rgba(134, 239, 172, .14)",
    "--theme-accent-muted": "rgba(134, 239, 172, .24)",
    "--theme-border": "rgba(134, 239, 172, .20)",
  },
  "streak-theme-forest": {
    "--theme-accent": "#22c55e",
    "--theme-accent-2": "#86efac",
    "--theme-accent-soft": "rgba(34, 197, 94, .14)",
    "--theme-accent-muted": "rgba(34, 197, 94, .24)",
    "--theme-border": "rgba(34, 197, 94, .2)",
  },
  "streak-theme-diamond": {
    "--theme-accent": "#7dd3fc",
    "--theme-accent-2": "#e0f2fe",
    "--theme-accent-soft": "rgba(125,211,252,.14)",
    "--theme-accent-muted": "rgba(125,211,252,.24)",
    "--theme-border": "rgba(125,211,252,.20)",
  },
  "streak-theme-month": {
    "--theme-accent": "#7dd3fc",
    "--theme-accent-2": "#bae6fd",
    "--theme-accent-soft": "rgba(125, 211, 252, .13)",
    "--theme-accent-muted": "rgba(125, 211, 252, .24)",
    "--theme-border": "rgba(125, 211, 252, .2)",
  },
  "streak-theme-blue-flare": {
    "--theme-accent": "#38bdf8",
    "--theme-accent-2": "#d9f99d",
    "--theme-accent-soft": "rgba(56, 189, 248, .14)",
    "--theme-accent-muted": "rgba(56, 189, 248, .24)",
    "--theme-border": "rgba(56, 189, 248, .2)",
  },
  "streak-theme-frost": {
    "--theme-accent": "#67e8f9",
    "--theme-accent-2": "#cffafe",
    "--theme-accent-soft": "rgba(103,232,249,.14)",
    "--theme-accent-muted": "rgba(103,232,249,.24)",
    "--theme-border": "rgba(103,232,249,.20)",
  },
  "streak-theme-quarter": {
    "--theme-accent": "#fef08a",
    "--theme-accent-2": "#fef9c3",
    "--theme-accent-soft": "rgba(254, 240, 138, .14)",
    "--theme-accent-muted": "rgba(254, 240, 138, .25)",
    "--theme-border": "rgba(254, 240, 138, .22)",
  },
  "streak-theme-obsidian": {
    "--theme-accent": "#fbbf24",
    "--theme-accent-2": "#fde68a",
    "--theme-accent-soft": "rgba(251,191,36,.14)",
    "--theme-accent-muted": "rgba(251,191,36,.24)",
    "--theme-border": "rgba(251,191,36,.20)",
  },
  "streak-theme-golden-flare": {
    "--theme-accent": "#ffd700",
    "--theme-accent-2": "#fff3b0",
    "--theme-accent-soft": "rgba(255, 215, 0, .14)",
    "--theme-accent-muted": "rgba(255, 215, 0, .24)",
    "--theme-border": "rgba(255, 215, 0, .20)",
  },
  "streak-theme-storm": {
    "--theme-accent": "#818cf8",
    "--theme-accent-2": "#c7d2fe",
    "--theme-accent-soft": "rgba(129,140,248,.14)",
    "--theme-accent-muted": "rgba(129,140,248,.24)",
    "--theme-border": "rgba(129,140,248,.20)",
  },
  "streak-theme-cosmic": {
    "--theme-accent": "#e879f9",
    "--theme-accent-2": "#f5d0fe",
    "--theme-accent-soft": "rgba(232,121,249,.14)",
    "--theme-accent-muted": "rgba(232,121,249,.24)",
    "--theme-border": "rgba(232,121,249,.20)",
  },
  "streak-theme-violet-flare": {
    "--theme-accent": "#a78bfa",
    "--theme-accent-2": "#f0abfc",
    "--theme-accent-soft": "rgba(167, 139, 250, .14)",
    "--theme-accent-muted": "rgba(167, 139, 250, .24)",
    "--theme-border": "rgba(167, 139, 250, .2)",
  },
  "streak-theme-two-month": {
    "--theme-accent": "#c084fc",
    "--theme-accent-2": "#e9d5ff",
    "--theme-accent-soft": "rgba(192, 132, 252, .13)",
    "--theme-accent-muted": "rgba(192, 132, 252, .24)",
    "--theme-border": "rgba(192, 132, 252, .2)",
  },
  "streak-theme-cherry": {
    "--theme-accent": "#ff8fb1",
    "--theme-accent-2": "#ffd1dc",
    "--theme-accent-soft": "rgba(255, 143, 177, .14)",
    "--theme-accent-muted": "rgba(255, 143, 177, .24)",
    "--theme-border": "rgba(255, 143, 177, .2)",
  },
  "streak-theme-crimson": {
    "--theme-accent": "#dc2626",
    "--theme-accent-2": "#f87171",
    "--theme-accent-soft": "rgba(220, 38, 38, .14)",
    "--theme-accent-muted": "rgba(220, 38, 38, .24)",
    "--theme-border": "rgba(220, 38, 38, .2)",
  },
};

export const PLATFORM_LINKS = [
  {
    key: "leetcode",
    label: "LeetCode",
    Icon: SiLeetcode,
  },
  {
    key: "codeforces",
    label: "Codeforces",
    Icon: SiCodeforces,
  },
  {
    key: "codechef",
    label: "CodeChef",
    Icon: SiCodechef,
  },
  {
    key: "github",
    label: "GitHub",
    Icon: SiGithub,
  },
];

const clampPercent = (value) =>
  Math.min(Math.max(value, 0), 100);

export const getPercent = (solved, total) =>
  total > 0
    ? clampPercent((solved / total) * 100)
    : 0;

export const getDifficultyGaugeVars = (difficulty) => {
  const easyTotal =
    difficulty.Easy.total;
  const mediumTotal =
    difficulty.Medium.total;
  const hardTotal =
    difficulty.Hard.total;
  const totalQuestions =
    easyTotal + mediumTotal + hardTotal || 1;

  const easyStart = 0;
  const easyEnd =
    (easyTotal / totalQuestions) * 100;
  const mediumStart = easyEnd;
  const mediumEnd =
    mediumStart +
    (mediumTotal / totalQuestions) * 100;
  const hardStart = mediumEnd;
  const hardEnd = 100;

  return {
    "--easy-start": `${easyStart}%`,
    "--easy-fill": `${
      easyStart +
      (easyEnd - easyStart) *
        (getPercent(
          difficulty.Easy.solved,
          easyTotal
        ) /
          100)
    }%`,
    "--easy-end": `${easyEnd}%`,
    "--medium-start": `${mediumStart}%`,
    "--medium-fill": `${
      mediumStart +
      (mediumEnd - mediumStart) *
        (getPercent(
          difficulty.Medium.solved,
          mediumTotal
        ) /
          100)
    }%`,
    "--medium-end": `${mediumEnd}%`,
    "--hard-start": `${hardStart}%`,
    "--hard-fill": `${
      hardStart +
      (hardEnd - hardStart) *
        (getPercent(
          difficulty.Hard.solved,
          hardTotal
        ) /
          100)
    }%`,
    "--hard-end": `${hardEnd}%`,
  };
};

const formatLastMessageTime = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getLastMateMessageTime = (user) =>
  formatLastMessageTime(
    user.lastMessageAt
  );

const Friends = () => {
  const navigate = useNavigate();
  const [query, setQuery] =
    useState("");
  const [activeMateList, setActiveMateList] =
    useState("mates");
  const [selectedChatUserId, setSelectedChatUserId] =
    useState(null);
  const [
    selectedProfileUserId,
    setSelectedProfileUserId,
  ] = useState(null);
  const [
    profileBackChatUserId,
    setProfileBackChatUserId,
  ] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoadingMates, setIsLoadingMates] =
    useState(true);
  const [isDesktopView, setIsDesktopView] =
    useState(() =>
      typeof window === "undefined"
        ? true
        : window.matchMedia(
            "(min-width: 981px)"
          ).matches
    );
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 981px)"
    );
    const syncDesktopView = () => {
      setIsDesktopView(mediaQuery.matches);
    };

    syncDesktopView();
    mediaQuery.addEventListener(
      "change",
      syncDesktopView
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        syncDesktopView
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMates = async () => {
      try {
        const mates =
          await fetchMates();

        if (isMounted) {
          setUsers(mates);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMates(false);
        }
      }
    };

    loadMates();

    window.addEventListener(
      MATE_STATUS_UPDATED_EVENT,
      loadMates
    );
    window.addEventListener(
      "focus",
      loadMates
    );
    window.addEventListener(
      MATE_CHAT_UPDATED_EVENT,
      loadMates
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        MATE_STATUS_UPDATED_EVENT,
        loadMates
      );
      window.removeEventListener(
        "focus",
        loadMates
      );
      window.removeEventListener(
        MATE_CHAT_UPDATED_EVENT,
        loadMates
      );
    };
  }, []);

  const enrichedUsers = users;

  const handleMateStatusChange = async (
    userId,
    status
  ) => {
    const updatedMate =
      await persistMateStatus(
        userId,
        status
      );

    if (updatedMate) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedMate.id
            ? updatedMate
            : user
        )
      );
    }

    return updatedMate;
  };

  const searchText =
    query.trim().toLowerCase();
  const hasSearchText = Boolean(searchText);

  const searchResults = useMemo(() => {
    if (!searchText) {
      return [];
    }

    return enrichedUsers.filter(
      (user) =>
        user.username
          .toLowerCase()
          .includes(searchText) ||
        user.name
          .toLowerCase()
          .includes(searchText)
    );
  }, [enrichedUsers, searchText]);

  const mates = enrichedUsers.filter(
    (user) => user.status === "mate"
  );
  const requests = enrichedUsers.filter(
    (user) => user.status === "request"
  );
  const interests = enrichedUsers.filter(
    (user) => user.status === "interest"
  );
  const selectedChatUser = enrichedUsers.find(
    (user) =>
      user.id === selectedChatUserId &&
      user.status === "mate"
  );
  const selectedProfileUser =
    enrichedUsers.find(
      (user) =>
        user.id === selectedProfileUserId
    );
  const activeListMeta = {
    mates: {
      label: "Mate List",
      users: mates,
      emptyText: isLoadingMates
        ? "Loading mates..."
        : "No mates yet.",
    },
    requests: {
      label: "Mate Requests",
      users: requests,
      emptyText: isLoadingMates
        ? "Loading requests..."
        : "No mate requests.",
    },
    interests: {
      label: "Interests",
      users: interests,
      emptyText: isLoadingMates
        ? "Loading interests..."
        : "No pending interests.",
    },
  }[activeMateList];

  const selectMate = (userId) => {
    if (isDesktopView) {
      setSelectedChatUserId(null);
      setSelectedProfileUserId(userId);
      setProfileBackChatUserId(null);
      return;
    }

    navigate(`/friends/${userId}`);
  };

  const openMateChat = (userId) => {
    if (isDesktopView) {
      setSelectedProfileUserId(null);
      setSelectedChatUserId(userId);
      setProfileBackChatUserId(null);
      return;
    }

    navigate(`/friends/${userId}/chat`);
  };

  return (
    <>
      <Navbar />

      <div className="friends-page">
        <main className="friends-content">
          <header className="friends-header">
            <div>
              <h1>Mates</h1>
              <p>
                Keep track of your mates, requests, and coding interests.
              </p>
            </div>

            <span>
              {mates.length} mates
            </span>
          </header>

          <section className="friends-shell">
            <aside className="friends-sidebar">
              <form
                className="mate-search"
                onSubmit={(event) =>
                  event.preventDefault()
                }
              >
                <HiOutlineMagnifyingGlass />

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search username"
                  aria-label="Search username"
                />
              </form>

              {hasSearchText ? (
                <section className="mate-panel similar-users-panel">
                  <div className="mate-panel-title">
                    <span>Similar Users</span>
                    <b>
                      {searchResults.length}
                    </b>
                  </div>

                  <div className="mate-result-list">
                    {searchResults.length >
                    0 ? (
                      searchResults.map(
                        (user) => (
                          <button
                            type="button"
                            key={user.id}
                            className="mate-result"
                            onClick={() =>
                              selectMate(user.id)
                            }
                          >
                            <img
                              src={user.avatar}
                              alt=""
                              aria-hidden="true"
                            />

                            <span>
                              <strong>
                                {user.name}
                              </strong>
                              <small>
                                @{user.username}
                              </small>
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <div className="mate-empty">
                        No matching users.
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <>
                  <div className="mate-status-grid">
                    <button
                      type="button"
                      className={`mate-status-card ${
                        activeMateList ===
                        "mates"
                          ? "active"
                          : ""
                      }`}
                      aria-label={`${mates.length} mates`}
                      aria-pressed={
                        activeMateList ===
                        "mates"
                      }
                      onClick={() =>
                        setActiveMateList(
                          "mates"
                        )
                      }
                      title="Mates"
                    >
                      <HiOutlineUserGroup />
                      <span>Mates</span>
                      <b>{mates.length}</b>
                    </button>

                    <button
                      type="button"
                      className={`mate-status-card ${
                        activeMateList ===
                        "requests"
                          ? "active"
                          : ""
                      }`}
                      aria-label={`${requests.length} mate requests`}
                      aria-pressed={
                        activeMateList ===
                        "requests"
                      }
                      onClick={() => {
                        setActiveMateList(
                          "requests"
                        );
                        setSelectedChatUserId(null);
                        setSelectedProfileUserId(null);
                        setProfileBackChatUserId(null);
                      }}
                      title="Mate Requests"
                    >
                      <HiOutlineUserPlus />
                      <span>Requests</span>
                      <b>
                        {requests.length}
                      </b>
                    </button>

                    <button
                      type="button"
                      className={`mate-status-card ${
                        activeMateList ===
                        "interests"
                          ? "active"
                          : ""
                      }`}
                      aria-label={`${interests.length} interests`}
                      aria-pressed={
                        activeMateList ===
                        "interests"
                      }
                      onClick={() => {
                        setActiveMateList(
                          "interests"
                        );
                        setSelectedChatUserId(null);
                        setSelectedProfileUserId(null);
                        setProfileBackChatUserId(null);
                      }}
                      title="Interests"
                    >
                      <HiOutlineSparkles />
                      <span>Interests</span>
                      <b>
                        {interests.length}
                      </b>
                    </button>
                  </div>

                  <section className="mate-panel compact mate-list-panel">
                    <div className="mate-panel-title">
                      <span>
                        {activeListMeta.label}
                      </span>
                      <b>
                        {
                          activeListMeta.users
                            .length
                        }
                      </b>
                    </div>

                    {activeListMeta.users
                      .length > 0 ? (
                      activeListMeta.users.map(
                        (user) => (
                          <button
                            type="button"
                            key={user.id}
                            className={`mini-mate ${
                              selectedChatUserId ===
                              user.id
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              activeMateList ===
                              "mates"
                                ? openMateChat(
                                    user.id
                                  )
                                : selectMate(
                                    user.id
                                  )
                            }
                          >
                            <img
                              src={user.avatar}
                              alt=""
                              aria-hidden="true"
                            />
                            <span>
                              {user.name}
                            </span>
                            {activeMateList ===
                              "mates" &&
                              (() => {
                                const lastTime =
                                  getLastMateMessageTime(
                                    user
                                  );

                                return (
                                  <span
                                    className={`mini-mate-time ${
                                      lastTime
                                        ? ""
                                        : "empty"
                                    }`}
                                  >
                                    {lastTime ||
                                      "--"}
                                  </span>
                                );
                              })()}
                          </button>
                        )
                      )
                    ) : (
                      <div className="mate-empty compact-empty">
                        {
                          activeListMeta.emptyText
                        }
                      </div>
                    )}
                  </section>
                </>
              )}
            </aside>

            {isDesktopView && (
              <div className="friends-chat-pane">
                {selectedChatUser ? (
                  <MateChatPanel
                    selectedUser={
                      selectedChatUser
                    }
                    onBack={() =>
                      setSelectedChatUserId(
                        null
                      )
                    }
                    onOpenProfile={() => {
                      setSelectedChatUserId(
                        null
                      );
                      setProfileBackChatUserId(
                        selectedChatUser.id
                      );
                      setSelectedProfileUserId(
                        selectedChatUser.id
                      );
                    }}
                    embedded
                  />
                ) : selectedProfileUser ? (
                  <MateProfilePanel
                    selectedUser={
                      selectedProfileUser
                    }
                    embedded
                    onBack={() => {
                      setSelectedProfileUserId(
                        null
                      );

                      if (profileBackChatUserId) {
                        setSelectedChatUserId(
                          profileBackChatUserId
                        );
                        setProfileBackChatUserId(
                          null
                        );
                      }
                    }}
                    onOpenProfile={() =>
                      setSelectedProfileUserId(
                        selectedProfileUser.id
                      )
                    }
                    onStatusChange={
                      handleMateStatusChange
                    }
                    onMessage={() =>
                      openMateChat(
                        selectedProfileUser.id
                      )
                    }
                  />
                ) : (
                  <section className="mate-selection-empty-panel">
                    <div className="mate-selection-empty-icon">
                      <HiOutlineChatBubbleLeftRight />
                    </div>

                    <h2>
                      No mate selected
                    </h2>

                    <p>
                      Select a mate from the list to open their profile or start a chat.
                    </p>
                  </section>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default Friends;
