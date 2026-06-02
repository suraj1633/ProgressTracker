import {
  toggleQuestion,
  deleteQuestion,
  updateQuestion,
} from "../../services/topicApi";

import {
  useProgress,
} from "../../context/ProgressContext";

import DifficultyBadge from "../DifficultyBadge/DifficultyBadge";

import { useState } from "react";

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

  const handleToggle =
    async () => {
      try {
        await toggleQuestion(
          question._id
        );

        await fetchTopics();
        await fetchAnalytics();
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
    <div className="question-row">
      <div className="left">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={
              question.completed
            }
            onChange={
              handleToggle
            }
          />

          <span className="custom-check" />
        </label>

        <span
          className={
            question.completed
              ? "completed-question"
              : ""
          }
        >
          {question.title}
        </span>
      </div>

      <div className="right">
        <DifficultyBadge
          difficulty={
            question.difficulty
          }
        />

        <button
          className="note-pill"
          onClick={() =>
            setShowNote(true)
          }
        >
          {question.notes
            ? "📝 Edit Note"
            : "➕ Add Note"}
        </button>

        <button
          className="delete-question-btn"
          onClick={handleDelete}
        >
          🗑
        </button>

        {question.sourceIcon && (
          <a
            href={
              question.sourceLink
            }
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={
                question.sourceIcon
              }
              alt="source"
              className="source-icon"
            />
          </a>
        )}
      </div>

      <NoteModal
        open={showNote}
        onClose={() =>
          setShowNote(false)
        }
        note={note}
        setNote={setNote}
        onSave={handleSaveNote}
      />
    </div>
  );
};

export default QuestionRow;