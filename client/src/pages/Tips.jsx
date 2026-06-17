import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  HiCheck,
  HiMagnifyingGlass,
  HiOutlineLightBulb,
  HiPencilSquare,
  HiPlus,
  HiTag,
  HiTrash,
  HiXMark,
} from "react-icons/hi2";

import Navbar from "../components/Navbar/Navbar";
import { useProgress } from "../context/ProgressContext";
import {
  createTip,
  deleteTip,
  getTips,
  updateTip,
} from "../services/topicApi";

import "./Tips.css";

const NOTE_COLORS = [
  {
    name: "Default",
    value: "#202020",
  },
  {
    name: "Amber",
    value: "#3a2a12",
  },
  {
    name: "Green",
    value: "#173026",
  },
  {
    name: "Blue",
    value: "#182c3f",
  },
  {
    name: "Red",
    value: "#3a1d25",
  },
];

const createEmptyTip = () => ({
  title: "",
  body: "",
  topicId: "general",
  color: NOTE_COLORS[0].value,
});

const formatDate = (
  value
) =>
  new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(value));

const Tips = () => {
  const { topics } =
    useProgress();

  const [tips, setTips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [draft, setDraft] =
    useState(
      createEmptyTip
    );

  const [editingId, setEditingId] =
    useState(null);

  const [activeTip, setActiveTip] =
    useState(null);

  const [query, setQuery] =
    useState("");

  const [selectedTopic, setSelectedTopic] =
    useState("all");

  useEffect(() => {
    const loadTips =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getTips();

          setTips(data);
        } catch (err) {
          setError(
            err.response?.data
              ?.message ||
              "Unable to load tips"
          );
        } finally {
          setLoading(false);
        }
      };

    loadTips();
  }, []);

  const topicOptions =
    useMemo(
      () => [
        {
          _id: "general",
          title: "General",
        },
        ...topics,
      ],
      [topics]
    );

  const topicNameById =
    useMemo(() => {
      return topicOptions.reduce(
        (
          acc,
          topic
        ) => {
          acc[topic._id] =
            topic.title ||
            topic.name ||
            "Topic";

          return acc;
        },
        {}
      );
    }, [topicOptions]);

  const filteredTips =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return tips
        .filter((tip) => {
          const matchesTopic =
            selectedTopic ===
              "all" ||
            tip.topicId ===
              selectedTopic;

          const searchable =
            `${tip.title} ${tip.body} ${
              topicNameById[
                tip.topicId
              ] || ""
            }`.toLowerCase();

          return (
            matchesTopic &&
            searchable.includes(
              normalizedQuery
            )
          );
        })
        .sort(
          (
            first,
            second
          ) =>
            new Date(
              second.updatedAt
            ) -
            new Date(
              first.updatedAt
            )
        );
    }, [
      query,
      selectedTopic,
      tips,
      topicNameById,
    ]);

  const resetDraft = () => {
    setDraft(
      createEmptyTip()
    );

    setEditingId(null);
  };

  const saveTip = async () => {
    const title =
      draft.title.trim();

    const body =
      draft.body.trim();

    if (
      !title &&
      !body
    ) {
      return;
    }

    try {
      setError("");

      const payload = {
        ...draft,
        title:
          title ||
          "Untitled tip",
        body,
      };

      if (editingId) {
        const updated =
          await updateTip(
            editingId,
            payload
          );

        setTips((current) =>
          current.map((tip) =>
            tip._id === editingId
              ? updated
              : tip
          )
        );
      } else {
        const created =
          await createTip(
            payload
          );

        setTips((current) => [
          created,
          ...current,
        ]);
      }

      resetDraft();
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Unable to save tip"
      );
    }
  };

  const editTip = (
    tip
  ) => {
    setDraft({
      title: tip.title,
      body: tip.body,
      topicId:
        tip.topicId ||
        "general",
      color:
        tip.color ||
        NOTE_COLORS[0].value,
    });

    setEditingId(tip._id);
    setActiveTip(null);
  };

  const removeTip = async (
    id
  ) => {
    try {
      setError("");

      await deleteTip(id);

      setTips((current) =>
        current.filter(
          (tip) =>
            tip._id !== id
        )
      );

      if (editingId === id) {
        resetDraft();
      }

      if (
        activeTip?._id === id
      ) {
        setActiveTip(null);
      }
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Unable to delete tip"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="tips-page">
        <main className="tips-content">
          <div className="tips-header">
            <div>
              <h1>Tips</h1>

              <p>
                Save important points
                topic-wise for quick
                revision.
              </p>
            </div>

            <div className="tips-count">
              <HiOutlineLightBulb />

              {tips.length} notes
            </div>
          </div>

          <section className="tip-editor">
            {error && (
              <div className="tips-error">
                {error}
              </div>
            )}

            <input
              value={draft.title}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  title:
                    event.target
                      .value,
                })
              }
              placeholder="Title"
              className="tip-title-input"
            />

            <textarea
              value={draft.body}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  body:
                    event.target
                      .value,
                })
              }
              placeholder="Write an important point..."
              className="tip-body-input"
              rows={5}
            />

            <div className="tip-editor-actions">
              <label className="tip-select-wrap">
                <HiTag />

                <select
                  value={
                    draft.topicId
                  }
                  onChange={(
                    event
                  ) =>
                    setDraft({
                      ...draft,
                      topicId:
                        event.target
                          .value,
                    })
                  }
                >
                  {topicOptions.map(
                    (topic) => (
                      <option
                        key={
                          topic._id
                        }
                        value={
                          topic._id
                        }
                      >
                        {topic.title ||
                          topic.name ||
                          "Topic"}
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="tip-colors">
                {NOTE_COLORS.map(
                  (color) => (
                    <button
                      key={
                        color.value
                      }
                      type="button"
                      className={
                        draft.color ===
                        color.value
                          ? "active"
                          : ""
                      }
                      style={{
                        background:
                          color.value,
                      }}
                      title={
                        color.name
                      }
                      onClick={() =>
                        setDraft({
                          ...draft,
                          color:
                            color.value,
                        })
                      }
                    />
                  )
                )}
              </div>

              <div className="tip-buttons">
                {editingId && (
                  <button
                    type="button"
                    className="tip-icon-button"
                    onClick={
                      resetDraft
                    }
                    title="Cancel edit"
                  >
                    <HiXMark />
                  </button>
                )}

                <button
                  type="button"
                  className="tip-save-button"
                  onClick={saveTip}
                >
                  {editingId ? (
                    <HiCheck />
                  ) : (
                    <HiPlus />
                  )}

                  {editingId
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </div>
          </section>

          <section className="tips-toolbar">
            <label className="tips-search">
              <HiMagnifyingGlass />

              <input
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search notes"
              />
            </label>

            <select
              className="tips-topic-filter"
              value={selectedTopic}
              onChange={(event) =>
                setSelectedTopic(
                  event.target.value
                )
              }
            >
              <option value="all">
                All topics
              </option>

              {topicOptions.map(
                (topic) => (
                  <option
                    key={topic._id}
                    value={topic._id}
                  >
                    {topic.title ||
                      topic.name ||
                      "Topic"}
                  </option>
                )
              )}
            </select>
          </section>

          {filteredTips.length ===
          0 ? (
            <div className="tips-empty">
              <HiOutlineLightBulb />

              <h3>
                {loading
                  ? "Loading notes"
                  : "No notes yet"}
              </h3>

              <p>
                {loading
                  ? "Fetching your saved tips."
                  : "Add a tip, trick, or pattern you want to remember."}
              </p>
            </div>
          ) : (
            <section className="tips-grid">
              {filteredTips.map(
                (tip) => (
                  <article
                    key={tip._id}
                    className="tip-card"
                    role="button"
                    tabIndex={0}
                    style={{
                      background:
                        tip.color,
                    }}
                    onClick={() =>
                      setActiveTip(tip)
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        setActiveTip(tip);
                      }
                    }}
                  >
                    <div className="tip-card-header">
                      <span>
                        {topicNameById[
                          tip.topicId
                        ] || "General"}
                      </span>

                      <div className="tip-card-actions">
                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();
                            editTip(tip)
                          }}
                          title="Edit note"
                        >
                          <HiPencilSquare />
                        </button>

                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();
                            removeTip(
                              tip._id
                            )
                          }}
                          title="Delete note"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </div>

                    <h2>{tip.title}</h2>

                    <time>
                      Updated{" "}
                      {formatDate(
                        tip.updatedAt
                      )}
                    </time>
                  </article>
                )
              )}
            </section>
          )}

          {activeTip && (
            <div
              className="tip-detail-backdrop"
              onClick={() =>
                setActiveTip(null)
              }
            >
              <article
                className="tip-detail"
                style={{
                  background:
                    activeTip.color,
                }}
                onClick={(
                  event
                ) =>
                  event.stopPropagation()
                }
              >
                <div className="tip-detail-header">
                  <span>
                    {topicNameById[
                      activeTip.topicId
                    ] || "General"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTip(null)
                    }
                    title="Close note"
                  >
                    <HiXMark />
                  </button>
                </div>

                <h2>
                  {activeTip.title}
                </h2>

                <p>
                  {activeTip.body}
                </p>

                <div className="tip-detail-footer">
                  <time>
                    Updated{" "}
                    {formatDate(
                      activeTip.updatedAt
                    )}
                  </time>

                  <button
                    type="button"
                    onClick={() =>
                      editTip(activeTip)
                    }
                  >
                    <HiPencilSquare />

                    Edit
                  </button>
                </div>
              </article>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Tips;
