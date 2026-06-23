import {
  toggleQuestion,
  deleteQuestion,
  updateQuestion,
} from "../../services/topicApi";

import {
  useProgress,
} from "../../context/ProgressContext";

import DifficultyBadge from "../DifficultyBadge/DifficultyBadge";

import {
  useState,
} from "react";
import {
  FaCheck,
  FaPlus,
  FaRegEdit,
  FaTrash,
} from "react-icons/fa";

import NoteModal from "../NoteModal/NoteModal";

import "./QuestionRow.css";

const QuestionRow = ({
  question,
}) => {
  const {
    fetchTopics,
    fetchAnalytics,
    fetchDashboardStats,
    fetchHeatmap,
  } = useProgress();

  const [showNote, setShowNote] =
    useState(false);

  const [note, setNote] =
    useState(
      question.notes || ""
    );

  const hasNote =
    Boolean(
      question.notes?.trim()
    );

  const handleToggle =
    async () => {
      try {
        await toggleQuestion(
          question._id
        );

        await fetchTopics();
        await fetchAnalytics();
        await fetchDashboardStats();
        await fetchHeatmap();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async () => {
      try {
        await deleteQuestion(
          question._id
        );

        await fetchTopics();
        await fetchAnalytics();
        await fetchDashboardStats();
        await fetchHeatmap();
      } catch (error) {
        console.error(error);
      }
    };

  const handleSaveNote =
    async () => {
      try {
        await updateQuestion(
          question._id,
          {
            notes: note,
          }
        );

        await fetchTopics();

        setShowNote(false);
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div
      className={
        `question-row${
          question.completed
            ? " is-completed"
            : ""
        }`
      }
    >
      <div className="question-main">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={
              question.completed
            }
            onChange={
              handleToggle
            }
            aria-label={
              question.completed
                ? "Mark question as incomplete"
                : "Mark question as complete"
            }
          />

          <span className="custom-check">
            {question.completed && (
              <FaCheck />
            )}
          </span>
        </label>

        <div className="question-content">
          <span className="question-title">
            {question.title}
          </span>

          <div className="question-meta">
            <DifficultyBadge
              difficulty={
                question.difficulty
              }
            />
          </div>
        </div>
      </div>

      <div className="question-actions">
        <button
          className="row-action-btn note-action"
          onClick={() =>
            setShowNote(true)
          }
          aria-label={
            hasNote
              ? "Edit note"
              : "Add note"
          }
          title={
            hasNote
              ? "Edit note"
              : "Add note"
          }
        >
          {hasNote ? (
            <FaRegEdit />
          ) : (
            <FaPlus />
          )}
        </button>

        {question.sourceIcon && (
          <a
            className="row-action-btn source-action"
            href={
              question.sourceLink
            }
            target="_blank"
            rel="noreferrer"
            aria-label="Open source"
            title="Open source"
          >
            <img
              src={
                question.sourceIcon
              }
              alt=""
              className="source-icon"
            />
          </a>
        )}

        <button
          className="row-action-btn delete-question-btn"
          onClick={handleDelete}
          aria-label="Delete question"
          title="Delete question"
        >
          <FaTrash />
        </button>
      </div>

      <NoteModal
        open={showNote}
        onClose={() =>
          setShowNote(false)
        }
        note={note}
        setNote={setNote}
        onSave={handleSaveNote}
        questionTitle={
          question.title
        }
      />
    </div>
  );
};

export default QuestionRow;
