import Navbar from "../components/Navbar/Navbar";
import TopicCard from "../components/TopicCard/TopicCard";
import AddTopicModal from "../components/AddTopicModal/AddTopicModal";
import StatsCard from "../components/StatsCard/StatsCard";
import Heatmap from "../components/Heatmap/Heatmap";

import {
  HiFire,
  HiCheckCircle,
  HiFaceSmile,
  HiSignal,
  HiExclamationTriangle,
} from "react-icons/hi2";

import { useProgress } from "../context/ProgressContext";

import "./Dashboard.css";

const Dashboard = () => {
  const {
    overallProgress,
    difficultyCounts,
    topics,
    dashboardStats,
  } = useProgress();

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <main className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <h1>
                DSA Progress Tracker
              </h1>

              <p>
                Track your coding
                consistency and
                topic progress
              </p>
            </div>
          </div>

          <AddTopicModal />

          <div className="stats-grid">
            <StatsCard
              title="Daily Streak"
              value={
                dashboardStats.streak
              }
              icon={<HiFire />}
            />

            <StatsCard
              title="Solved Questions"
              value={
                overallProgress.completed
              }
              subtitle={`Out of ${overallProgress.total}`}
              icon={
                <HiCheckCircle />
              }
            />

            <StatsCard
              title="Easy"
              value={
                difficultyCounts.Easy
              }
              icon={
                <HiFaceSmile />
              }
            />

            <StatsCard
              title="Medium"
              value={
                difficultyCounts.Medium
              }
              icon={<HiSignal />}
            />

            <StatsCard
              title="Hard"
              value={
                difficultyCounts.Hard
              }
              icon={
                <HiExclamationTriangle />
              }
            />
          </div>

          <section className="topic-section">
            <div className="section-title">
              <h2>Topics</h2>

              <span>
                {topics.length} topics
              </span>
            </div>

            {topics?.length ===
            0 ? (
              <div className="empty-dashboard">
                <h3>
                  No topics added
                </h3>

                <p>
                  Create your first
                  topic and start
                  tracking progress
                </p>
              </div>
            ) : (
              topics.map(
                (topic) => (
                  <TopicCard
                    key={
                      topic._id
                    }
                    topic={topic}
                  />
                )
              )
            )}
          </section>

          <div className="heatmap-section">
            <Heatmap />
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
