import {
  useMemo,
} from "react";

import Navbar from "../components/Navbar/Navbar";
import Graph from "../components/Graph/Graph";
import {
  useProgress,
} from "../context/ProgressContext";

import "./Analytics.css";

const Analytics = () => {
  const {
    overallProgress,
    difficultyCounts,
    heatmapData,
  } = useProgress();

  const activeDays =
    useMemo(() => {
      return heatmapData.filter(
        (item) =>
          item.count > 0
      ).length;
    }, [heatmapData]);

  return (
    <>
      <Navbar />

      <div className="analytics-page">
        <main className="analytics-content">
          <section className="analytics-hero">
            <div className="analytics-title-block">
              <h1>Analytics</h1>

              <p>
                Review monthly solving trends and difficulty balance.
              </p>
            </div>
          </section>

          <section className="analytics-workspace">
            <div className="analytics-chart-panel">
              <Graph />
            </div>

            <aside className="analytics-side-panel">
              <div className="analytics-side-header">
                <span>
                  Difficulty mix
                </span>

                <strong>
                  {
                    overallProgress.completed
                  }
                </strong>
              </div>

              <div className="analytics-difficulty-list">
                <div className="difficulty-row easy">
                  <span>Easy</span>
                  <strong>
                    {difficultyCounts.Easy}
                  </strong>
                </div>

                <div className="difficulty-row medium">
                  <span>Medium</span>
                  <strong>
                    {difficultyCounts.Medium}
                  </strong>
                </div>

                <div className="difficulty-row hard">
                  <span>Hard</span>
                  <strong>
                    {difficultyCounts.Hard}
                  </strong>
                </div>
              </div>

              <div className="analytics-side-divider" />

              <div className="analytics-consistency">
                <span>
                  Consistency
                </span>

                <strong>
                  {activeDays}
                </strong>

                <p>
                  active days recorded in
                  your heatmap history.
                </p>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </>
  );
};

export default Analytics;
