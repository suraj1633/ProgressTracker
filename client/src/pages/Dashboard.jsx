import Navbar from "../components/Navbar/Navbar";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import TopicCard from "../components/TopicCard/TopicCard";
import AddTopicModal from "../components/AddTopicModal/AddTopicModal";
import StatsCard from "../components/StatsCard/StatsCard";
import Heatmap from "../components/Heatmap/Heatmap";

import {
  HiFire,
  HiBolt,
  HiCheckCircle,
  HiChartBar,
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

  const completionPercent =
    overallProgress.total === 0
      ? 0
      : Math.round(
          (overallProgress.completed /
            overallProgress.total) *
            100
        );

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <main className="dashboard-content">

          {/* HEADER */}
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

          {/* STATS SECTION */}
          <div className="stats-grid">
            <div className="dashboard-grid">

              {/* LEFT SIDE */}
              <div className="left-panel">

                <StatsCard
                  title="Daily Streak 🔥"
                  value={
                    dashboardStats.streak
                  }
                  icon={<HiFire />}
                />

                <StatsCard
                  title="Solved Today"
                  value={
                    dashboardStats.solvedToday
                  }
                  icon={<HiBolt />}
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
              </div>

              {/* RIGHT SIDE */}
              <div className="right-panel">

                <div className="top-row">
                  <StatsCard
                    title="Completion"
                    value={`${completionPercent}%`}
                    icon={<HiChartBar />}
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
                </div>

                <div className="middle-row">
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

                {/* OVERALL PROGRESS */}
                <div className="bottom-row">
                  <div className="overview-card">

                    <div className="overview-header">
                      <div>
                        <h2>
                          Overall Progress
                        </h2>

                        <p>
                          Your complete DSA
                          progress
                        </p>
                      </div>

                      <div className="completion-badge">
                        {completionPercent}%
                      </div>
                    </div>

                    <ProgressBar
                      completed={
                        overallProgress.completed
                      }
                      total={
                        overallProgress.total
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOPICS */}
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
                  tracking progress 🚀
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

          {/* HEATMAP */}
          <div className="heatmap-section">
            <Heatmap />
          </div>

        </main>
      </div>
    </>
  );
};

export default Dashboard;
