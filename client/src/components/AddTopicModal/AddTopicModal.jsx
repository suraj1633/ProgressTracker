import { useState } from "react";
import {
  FaPlus,
} from "react-icons/fa";

import {
  createTopic,
} from "../../services/topicApi";

import {
  useProgress,
} from "../../context/ProgressContext";

import "../AddQuestionModal/AddQuestionModal.css";
import "./AddTopicModal.css";

const AddTopicModal = () => {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const {
    fetchTopics,
  } = useProgress();

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!title.trim())
        return;

      try {
        await createTopic({
          title: title.trim(),
          description:
            description.trim(),
        });

        setTitle("");
        setDescription("");

        await fetchTopics();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <form
      className="question-form topic-modal"
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
              Add Topic
            </h4>

            <span>
              Create a new practice section
            </span>
          </div>
        </div>
      </div>

      <div className="question-form-grid topic-modal-grid">
        <label>
          <span>Topic name</span>
          <input
            type="text"
            placeholder="Arrays, Trees, Dynamic Programming..."
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />
        </label>

        <label>
          <span>Description</span>
          <input
            type="text"
            placeholder="Short note about what this topic covers"
            value={
              description
            }
            onChange={(e) =>
              setDescription(
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
        Add Topic
      </button>
    </form>
  );
};

export default AddTopicModal;
