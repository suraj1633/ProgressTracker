import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
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
  useEffect(() => {
    if (!open) return undefined;

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
        "auto";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="note-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
      >
        <div className="note-modal-header">
          <div>
            <p className="note-modal-kicker">
              Question note
            </p>
            <h2 id="note-modal-title">
              Edit Note
            </h2>
          </div>

          <button
            className="note-modal-close"
            onClick={onClose}
            aria-label="Close note"
          >
            <FaTimes />
          </button>
        </div>

        {questionTitle && (
          <p className="note-modal-question">
            {questionTitle}
          </p>
        )}

        <div className="note-editor">
          <textarea
            value={note}
            onChange={(e) =>
              setNote(
                e.target.value
              )
            }
            placeholder="Write a quick reminder, approach, or edge case to revisit..."
            autoFocus
          />

          <div className="note-editor-meta">
            <span>
              {note.trim()
                ? "Saved when you click Save"
                : "Empty notes are allowed"}
            </span>
            <span>
              {note.length} chars
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="modal-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="modal-primary"
            onClick={onSave}
          >
            <FaSave />
            Save Note
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteModal;
