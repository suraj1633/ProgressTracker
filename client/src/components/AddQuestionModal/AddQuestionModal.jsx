import { useState } from "react";
import {
  FaPlus,
} from "react-icons/fa";

import {
  addQuestion,
} from "../../services/topicApi";

import Dropdown from "../Graph/Dropdown";

import {
  useProgress,
} from "../../context/ProgressContext";

import "./AddQuestionModal.css";

const difficultyOptions = [
  {
    value: "Easy",
    label: "Easy",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "Hard",
    label: "Hard",
  },
];

const AddQuestionModal = ({
  topicId,
}) => {
  const [title, setTitle] =
    useState("");

  const [
    difficulty,
    setDifficulty,
  ] = useState("Easy");

  const [
    sourceLink,
    setSourceLink,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const {
    addQuestionToTopic,
    replaceQuestionInTopic,
    removeQuestionFromState,
  } = useProgress();

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const questionDraft = {
        title: title.trim(),
        difficulty,
        sourceLink:
          sourceLink.trim(),
        notes: notes.trim(),
      };

      if (!questionDraft.title)
        return;

      const temporaryQuestion = {
        _id:
          globalThis.crypto?.randomUUID?.() ||
          `temp-question-${Date.now()}-${Math.random()}`,
        ...questionDraft,
        topicId,
        sourceIcon: "",
        completed: false,
        completedAt: null,
        createdAt:
          new Date().toISOString(),
        isPending: true,
      };

      addQuestionToTopic(
        topicId,
        temporaryQuestion
      );

      setTitle("");
      setDifficulty("Easy");
      setSourceLink("");
      setNotes("");

      try {
        const question =
          await addQuestion(
          topicId,
          questionDraft
        );

        replaceQuestionInTopic(
          topicId,
          temporaryQuestion._id,
          question
        );
      } catch (error) {
        removeQuestionFromState(
          temporaryQuestion._id
        );

        console.error(error);
      }
    };

  return (
    <form
      className="question-form"
      onSubmit={
        handleSubmit
      }
    >
      <div className="question-form-header">
        <div className="question-form-heading">
          <span className="question-form-icon">
            <FaPlus />
          </span>

          <div>
            <h4>
              Add Question
            </h4>

            <span>
              Add a problem to this topic
            </span>
          </div>
        </div>
      </div>

      <div className="question-form-grid">
        <label className="question-title-field">
          <span>Question</span>
          <input
            placeholder="2574. Left and Right Sum Differences"
            value={title}
            required
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />
        </label>

        <div className="question-form-field question-difficulty-field">
          <span>Difficulty</span>

          <Dropdown
            value={difficulty}
            width="100%"
            options={difficultyOptions}
            onChange={setDifficulty}
          />
        </div>

        <label>
          <span>Source link</span>
          <input
            placeholder="https://..."
            value={
              sourceLink
            }
            onChange={(e) =>
              setSourceLink(
                e.target.value
              )
            }
          />
        </label>

        <label>
          <span>Notes</span>
          <textarea
            placeholder="Optional reminder"
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
      >
        <FaPlus />
        Add Question
      </button>
    </form>
  );
};

export default AddQuestionModal;
