import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Dropdown from "../Graph/Dropdown";

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

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const parseDateKey = (dateKey) => {
  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

const getLevel = (count) => {
  if (!count) return 0;
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  return 1;
};

const getDateRange = (
  selectedRange,
  today
) => {
  if (selectedRange === "current") {
    const startDate =
      new Date(today);

    startDate.setFullYear(
      startDate.getFullYear() - 1
    );

    return {
      startDate,
      endDate: today,
      label:
        "in the past one year",
    };
  }

  const year = Number(selectedRange);

  return {
    startDate: new Date(year, 0, 1),
    endDate: new Date(year, 11, 31),
    label: `in ${year}`,
  };
};

const getMonthCells = ({
  year,
  month,
  startDate,
  endDate,
  activityByDate,
}) => {
  const monthStart =
    new Date(year, month, 1);
  const monthEnd =
    new Date(
      year,
      month + 1,
      0
    );
  const firstDate =
    monthStart < startDate
      ? startDate
      : monthStart;
  const lastDate =
    monthEnd > endDate
      ? endDate
      : monthEnd;
  const leadingCells =
    firstDate.getDay();
  const cells = Array.from(
    {
      length: leadingCells,
    },
    () => null
  );
  const cursor =
    new Date(firstDate);

  while (cursor <= lastDate) {
    const dateKey =
      toDateKey(cursor);

    cells.push({
      date: dateKey,
      count:
        activityByDate[
          dateKey
        ] || 0,
    });

    cursor.setDate(
      cursor.getDate() + 1
    );
  }

  return cells;
};

const getMonthBlocks = ({
  startDate,
  endDate,
  activityByDate,
}) => {
  const blocks = [];
  const cursor =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );
  const endMonth =
    new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      1
    );

  while (cursor <= endMonth) {
    const year =
      cursor.getFullYear();
    const month =
      cursor.getMonth();

    blocks.push({
      key: `${year}-${month}`,
      label: MONTH_NAMES[month],
      cells: getMonthCells({
        year,
        month,
        startDate,
        endDate,
        activityByDate,
      }),
    });

    cursor.setMonth(
      cursor.getMonth() + 1
    );
  }

  return blocks;
};

const getMaxStreak = (
  entries,
  startDate,
  endDate
) => {
  const activeDates =
    new Set(
      entries
        .filter(
          (item) => item.count > 0
        )
        .map((item) => item.date)
    );
  let best = 0;
  let current = 0;
  const cursor =
    new Date(startDate);

  while (cursor <= endDate) {
    if (
      activeDates.has(
        toDateKey(cursor)
      )
    ) {
      current += 1;
      best = Math.max(
        best,
        current
      );
    } else {
      current = 0;
    }

    cursor.setDate(
      cursor.getDate() + 1
    );
  }

  return best;
};

const Heatmap = () => {
  const { heatmapData } =
    useProgress();
  const heatmapScrollRef =
    useRef(null);
  const [selectedRange,
    setSelectedRange] =
    useState("current");

  const today =
    useMemo(() => {
      const date = new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      return date;
    }, []);

  const yearOptions =
    useMemo(() => {
      const currentYear =
        today.getFullYear();
      const years =
        new Set([
          currentYear,
          currentYear - 1,
          currentYear - 2,
          currentYear - 3,
        ]);

      heatmapData.forEach(
        (item) => {
          const date =
            parseDateKey(item.date);

          if (
            !Number.isNaN(
              date.getTime()
            )
          ) {
            years.add(
              date.getFullYear()
            );
          }
        }
      );

      return [
        {
          value: "current",
          label: "Current",
        },
        ...Array.from(years)
          .sort((a, b) => b - a)
          .map((year) => ({
            value: String(year),
            label: String(year),
          })),
      ];
    }, [
      heatmapData,
      today,
    ]);

  const {
    startDate,
    endDate,
    label: rangeLabel,
  } = useMemo(
    () =>
      getDateRange(
        selectedRange,
        today
      ),
    [
      selectedRange,
      today,
    ]
  );

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

  const rangeEntries =
    useMemo(() => {
      return heatmapData.filter(
        (item) => {
          const itemDate =
            parseDateKey(item.date);

          return (
            itemDate >= startDate &&
            itemDate <= endDate
          );
        }
      );
    }, [
      heatmapData,
      startDate,
      endDate,
    ]);

  const monthBlocks =
    useMemo(
      () =>
        getMonthBlocks({
          startDate,
          endDate,
          activityByDate,
        }),
      [
        activityByDate,
        startDate,
        endDate,
      ]
    );

  const total =
    rangeEntries.reduce(
      (sum, item) =>
        sum + item.count,
      0
    );
  const activeDays =
    rangeEntries.filter(
      (item) => item.count > 0
    ).length;
  const maxStreak =
    getMaxStreak(
      rangeEntries,
      startDate,
      endDate
    );

  useEffect(() => {
    const heatmap =
      heatmapScrollRef.current;

    if (!heatmap)
      return;

    window.requestAnimationFrame(
      () => {
        heatmap.scrollLeft =
          heatmap.scrollWidth;
      }
    );
  }, [
    selectedRange,
    monthBlocks.length,
  ]);

  return (
    <section className="heatmap-card">
      <div className="heatmap-summary">
        <div className="heatmap-title-row">
          <h2>
            <strong>
              {total}
            </strong>{" "}
            submissions {rangeLabel}
          </h2>

          <span
            className="heatmap-info"
            aria-label="Heatmap shows solved question activity"
            title="Heatmap shows solved question activity"
          >
            i
          </span>
        </div>

        <div className="heatmap-meta-row">
          <p>
            Total active days:{" "}
            <strong>
              {activeDays}
            </strong>
          </p>

          <p>
            Max streak:{" "}
            <strong>
              {maxStreak}
            </strong>
          </p>

          <div className="heatmap-selector">
            <Dropdown
              value={selectedRange}
              options={yearOptions}
              onChange={setSelectedRange}
              width={132}
            />
          </div>
        </div>
      </div>

      <div
        className="heatmap-scroll"
        ref={heatmapScrollRef}
      >
        <div className="heatmap-months">
          {monthBlocks.map(
            (month) => (
              <div
                key={month.key}
                className="heatmap-month"
              >
                <div className="heatmap-month-grid">
                  {month.cells.map(
                    (cell, index) => (
                      <span
                        key={
                          cell
                            ? cell.date
                            : `${month.key}-blank-${index}`
                        }
                        className={
                          cell
                            ? `heat-cell level-${getLevel(
                                cell.count
                              )}`
                            : "heat-cell is-blank"
                        }
                        data-tooltip={
                          cell
                            ? `${cell.count} solved on ${cell.date}`
                            : undefined
                        }
                        aria-label={
                          cell
                            ? `${cell.count} solved on ${cell.date}`
                            : undefined
                        }
                        tabIndex={
                          cell ? 0 : undefined
                        }
                      />
                    )
                  )}
                </div>

                <div className="heatmap-month-label">
                  {month.label}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Heatmap;
