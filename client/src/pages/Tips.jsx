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
  HiTrash,
  HiXMark,
} from "react-icons/hi2";

import Navbar from "../components/Navbar/Navbar";
import Dropdown from "../components/Graph/Dropdown";
import { useProgress } from "../context/ProgressContext";
import {
  createTip,
  deleteTip,
  getTips,
  updateTip,
} from "../services/topicApi";

import "./Tips.css";

const DEFAULT_COLOR = "#1b1f24";

const emptyDraft = () => ({
  title: "",
  body: "",
  topicId: "general",
  color: DEFAULT_COLOR,
});

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const createDraftFromTip = (tip) => ({
  title: tip.title || "",
  body: tip.body || "",
  topicId: tip.topicId || "general",
  color: tip.color || DEFAULT_COLOR,
});

const Tips = () => {
  const { topics } = useProgress();

  const [tips, setTips] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");
  const [draft, setDraft] =
    useState(emptyDraft);
  const [editingId, setEditingId] =
    useState(null);
  const [query, setQuery] =
    useState("");
  const [selectedTopic, setSelectedTopic] =
    useState("all");

  useEffect(() => {
    const loadTips = async () => {
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
        (acc, topic) => {
          acc[topic._id] =
            topic.title ||
            topic.name ||
            "Topic";

          return acc;
        },
        {}
      );
    }, [topicOptions]);

  const draftTopicOptions =
    useMemo(
      () =>
        topicOptions.map((topic) => ({
          value: topic._id,
          label:
            topic.title ||
            topic.name ||
            "Topic",
        })),
      [topicOptions]
    );

  const filterTopicOptions =
    useMemo(
      () => [
        {
          value: "all",
          label: "All topics",
        },
        ...draftTopicOptions,
      ],
      [draftTopicOptions]
    );

  const filteredTips =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return tips
        .filter((tip) => {
          const matchesTopic =
            selectedTopic === "all" ||
            tip.topicId === selectedTopic;

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
          (first, second) =>
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
    setDraft(emptyDraft());
    setEditingId(null);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const title =
      draft.title.trim();
    const body =
      draft.body.trim();

    if (!title && !body) {
      setError(
        "Add a title or note before saving."
      );
      return;
    }

    try {
      setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tip) => {
    setDraft(
      createDraftFromTip(tip)
    );
    setEditingId(tip._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
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
          <header className="tips-header">
            <div>
              <h1>Tips</h1>

              <p>
                Quick notes for revision.
              </p>
            </div>

            <span>
              {tips.length} saved
            </span>
          </header>

          <section className="tips-layout">
            <form
              className="tips-form"
              onSubmit={handleSubmit}
            >
              <div className="tips-form-title">
                <div className="tips-form-icon">
                  {editingId ? (
                    <HiPencilSquare />
                  ) : (
                    <HiPlus />
                  )}
                </div>

                <div>
                  <h2>
                    {editingId
                      ? "Edit tip"
                      : "New tip"}
                  </h2>

                  <p>
                    Write one clear idea you want to remember.
                  </p>
                </div>
              </div>

              {error && (
                <div className="tips-error">
                  {error}
                </div>
              )}

              <label className="tips-field">
                <span>Title</span>

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
                  placeholder="Two pointer invariant"
                />
              </label>

              <div className="tips-field">
                <span>Topic</span>

                <Dropdown
                  value={draft.topicId}
                  width="100%"
                  options={draftTopicOptions}
                  onChange={(value) =>
                    setDraft({
                      ...draft,
                      topicId: value,
                    })
                  }
                />
              </div>

              <label className="tips-field">
                <span>Note</span>

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
                  placeholder="Add the approach, trap, edge case, or reminder."
                  rows={8}
                />
              </label>

              <div className="tips-form-actions">
                {editingId && (
                  <button
                    type="button"
                    className="tips-secondary-button"
                    onClick={resetDraft}
                  >
                    <HiXMark />
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="tips-primary-button"
                  disabled={saving}
                >
                  <HiCheck />
                  {saving
                    ? "Saving"
                    : editingId
                      ? "Update"
                      : "Save"}
                </button>
              </div>
            </form>

            <section className="tips-library">
              <div className="tips-library-header">
                <div>
                  <h2>Saved tips</h2>

                  <p>
                    Search and manage your revision notes.
                  </p>
                </div>
              </div>

              <div className="tips-toolbar">
                <label className="tips-search">
                  <HiMagnifyingGlass />

                  <input
                    value={query}
                    onChange={(event) =>
                      setQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search tips"
                  />
                </label>

                <div className="tips-filter">
                  <Dropdown
                    value={selectedTopic}
                    width="100%"
                    options={filterTopicOptions}
                    onChange={(value) =>
                      setSelectedTopic(
                        value
                      )
                    }
                  />
                </div>
              </div>

              {filteredTips.length === 0 ? (
                <div className="tips-empty">
                  <HiOutlineLightBulb />

                  <h3>
                    {loading
                      ? "Loading tips"
                      : "No tips found"}
                  </h3>

                  <p>
                    {loading
                      ? "Fetching your saved notes."
                      : "Create a new tip or adjust your filters."}
                  </p>
                </div>
              ) : (
                <div className="tips-list">
                  {filteredTips.map(
                    (tip) => (
                      <article
                        key={tip._id}
                        className={
                          editingId === tip._id
                            ? "tip-card is-editing"
                            : "tip-card"
                        }
                      >
                        <div className="tip-card-main">
                          <div className="tip-card-meta">
                            <span>
                              {topicNameById[
                                tip.topicId
                              ] || "General"}
                            </span>
                          </div>

                          <h3>
                            {tip.title ||
                              "Untitled tip"}
                          </h3>

                          <p>
                            {tip.body?.trim() ||
                              "No details added yet."}
                          </p>
                        </div>

                        <div className="tip-card-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(tip)
                            }
                            title="Edit tip"
                            aria-label="Edit tip"
                          >
                            <HiPencilSquare />
                          </button>

                          <button
                            type="button"
                            className="tip-delete-button"
                            onClick={() =>
                              handleDelete(
                                tip._id
                              )
                            }
                            title="Delete tip"
                            aria-label="Delete tip"
                          >
                            <HiTrash />
                          </button>
                        </div>

                        <time className="tip-card-date">
                          {formatDate(
                            tip.updatedAt
                          )}
                        </time>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </section>
        </main>
      </div>
    </>
  );
};

export default Tips;
