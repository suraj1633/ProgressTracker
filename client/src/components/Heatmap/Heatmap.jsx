import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

import {
  useProgress,
} from "../../context/ProgressContext";

import "./Heatmap.css";

const Heatmap = () => {
  const { heatmapData } =
    useProgress();

  const currentYear =
    new Date().getFullYear();

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <div>
          <h2>
            Yearly Consistency
          </h2>

          <p>
            Your DSA activity
          </p>
        </div>
      </div>

      <CalendarHeatmap
        startDate={
          new Date(
            currentYear,
            0,
            1
          )
        }
        endDate={
          new Date(
            currentYear,
            11,
            31
          )
        }
        values={heatmapData}
        gutterSize={5}
        showWeekdayLabels={false}
        classForValue={(
          value
        ) => {
          if (!value)
            return "color-empty";

          if (
            value.count >= 5
          )
            return "color-4";

          if (
            value.count >= 3
          )
            return "color-3";

          if (
            value.count >= 2
          )
            return "color-2";

          return "color-1";
        }}
      />
    </div>
  );
};

export default Heatmap;