import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiTrash,
} from "react-icons/hi2";

import {
  createMateMessageStream,
  deleteMateMessage,
  getMateMessages,
  markMateMessageRead,
  MATE_CHAT_UPDATED_EVENT,
  sendMateMessage,
} from "../../services/mateApi";
import "./MateChatPanel.css";

const formatMessageTime = (value) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const appendUniqueMessage = (
  currentMessages,
  nextMessage
) => {
  if (nextMessage.isDeleted) {
    return currentMessages.filter(
      (message) =>
        message.id !== nextMessage.id
    );
  }

  const existingIndex =
    currentMessages.findIndex(
      (message) =>
        message.id === nextMessage.id
    );

  if (existingIndex >= 0) {
    return currentMessages.map(
      (message, index) =>
        index === existingIndex
          ? {
              ...message,
              ...nextMessage,
            }
          : message
    );
  }

  return [
    ...currentMessages,
    nextMessage,
  ];
};

const mergeUniqueMessages = (
  currentMessages,
  nextMessages
) =>
  nextMessages.reduce(
    appendUniqueMessage,
    currentMessages
  );

const MateChatPanel = ({
  selectedUser,
  onBack,
  onOpenProfile,
  embedded = false,
}) => {
  const threadRef = useRef(null);
  const [
    draftState,
    setDraftState,
  ] = useState({
    mateId: selectedUser.id,
    value: "",
  });
  const [messages, setMessages] =
    useState([]);
  const [isSending, setIsSending] =
    useState(false);
  const [
    deletingMessageId,
    setDeletingMessageId,
  ] = useState(null);
  const activeMateIdRef = useRef(
    selectedUser.id
  );

  useEffect(() => {
    activeMateIdRef.current =
      selectedUser.id;
  }, [selectedUser.id]);

  const draft =
    draftState.mateId === selectedUser.id
      ? draftState.value
      : "";

  const setDraft = (value) => {
    setDraftState({
      mateId: selectedUser.id,
      value,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadThread = async (
      replace = false
    ) => {
      try {
        const nextMessages =
          await getMateMessages(
            selectedUser.id
          );

        if (isMounted) {
          setMessages(
            (currentMessages) =>
              replace
                ? nextMessages
                : mergeUniqueMessages(
                    currentMessages,
                    nextMessages
                  )
          );
        }
      } catch {
        if (isMounted && replace) {
          setMessages([]);
        }
      }
    };

    loadThread(true);

    const syncThread = () => {
      loadThread(false);
    };

    const pollThread = setInterval(
      syncThread,
      2500
    );

    window.addEventListener(
      "focus",
      syncThread
    );
    document.addEventListener(
      "visibilitychange",
      syncThread
    );

    return () => {
      isMounted = false;
      clearInterval(pollThread);
      window.removeEventListener(
        "focus",
        syncThread
      );
      document.removeEventListener(
        "visibilitychange",
        syncThread
      );
    };
  }, [selectedUser.id]);

  useEffect(() => {
    let isMounted = true;

    const syncThread = async () => {
      try {
        const nextMessages =
          await getMateMessages(
            selectedUser.id
          );

        if (
          isMounted &&
          activeMateIdRef.current ===
            selectedUser.id
        ) {
          setMessages(
            (currentMessages) =>
              mergeUniqueMessages(
                currentMessages,
                nextMessages
              )
          );
        }
      } catch {
        // The interval fallback in the thread loader will retry.
      }
    };

    const stream =
      createMateMessageStream(
        selectedUser.id,
        (message) => {
          setMessages(
            (currentMessages) =>
              appendUniqueMessage(
                currentMessages,
                message
              )
          );

          window.dispatchEvent(
            new CustomEvent(
              MATE_CHAT_UPDATED_EVENT,
              {
                detail: {
                  userId:
                    selectedUser.id,
                  message,
                },
              }
            )
          );
        },
        syncThread,
        syncThread
      );

    syncThread();

    return () => {
      isMounted = false;
      stream?.close();
    };
  }, [selectedUser.id]);

  useEffect(() => {
    const handleChatUpdate = (event) => {
      const { userId, message } =
        event.detail || {};

      if (
        userId !== selectedUser.id ||
        !message
      ) {
        return;
      }

      setMessages((currentMessages) =>
        appendUniqueMessage(
          currentMessages,
          message
        )
      );
    };

    window.addEventListener(
      MATE_CHAT_UPDATED_EVENT,
      handleChatUpdate
    );

    return () => {
      window.removeEventListener(
        MATE_CHAT_UPDATED_EVENT,
        handleChatUpdate
      );
    };
  }, [selectedUser.id]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const latestMessage =
      messages[messages.length - 1];

    if (latestMessage?.id) {
      markMateMessageRead(
        selectedUser.id,
        latestMessage.id
      );
    }
  }, [messages, selectedUser.id]);

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

      setMessages((currentMessages) =>
        appendUniqueMessage(
          currentMessages,
          message
        )
      );
      setDraft("");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (
    messageId
  ) => {
    if (deletingMessageId) {
      return;
    }

    setDeletingMessageId(messageId);

    try {
      const message =
        await deleteMateMessage(
          selectedUser.id,
          messageId
        );

      setMessages((currentMessages) =>
        appendUniqueMessage(
          currentMessages,
          message
        )
      );
    } finally {
      setDeletingMessageId(null);
    }
  };

  const requestDeleteMessage = (
    messageId
  ) => {
    if (
      window.confirm(
        "Delete this message?"
      )
    ) {
      handleDeleteMessage(messageId);
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
                className={`mate-chat-message ${message.sender} ${
                  message.canDelete
                    ? "can-delete"
                    : ""
                }`}
                role={
                  message.canDelete
                    ? "button"
                    : undefined
                }
                tabIndex={
                  message.canDelete ? 0 : undefined
                }
                onClick={() => {
                  if (message.canDelete) {
                    requestDeleteMessage(
                      message.id
                    );
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    message.canDelete &&
                    (event.key === "Enter" ||
                      event.key === " ")
                  ) {
                    event.preventDefault();
                    requestDeleteMessage(
                      message.id
                    );
                  }
                }}
              >
                <div className="mate-chat-message-row">
                  <p>{message.text}</p>

                  {message.canDelete && (
                    <button
                      type="button"
                      className="mate-chat-delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        requestDeleteMessage(
                          message.id
                        );
                      }}
                      disabled={
                        deletingMessageId ===
                        message.id
                      }
                      aria-label="Delete message"
                      title="Delete message"
                    >
                      <HiTrash />
                    </button>
                  )}
                </div>

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
