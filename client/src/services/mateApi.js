import API from "./api";

export const MATE_STATUS_UPDATED_EVENT =
  "mate-status-updated";
export const MATE_CHAT_UPDATED_EVENT =
  "mate-chat-updated";

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

export const createMateMessageStream = (
  mateId,
  onMessage,
  onError
) => {
  const token =
    localStorage.getItem("authToken");

  if (!token) {
    return null;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL || "";
  const streamUrl = `${apiUrl}/mates/${mateId}/messages/stream?token=${encodeURIComponent(
    token
  )}`;
  const source =
    new EventSource(streamUrl);

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
