import {
  useMemo,
} from "react";

import {
  useProgress,
} from "../../context/ProgressContext";

import "./Heatmap.css";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEK_DAYS = [
  "Mon",
  "Wed",
  "Fri",
];

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}`;

const getLevel = (count) => {
  if (!count) return 0;
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  return 1;
};

const getMonthMatrix = ({
  year,
  month,
  today,
  activityByDate,
}) => {
  const firstDay =
    new Date(year, month, 1);

  const lastDay =
    month === today.getMonth()
      ? today
      : new Date(
          year,
          month + 1,
          0
        );

  const startOffset =
    (firstDay.getDay() + 6) % 7;

  const cells = Array.from(
    {
      length: startOffset,
    },
    () => null
  );

  for (
    let day = 1;
    day <= lastDay.getDate();
    day++
  ) {
    const date =
      new Date(
        year,
        month,
        day
      );

    const dateKey =
      toDateKey(date);

    cells.push({
      date: dateKey,
      day,
      count:
        activityByDate[
          dateKey
        ] || 0,
    });
  }

  const remainder =
    cells.length % 7;

  if (remainder !== 0) {
    cells.push(
      ...Array.from(
        {
          length:
            7 - remainder,
        },
        () => null
      )
    );
  }

  const weeks = [];

  for (
    let index = 0;
    index < cells.length;
    index += 7
  ) {
    weeks.push(
      cells.slice(
        index,
        index + 7
      )
    );
  }

  return weeks;
};

const Heatmap = () => {
  const { heatmapData } =
    useProgress();

  const today =
    useMemo(
      () => new Date(),
      []
    );

  const currentYear =
    today.getFullYear();

  const activityByDate =
    useMemo(() => {
      return heatmapData.reduce(
        (acc, item) => {
          acc[item.date] =
            item.count;

          return acc;
        },
        {}
      );
    }, [heatmapData]);

  const months =
    useMemo(() => {
      return Array.from(
        {
          length:
            today.getMonth() + 1,
        },
        (_, month) => ({
          month,
          label:
            MONTH_NAMES[month],
          weeks: getMonthMatrix({
            year: currentYear,
            month,
            today,
            activityByDate,
          }),
        })
      );
    }, [
      activityByDate,
      currentYear,
      today,
    ]);

  const total =
    heatmapData.reduce(
      (sum, item) =>
        sum + item.count,
      0
    );

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <div>
          <h2>
            Yearly Consistency
          </h2>

          <p>
            {total} submissions in{" "}
            {currentYear}
          </p>
        </div>
      </div>

      <div className="leetcode-heatmap">
        <div className="weekday-labels">
          {WEEK_DAYS.map(
            (day) => (
              <span key={day}>
                {day}
              </span>
            )
          )}
        </div>

        <div className="month-row">
          {months.map(
            (month) => (
              <section
                key={month.label}
                className="month-block"
              >
                <div className="month-label">
                  {month.label}
                </div>

                <div className="month-grid">
                  {month.weeks.map(
                    (
                      week,
                      weekIndex
                    ) => (
                      <div
                        key={weekIndex}
                        className="heat-week"
                      >
                        {week.map(
                          (
                            cell,
                            dayIndex
                          ) => (
                            <span
                              key={`${weekIndex}-${dayIndex}`}
                              className={
                                cell
                                  ? `heat-cell level-${getLevel(
                                      cell.count
                                    )}`
                                  : "heat-cell is-empty-space"
                              }
                              title={
                                cell
                                  ? `${cell.count} solved on ${cell.date}`
                                  : ""
                              }
                            />
                          )
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(
          (level) => (
            <span
              key={level}
              className={`heat-cell level-${level}`}
            />
          )
        )}
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
