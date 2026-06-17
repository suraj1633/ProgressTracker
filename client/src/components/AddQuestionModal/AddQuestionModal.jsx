import { useState } from "react";
import {
  FaPlus,
} from "react-icons/fa";

import {
  addQuestion,
} from "../../services/topicApi";

import {
  useProgress,
} from "../../context/ProgressContext";

import "./AddQuestionModal.css";

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
    fetchTopics,
  } = useProgress();

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        await addQuestion(
          topicId,
          {
            title,
            difficulty,
            sourceLink,
            notes,
          }
        );

        setTitle("");
        setDifficulty(
          "Easy"
        );
        setSourceLink("");
        setNotes("");

        await fetchTopics();
      } catch (error) {
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
        <h4>
          Add Question
        </h4>

        <span>
          Add a problem to this topic
        </span>
      </div>

      <div className="question-form-grid">
        <label className="question-title-field">
          <span>Question</span>
          <input
            placeholder="2574. Left and Right Sum Differences"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />
        </label>

        <label>
          <span>Difficulty</span>
          <select
            value={
              difficulty
            }
            onChange={(e) =>
              setDifficulty(
                e.target.value
              )
            }
          >
            <option>
              Easy
            </option>

            <option>
              Medium
            </option>

            <option>
              Hard
            </option>
          </select>
        </label>

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
          <input
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
      >
        <FaPlus />
        Add Question
      </button>
    </form>
  );
};

export default AddQuestionModal;
