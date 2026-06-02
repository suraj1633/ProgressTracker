import { useState } from "react";

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
      <input
        placeholder="Question"
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
      />

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

      <input
        placeholder="Source link"
        value={
          sourceLink
        }
        onChange={(e) =>
          setSourceLink(
            e.target.value
          )
        }
      />

      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) =>
          setNotes(
            e.target.value
          )
        }
      />

      <button
        type="submit"
      >
        Add
      </button>
    </form>
  );
};

export default AddQuestionModal;