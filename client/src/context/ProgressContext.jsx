/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
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

        setTopics(data);
      } catch (error) {
        console.error(
          "Error fetching topics:",
          error
        );
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
      } catch (error) {
        console.error(error);
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
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error
        );
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
      } catch (error) {
        console.error(error);
      }
    };

  /*
==================================
OVERALL PROGRESS
==================================
*/

  const overallProgress =
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
    );

  /*
==================================
DIFFICULTY COUNTS
==================================
*/

  const difficultyCounts =
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

        await fetchTopics();

        await fetchAnalytics();

        await fetchDashboardStats();

        await fetchHeatmap();

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

        overallProgress,

        difficultyCounts,

        dashboardStats,

        fetchDashboardStats,

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
