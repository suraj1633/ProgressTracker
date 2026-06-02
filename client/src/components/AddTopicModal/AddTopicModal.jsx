import { useState } from "react";

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
      <h2>
        Add Topic
      </h2>

      <form
        onSubmit={
          handleSubmit
        }
      >
        <input
          type="text"
          placeholder="Topic Name"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Description"
          value={
            description
          }
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        <button
          type="submit"
        >
          Add Topic
        </button>
      </form>
    </div>
  );
};

export default AddTopicModal;