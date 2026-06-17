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
          title,
          description,
        });

        setTitle("");
        setDescription("");

        await fetchTopics();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="topic-modal">
      <div className="topic-modal-header">
        <h2>
          Add Topic
        </h2>

        <span>
          Create a new practice section
        </span>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
      >
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

        <button
          type="submit"
        >
          <FaPlus />
          Add Topic
        </button>
      </form>
    </div>
  );
};

export default AddTopicModal;
