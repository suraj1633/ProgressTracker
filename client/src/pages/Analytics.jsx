import Navbar from "../components/Navbar/Navbar";
import Graph from "../components/Graph/Graph";

import "./Analytics.css";

const Analytics = () => {
  return (
    <>
      <Navbar />

      <div className="analytics-page">
        <main className="analytics-content">
          <h1>Analytics</h1>

          <Graph />
        </main>
      </div>
    </>
  );
};

export default Analytics;