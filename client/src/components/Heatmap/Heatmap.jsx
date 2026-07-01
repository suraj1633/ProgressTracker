import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import Dropdown from "../Graph/Dropdown";

import {
  useProgress,
} from "../../context/ProgressContext";
import {
  useAuth,
} from "../../context/AuthContext";

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

const formatTooltipDate = (
  dateKey
) =>
  new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(parseDateKey(dateKey));

const formatTooltip = (cell) =>
  `${cell.count} ${
    cell.count === 1
      ? "sub"
      : "subs"
  }, ${formatTooltipDate(cell.date)}`;

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
    const currentYear =
      today.getFullYear();
    const startDate =
      new Date(today);
    const metricStartDate =
      new Date(currentYear, 0, 1);

    startDate.setFullYear(
      startDate.getFullYear() - 1
    );

    return {
      startDate,
      endDate: today,
      metricStartDate,
      metricEndDate: today,
      label: `in ${currentYear}`,
    };
  }

  const year = Number(selectedRange);
  const yearStart =
    new Date(year, 0, 1);
  const yearEnd =
    new Date(year, 11, 31);

  return {
    startDate: yearStart,
    endDate: yearEnd,
    metricStartDate: yearStart,
    metricEndDate: yearEnd,
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
  const { user } = useAuth();
  const heatmapScrollRef =
    useRef(null);
  const [tooltip,
    setTooltip] =
    useState(null);
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
      const joinedDate =
        user?.createdAt
          ? new Date(user.createdAt)
          : today;
      const joinedYear =
        Number.isNaN(
          joinedDate.getTime()
        )
          ? currentYear
          : joinedDate.getFullYear();
      const pastYearCount =
        Math.max(
          0,
          currentYear - joinedYear
        );
      const pastYears =
        Array.from(
          {
            length: pastYearCount,
          },
          (_, index) =>
            currentYear - index - 1
        );

      return [
        {
          value: "current",
          label: "Current",
        },
        ...pastYears.map((year) => ({
            value: String(year),
            label: String(year),
          })),
      ];
    }, [
      today,
      user,
    ]);

  const activeSelectedRange =
    yearOptions.some(
      (option) =>
        option.value === selectedRange
    )
      ? selectedRange
      : "current";

  const {
    startDate,
    endDate,
    metricStartDate,
    metricEndDate,
    label: rangeLabel,
  } = useMemo(
    () =>
      getDateRange(
        activeSelectedRange,
        today
      ),
    [
      activeSelectedRange,
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

  const metricEntries =
    useMemo(() => {
      return heatmapData.filter(
        (item) => {
          const itemDate =
            parseDateKey(item.date);

          return (
            itemDate >=
              metricStartDate &&
            itemDate <= metricEndDate
          );
        }
      );
    }, [
      heatmapData,
      metricStartDate,
      metricEndDate,
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
    metricEntries.reduce(
      (sum, item) =>
        sum + item.count,
      0
    );
  const activeDays =
    metricEntries.filter(
      (item) => item.count > 0
    ).length;
  const maxStreak =
    getMaxStreak(
      metricEntries,
      metricStartDate,
      metricEndDate
    );

  useEffect(() => {
    const heatmap =
      heatmapScrollRef.current;

    if (
      !heatmap ||
      !window.matchMedia(
        "(max-width: 700px)"
      ).matches
    ) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(
        () => {
          heatmap.scrollLeft =
            heatmap.scrollWidth;
        }
      );
    });
  }, [
    activeSelectedRange,
    monthBlocks.length,
  ]);

  const showTooltip = (
    cell,
    event
  ) => {
    if (!cell) return;

    const rect =
      event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 142;
    const viewportGap = 8;
    const center =
      rect.left + rect.width / 2;
    const left = Math.min(
      window.innerWidth -
        tooltipWidth / 2 -
        viewportGap,
      Math.max(
        tooltipWidth / 2 +
          viewportGap,
        center
      )
    );
    const hasRoomAbove =
      rect.top > 48;

    setTooltip({
      text: formatTooltip(cell),
      left,
      top: hasRoomAbove
        ? rect.top - 8
        : rect.bottom + 8,
      placement: hasRoomAbove
        ? "top"
        : "bottom",
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

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
        </div>

        <div className="heatmap-meta-row">
          <div className="heatmap-meta-stats">
            <p>
              Total active days:{" "}
              <strong>
                {activeDays}
              </strong>
            </p>

            <p>
              Max streak:{" "}
              <strong className="heatmap-max-streak-value">
                {maxStreak}
              </strong>
            </p>
          </div>

          <div className="heatmap-selector">
            <Dropdown
              value={activeSelectedRange}
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
        <div
          className="heatmap-months"
          style={{
            "--month-count":
              monthBlocks.length,
          }}
        >
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
                            ? formatTooltip(
                                cell
                              )
                            : undefined
                        }
                        aria-label={
                          cell
                            ? formatTooltip(
                                cell
                              )
                            : undefined
                        }
                        tabIndex={
                          cell ? 0 : undefined
                        }
                        onMouseEnter={
                          cell
                            ? (event) =>
                                showTooltip(
                                  cell,
                                  event
                                )
                            : undefined
                        }
                        onMouseLeave={
                          cell
                            ? hideTooltip
                            : undefined
                        }
                        onFocus={
                          cell
                            ? (event) =>
                                showTooltip(
                                  cell,
                                  event
                                )
                            : undefined
                        }
                        onBlur={
                          cell
                            ? hideTooltip
                            : undefined
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
      {tooltip &&
        createPortal(
          <div
            className={`heatmap-tooltip is-${tooltip.placement}`}
            style={{
              left: `${tooltip.left}px`,
              top: `${tooltip.top}px`,
            }}
          >
            {tooltip.text}
          </div>,
          document.body
        )}
    </section>
  );
};

export default Heatmap;
