import API from "./api";

export const MATE_STATUS_UPDATED_EVENT =
  "mate-status-updated";
export const MATE_CHAT_UPDATED_EVENT =
  "mate-chat-updated";
export const MATE_MESSAGE_READ_EVENT =
  "mate-message-read";

const getMateReadKey = (mateId) =>
  `mateLastReadMessage:${mateId}`;

export const getReadMateMessageId = (
  mateId
) =>
  localStorage.getItem(
    getMateReadKey(mateId)
  );

export const markMateMessageRead = (
  mateId,
  messageId
) => {
  if (!mateId || !messageId) {
    return;
  }

  localStorage.setItem(
    getMateReadKey(mateId),
    messageId
  );

  window.dispatchEvent(
    new CustomEvent(
      MATE_MESSAGE_READ_EVENT,
      {
        detail: {
          userId: mateId,
          messageId,
        },
      }
    )
  );
};

export const hasUnreadMateMessage = (
  mate
) =>
  Boolean(
    mate?.lastMessage?.id &&
      mate.lastMessage.sender === "mate" &&
      getReadMateMessageId(mate.id) !==
        mate.lastMessage.id
  );

export const getMates = async () => {
  const { data } = await API.get(
    "/mates"
  );

  return data.mates || [];
};

export const updateMateStatus = async (
  mateId,
  status
) => {
  const { data } = await API.patch(
    `/mates/${mateId}/status`,
    {
      status,
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      MATE_STATUS_UPDATED_EVENT,
      {
        detail: {
          userId: mateId,
          status,
        },
      }
    )
  );

  return data.mate;
};

export const getMateMessages = async (
  mateId
) => {
  const { data } = await API.get(
    `/mates/${mateId}/messages`
  );

  return data.messages || [];
};

export const sendMateMessage = async (
  mateId,
  text
) => {
  const { data } = await API.post(
    `/mates/${mateId}/messages`,
    {
      text,
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      MATE_CHAT_UPDATED_EVENT,
      {
        detail: {
          userId: mateId,
          message: data.message,
        },
      }
    )
  );

  return data.message;
};

export const deleteMateMessage = async (
  mateId,
  messageId
) => {
  const { data } = await API.delete(
    `/mates/${mateId}/messages/${messageId}`
  );

  window.dispatchEvent(
    new CustomEvent(
      MATE_CHAT_UPDATED_EVENT,
      {
        detail: {
          userId: mateId,
          message: data.message,
        },
      }
    )
  );

  return data.message;
};

export const createMateMessageStream = (
  mateId,
  onMessage,
  onError,
  onOpen
) => {
  const token =
    localStorage.getItem("authToken");

  if (!token) {
    return null;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL || "";
  const streamUrl = new URL(
    `${apiUrl.replace(/\/$/, "")}/mates/${mateId}/messages/stream`,
    window.location.origin
  );

  streamUrl.searchParams.set(
    "token",
    token
  );

  const source =
    new EventSource(
      streamUrl.toString()
    );

  if (onOpen) {
    source.addEventListener(
      "connected",
      onOpen
    );
  }

  source.addEventListener(
    "message",
    (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed stream messages.
      }
    }
  );

  if (onError) {
    source.addEventListener(
      "error",
      onError
    );
  }

  return source;
};

export const createMateInboxStream = (
  onMessage,
  onError,
  onOpen
) => {
  const token =
    localStorage.getItem("authToken");

  if (!token) {
    return null;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL || "";
  const streamUrl = new URL(
    `${apiUrl.replace(/\/$/, "")}/mates/messages/stream`,
    window.location.origin
  );

  streamUrl.searchParams.set(
    "token",
    token
  );

  const source =
    new EventSource(
      streamUrl.toString()
    );

  if (onOpen) {
    source.addEventListener(
      "connected",
      onOpen
    );
  }

  source.addEventListener(
    "message",
    (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed stream messages.
      }
    }
  );

  if (onError) {
    source.addEventListener(
      "error",
      onError
    );
  }

  return source;
};
