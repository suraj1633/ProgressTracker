import { useEffect } from "react";
import { createPortal } from "react-dom";

import "./NoteModal.css";

const NoteModal = ({
  open,
  onClose,
  note,
  setNote,
  onSave,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow =
        "hidden";
    }

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [open]);

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
      >
        <h2>Edit Note</h2>

        <textarea
          value={note}
          onChange={(e) =>
            setNote(
              e.target.value
            )
          }
          placeholder="Write your notes..."
        />

        <div className="modal-actions">
          <button onClick={onClose}>
            Cancel
          </button>

          <button onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteModal;