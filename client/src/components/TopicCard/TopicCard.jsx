import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaChevronDown,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import ProgressBar from "../ProgressBar/ProgressBar";
import QuestionRow from "../QuestionRow/QuestionRow";
import AddQuestionModal from "../AddQuestionModal/AddQuestionModal";

import {
  deleteTopic,
} from "../../services/topicApi";

import {
  useProgress,
} from "../../context/ProgressContext";

import "./TopicCard.css";

const TopicCard = ({
  topic,
}) => {
  const [expanded, setExpanded] =
    useState(false);

  const [
    showAddQuestion,
    setShowAddQuestion,
  ] = useState(false);

  const {
    removeTopicFromState,
    refreshActivityData,
  } = useProgress();

  const handleDelete =
    async () => {
      const confirmDelete =
        window.confirm(
          `Delete ${topic.title}?`
        );

      if (
        !confirmDelete
      )
        return;

      try {
        await deleteTopic(
          topic._id
        );

        removeTopicFromState(
          topic._id
        );

        await refreshActivityData();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="topic-card">
      <div className="topic-header">
        <div
          className="topic-click"
          onClick={() =>
            setExpanded(
              !expanded
            )
          }
        >
          <div className="topic-title-row">
            <h3>
              {topic.title}
            </h3>

            <span className="topic-count">
              {
                topic.completedQuestions
              }
              /
              {
                topic.totalQuestions
              }
            </span>
          </div>

          <p>
            {
              topic.description
            }
          </p>
        </div>

        <div className="topic-actions">
          <button
            className="add-question-btn"
            onClick={() =>
              setShowAddQuestion(
                !showAddQuestion
              )
            }
            aria-label="Add question"
            title="Add question"
          >
            <FaPlus />
          </button>

          <button
            className="delete-btn"
            onClick={
              handleDelete
            }
            aria-label="Delete topic"
            title="Delete topic"
          >
            <FaTrash />
          </button>

          <button
            className={
              `topic-btn${
                expanded
                  ? " is-expanded"
                  : ""
              }`
            }
            onClick={() =>
              setExpanded(
                !expanded
              )
            }
            aria-label={
              expanded
                ? "Collapse topic"
                : "Expand topic"
            }
            title={
              expanded
                ? "Collapse topic"
                : "Expand topic"
            }
          >
            <FaChevronDown />
          </button>
        </div>
      </div>

      <ProgressBar
        completed={
          topic.completedQuestions
        }
        total={
          topic.totalQuestions
        }
      />

      {expanded && (
        <motion.div
          className="question-list"
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
          }}
        >
          {showAddQuestion && (
            <AddQuestionModal
              topicId={topic._id}
            />
          )}

          {topic.questions
            ?.length ===
          0 ? (
            <p className="empty-state">
              No questions added
            </p>
          ) : (
            topic.questions.map(
              (
                question
              ) => (
                <QuestionRow
                  key={
                    question._id
                  }
                  question={
                    question
                  }
                />
              )
            )
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TopicCard;
