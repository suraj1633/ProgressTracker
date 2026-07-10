import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  HiArrowLeft,
  HiPaperAirplane,
} from "react-icons/hi2";

import {
  getMateMessages,
  sendMateMessage,
} from "../../services/mateApi";
import "./MateChatPanel.css";

const formatMessageTime = (value) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const MateChatPanel = ({
  selectedUser,
  onBack,
  onOpenProfile,
  embedded = false,
}) => {
  const threadRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] =
    useState([]);
  const [isSending, setIsSending] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadThread = async () => {
      try {
        const nextMessages =
          await getMateMessages(
            selectedUser.id
          );

        if (isMounted) {
          setMessages(nextMessages);
        }
      } catch {
        if (isMounted) {
          setMessages([]);
        }
      }
    };

    loadThread();
    setDraft("");

    return () => {
      isMounted = false;
    };
  }, [selectedUser.id]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = draft.trim();

    if (!text || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const message =
        await sendMateMessage(
          selectedUser.id,
          text
        );

      setMessages((currentMessages) => [
        ...currentMessages,
        message,
      ]);
      setDraft("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`mate-chat-panel ${
        embedded ? "embedded" : ""
      }`}
    >
      <section className="mate-chat-shell">
        <header className="mate-chat-header">
          <button
            type="button"
            className="mate-chat-person"
            onClick={onOpenProfile}
            disabled={!onOpenProfile}
            aria-label={`Open ${selectedUser.name} profile`}
            title={`${selectedUser.name} profile`}
          >
            <img
              src={selectedUser.avatar}
              alt=""
              aria-hidden="true"
            />

            <div>
              <h1>{selectedUser.name}</h1>
              <p>@{selectedUser.username}</p>
            </div>
          </button>

          {onBack && (
            <button
              type="button"
              className="mate-chat-back"
              onClick={onBack}
              aria-label="Back to mates"
              title="Back to mates"
            >
              <HiArrowLeft />
            </button>
          )}
        </header>

        <div
          ref={threadRef}
          className="mate-chat-thread"
        >
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mate-chat-message ${message.sender}`}
              >
                <p>{message.text}</p>
                <span>
                  {formatMessageTime(
                    message.createdAt
                  )}
                </span>
              </div>
            ))
          ) : (
            <div className="mate-chat-empty">
              <img
                src={selectedUser.avatar}
                alt=""
                aria-hidden="true"
              />
              <h2>{selectedUser.name}</h2>
              <p>
                Start a chat. Your messages with this mate stay here.
              </p>
            </div>
          )}
        </div>

        <form
          className="mate-chat-composer"
          onSubmit={sendMessage}
        >
          <input
            value={draft}
            onChange={(event) =>
              setDraft(event.target.value)
            }
            placeholder={`Message ${selectedUser.name}`}
            aria-label={`Message ${selectedUser.name}`}
          />

          <button
            type="submit"
            disabled={
              !draft.trim() || isSending
            }
            aria-label="Send message"
            title="Send message"
          >
            <HiPaperAirplane />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MateChatPanel;
