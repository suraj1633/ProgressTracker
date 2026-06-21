import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaEraser,
  FaRegStickyNote,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import "./NoteModal.css";

const NoteModal = ({
  open,
  onClose,
  note,
  setNote,
  onSave,
  questionTitle,
}) => {
  const trimmedNote =
    note.trim();

  const wordCount =
    trimmedNote
      ? trimmedNote
          .split(/\s+/)
          .length
      : 0;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown =
      (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="note-modal-overlay"
      onClick={onClose}
    >
      <form
        className="note-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
        aria-describedby="note-modal-description"
      >
        <div className="note-modal-header">
          <div className="note-modal-title-row">
            <span className="note-modal-icon">
              <FaRegStickyNote />
            </span>

            <div>
              <p className="note-modal-kicker">
                Question note
              </p>

              <h2 id="note-modal-title">
                Edit note
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="note-modal-close"
            onClick={onClose}
            aria-label="Close note"
          >
            <FaTimes />
          </button>
        </div>

        <div
          className="note-modal-question"
          id="note-modal-description"
        >
          <span>Question</span>

          <p>
            {questionTitle ||
              "Untitled question"}
          </p>
        </div>

        <div className="note-editor">
          <label
            className="note-editor-label"
            htmlFor="question-note"
          >
            Note
          </label>

          <textarea
            id="question-note"
            value={note}
            onChange={(event) =>
              setNote(
                event.target.value
              )
            }
            placeholder="Write a quick reminder, approach, or edge case to revisit..."
            autoFocus
          />

          <div className="note-editor-meta">
            <span>
              {trimmedNote
                ? "Draft ready"
                : "No note content"}
            </span>

            <span>
              {wordCount} words /{" "}
              {note.length} chars
            </span>
          </div>
        </div>

        <div className="note-modal-actions">
          <button
            type="button"
            className="note-modal-clear"
            onClick={() =>
              setNote("")
            }
            disabled={!note.length}
          >
            <FaEraser />
            Clear
          </button>

          <button
            type="button"
            className="note-modal-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="note-modal-primary"
          >
            <FaSave />
            Save note
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default NoteModal;
