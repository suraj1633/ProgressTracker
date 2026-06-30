/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getTopics,
  getAnalytics,
  getDashboardStats,
  getHeatmap,
} from "../services/topicApi";
import { useAuth } from "./AuthContext";

const ProgressContext =
  createContext();

const topicTitleCollator =
  new Intl.Collator(undefined, {
    sensitivity: "base",
    numeric: true,
  });

const getQuestionTime =
  (question) => {
    const time =
      new Date(
        question.createdAt ||
          question.updatedAt ||
          0
      ).getTime();

    return Number.isFinite(time)
      ? time
      : 0;
  };

const sortQuestionsByNewest =
  (questions = []) =>
    [...questions].sort(
      (a, b) =>
        getQuestionTime(b) -
        getQuestionTime(a)
    );

const sortTopicsByTitle =
  (topics = []) =>
    [...topics].sort((a, b) =>
      topicTitleCollator.compare(
        a.title || "",
        b.title || ""
      )
    );

const normalizeTopics =
  (topics = []) =>
    sortTopicsByTitle(
      topics.map((topic) => ({
        ...topic,
        questions:
          sortQuestionsByNewest(
            topic.questions || []
          ),
      }))
    );

export const ProgressProvider = ({
  children,
}) => {
  const { user, loading: authLoading } =
    useAuth();

  const [topics, setTopics] =
    useState([]);

  const [analytics, setAnalytics] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  const [dashboardStats,
  setDashboardStats] =
  useState({
    streak: 0,
    solvedToday: 0,
  });

  const [heatmapData,
  setHeatmapData] =
  useState([]);

  /*
==================================
FETCH TOPICS
==================================
*/

  const fetchTopics =
    async () => {
      try {
        const data =
          await getTopics();

        const sortedTopics =
          normalizeTopics(data);

        setTopics(sortedTopics);

        return sortedTopics;
      } catch (error) {
        console.error(
          "Error fetching topics:",
          error
        );

        return [];
      }
    };


  const fetchDashboardStats =
    async () => {
      try {
        const data =
          await getDashboardStats();

        setDashboardStats(
          data
        );

        return data;
      } catch (error) {
        console.error(error);

        return null;
      }
    };

  /*
==================================
FETCH ANALYTICS
==================================
*/

  const fetchAnalytics =
    async (
      type = "month",
      year,
      month,
      week,
      range
    ) => {
      try {
        const data =
          await getAnalytics(
            type,
            year,
            month,
            week,
            range
          );

        setAnalytics(data);

        return data;
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error
        );

        return [];
      }
    };

  const fetchHeatmap =
    async () => {
      try {
        const data =
          await getHeatmap();

        setHeatmapData(
          data
        );

        return data;
      } catch (error) {
        console.error(error);

        return [];
      }
    };

  const refreshActivityData =
    async () => {
      await Promise.all([
        fetchAnalytics(),
        fetchDashboardStats(),
        fetchHeatmap(),
      ]);
    };

  const addTopicToState =
    (topic) => {
      setTopics((currentTopics) =>
        normalizeTopics([
          {
            ...topic,
            questions:
              topic.questions || [],
          },
          ...currentTopics,
        ])
      );
    };

  const removeTopicFromState =
    (topicId) => {
      setTopics((currentTopics) =>
        currentTopics.filter(
          (topic) =>
            topic._id !== topicId
        )
      );
    };

  const addQuestionToTopic =
    (topicId, question) => {
      setTopics((currentTopics) =>
        currentTopics.map((topic) => {
          if (topic._id !== topicId) {
            return topic;
          }

          const totalQuestions =
            (topic.totalQuestions || 0) +
            1;

          return {
            ...topic,
            totalQuestions,
            progressPercentage:
              totalQuestions === 0
                ? 0
                : (
                    ((topic.completedQuestions ||
                      0) /
                      totalQuestions) *
                    100
                  ).toFixed(2),
            questions:
              sortQuestionsByNewest([
                question,
                ...(topic.questions || []),
              ]),
          };
        })
      );
    };

  const replaceQuestionInTopic =
    (
      topicId,
      questionId,
      replacementQuestion
    ) => {
      setTopics((currentTopics) =>
        currentTopics.map((topic) => {
          if (topic._id !== topicId) {
            return topic;
          }

          return {
            ...topic,
            questions:
              sortQuestionsByNewest(
                topic.questions?.map(
                  (question) =>
                    question._id ===
                    questionId
                      ? replacementQuestion
                      : question
                ) || []
              ),
          };
        })
      );
    };

  const updateQuestionInState =
    (updatedQuestion, updatedTopic) => {
      setTopics((currentTopics) =>
        currentTopics.map((topic) => {
          if (
            topic._id !==
            updatedQuestion.topicId
          ) {
            return topic;
          }

          return {
            ...topic,
            ...(updatedTopic || {}),
            questions:
              topic.questions?.map(
                (question) =>
                  question._id ===
                  updatedQuestion._id
                    ? updatedQuestion
                    : question
              ) || [],
          };
        })
      );
    };

  const removeQuestionFromState =
    (questionId) => {
      setTopics((currentTopics) =>
        currentTopics.map((topic) => {
          const question =
            topic.questions?.find(
              (item) =>
                item._id === questionId
            );

          if (!question) {
            return topic;
          }

          const totalQuestions =
            Math.max(
              (topic.totalQuestions || 0) -
                1,
              0
            );
          const completedQuestions =
            Math.max(
              (topic.completedQuestions ||
                0) -
                (question.completed
                  ? 1
                  : 0),
              0
            );

          return {
            ...topic,
            totalQuestions,
            completedQuestions,
            progressPercentage:
              totalQuestions === 0
                ? 0
                : (
                    (completedQuestions /
                      totalQuestions) *
                    100
                  ).toFixed(2),
            questions:
              topic.questions.filter(
                (item) =>
                  item._id !==
                  questionId
              ),
          };
        })
      );
    };

  /*
==================================
OVERALL PROGRESS
==================================
*/

  const overallProgress =
    useMemo(
      () =>
        topics.reduce(
          (acc, topic) => {
            acc.total +=
              topic.totalQuestions;

            acc.completed +=
              topic.completedQuestions;

            return acc;
          },
          {
            total: 0,
            completed: 0,
          }
        ),
      [topics]
    );

  /*
==================================
DIFFICULTY COUNTS
==================================
*/

  const difficultyCounts =
    useMemo(
      () =>
        topics.reduce(
          (acc, topic) => {
            topic.questions?.forEach(
              (question) => {
                if (
                  question.completed
                ) {
                  acc[
                    question
                      .difficulty
                  ] += 1;
                }
              }
            );

            return acc;
          },
          {
            Easy: 0,
            Medium: 0,
            Hard: 0,
          }
        ),
      [topics]
    );

  /*
==================================
INITIAL LOAD
==================================
*/

  useEffect(() => {
    const loadData =
      async () => {
        if (authLoading) {
          return;
        }

        if (!user) {
          setTopics([]);
          setAnalytics([]);
          setHeatmapData([]);
          setDashboardStats({
            streak: 0,
            solvedToday: 0,
          });
          setLoading(false);
          return;
        }

        setLoading(true);

        await Promise.all([
          fetchTopics(),
          fetchAnalytics(),
          fetchDashboardStats(),
          fetchHeatmap(),
        ]);

        setLoading(false);
      };

    loadData();
  }, [authLoading, user]);

  return (
    <ProgressContext.Provider
      value={{
        topics,
        setTopics,

        analytics,
        setAnalytics,

        loading,

        fetchTopics,
        fetchAnalytics,
        refreshActivityData,

        overallProgress,

        difficultyCounts,

        dashboardStats,

        fetchDashboardStats,
        addTopicToState,
        removeTopicFromState,
        addQuestionToTopic,
        replaceQuestionInTopic,
        updateQuestionInState,
        removeQuestionFromState,

        heatmapData,
        fetchHeatmap,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress =
  () =>
    useContext(
      ProgressContext
    );
