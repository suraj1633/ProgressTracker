import API from "./api";

/*
==================================
TOPICS
==================================
*/

// Get all topics
export const getTopics =
  async () => {
    const response =
      await API.get(
        "/topics"
      );

    return response.data;
  };

// Create topic
export const createTopic =
  async (topicData) => {
    const response =
      await API.post(
        "/topics",
        topicData
      );

    return response.data;
  };

// Delete topic
export const deleteTopic =
  async (id) => {
    const response =
      await API.delete(
        `/topics/${id}`
      );

    return response.data;
  };

/*
==================================
QUESTIONS
==================================
*/

// Add question
export const addQuestion =
  async (
    topicId,
    questionData
  ) => {
    const response =
      await API.post(
        `/topics/${topicId}/question`,
        questionData
      );

    return response.data;
  };

// Toggle completion
export const toggleQuestion =
  async (
    questionId
  ) => {
    const response =
      await API.patch(
        `/topics/question/${questionId}/toggle`
      );

    return response.data;
  };


  export const deleteQuestion =
  async (
    questionId
  ) => {
    const response =
      await API.delete(
        `/topics/question/${questionId}`
      );

    return response.data;
  };


  export const updateQuestion =
  async (
    questionId,
    updatedData
  ) => {
    const response =
      await API.put(
        `/topics/questions/${questionId}`,
        updatedData
      );

    return response.data;
  };
/*
==================================
ANALYTICS
==================================
*/

// Monthly analytics
export const getAnalytics =
  async (
    type = "month",
    year,
    month,
    week
  ) => {
    const params =
      new URLSearchParams({
        type,
      });

    if (year) {
      params.append(
        "year",
        year
      );
    }

    if (month) {
      params.append(
        "month",
        month
      );
    }

    if (week) {
      params.append(
        "week",
        week
      );
    }

    const response =
      await API.get(
        `/analytics?${params.toString()}`
      );

    return response.data;
  };

  export const getDashboardStats =
  async () => {
    const response =
      await API.get(
        "/topics/stats"
      );

    return response.data;
  };

  export const getHeatmap =
  async () => {
    const response =
      await API.get(
        "/analytics/heatmap"
      );

    return response.data;
  };

/*
==================================
TIPS
==================================
*/

export const getTips =
  async () => {
    const response =
      await API.get("/tips");

    return response.data;
  };

export const createTip =
  async (tipData) => {
    const response =
      await API.post(
        "/tips",
        tipData
      );

    return response.data;
  };

export const updateTip =
  async (
    id,
    tipData
  ) => {
    const response =
      await API.put(
        `/tips/${id}`,
        tipData
      );

    return response.data;
  };

export const deleteTip =
  async (id) => {
    const response =
      await API.delete(
        `/tips/${id}`
      );

    return response.data;
  };
