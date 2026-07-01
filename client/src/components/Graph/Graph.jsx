import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  useProgress,
} from "../../context/ProgressContext";
import {
  useAuth,
} from "../../context/AuthContext";

import Dropdown from "./Dropdown";

import "./Graph.css";

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

const difficultyKeys = [
  "Easy",
  "Medium",
  "Hard",
];

const roundedTopRadius = [
  6,
  6,
  0,
  0,
];

const squareRadius = [
  0,
  0,
  0,
  0,
];

const getStackRadius = (
  item,
  key
) => {
  if (!item[key]) {
    return squareRadius;
  }

  if (
    key === "Hard" ||
    (key === "Medium" &&
      !item.Hard) ||
    (key === "Easy" &&
      !item.Medium &&
      !item.Hard)
  ) {
    return roundedTopRadius;
  }

  return squareRadius;
};

const useElementSize = () => {
  const ref = useRef(null);
  const [size, setSize] =
    useState({
      width: 0,
      height: 0,
    });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      const { width, height } =
        element.getBoundingClientRect();

      setSize({
        width:
          width > 0
            ? Math.floor(width)
            : 0,
        height:
          height > 0
            ? Math.floor(height)
            : 0,
      });
    };

    updateSize();

    if (
      typeof ResizeObserver ===
      "undefined"
    ) {
      window.addEventListener(
        "resize",
        updateSize
      );

      return () => {
        window.removeEventListener(
          "resize",
          updateSize
        );
      };
    }

    const resizeObserver =
      new ResizeObserver(
        updateSize
      );

    resizeObserver.observe(
      element
    );

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, size];
};

const useIsNarrowScreen = () => {
  const getIsNarrow = () =>
    typeof window !==
      "undefined" &&
    window.matchMedia(
      "(max-width: 640px)"
    ).matches;

  const [isNarrow, setIsNarrow] =
    useState(getIsNarrow);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

    const mediaQuery =
      window.matchMedia(
        "(max-width: 640px)"
      );

    const handleChange = () =>
      setIsNarrow(
        mediaQuery.matches
      );

    handleChange();

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  return isNarrow;
};

const toDateKey = (
  date
) =>
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

const formatShortDate = (
  date
) =>
  `${MONTH_NAMES[
    date.getMonth()
  ]} ${date.getDate()}`;

const getRangeDates = ({
  startDate,
  endDate,
}) => {
  const dates = [];
  const cursor =
    new Date(startDate);

  while (cursor <= endDate) {
    dates.push(
      new Date(cursor)
    );

    cursor.setDate(
      cursor.getDate() + 1
    );
  }

  return dates;
};

const getPreviousMonthSameDate = (
  date
) => {
  const year =
    date.getFullYear();
  const month =
    date.getMonth();
  const day =
    date.getDate();
  const previousMonthLastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  return new Date(
    year,
    month - 1,
    Math.min(
      day,
      previousMonthLastDay
    )
  );
};

const CustomTooltip = ({
  active,
  payload,
}) => {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const total =
    payload.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (item.value || 0),
      0
    );

  const label =
    payload[0]?.payload
      ?.tooltipLabel;

  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">
        {label}
      </div>

      {payload.map(
        (item) => (
          <div
            key={
              item.dataKey
            }
            className={`tooltip-row ${item.dataKey.toLowerCase()}-text`}
          >
            <span>
              {item.dataKey}
            </span>

            <strong>
              {item.value}
            </strong>
          </div>
        )
      )}

      <div className="tooltip-total">
        Total {total}
      </div>
    </div>
  );
};

const Graph = () => {
  const {
    analytics,
    fetchAnalytics,
  } = useProgress();
  const { user } = useAuth();

  const isNarrowScreen =
    useIsNarrowScreen();

  const [
    chartShellRef,
    chartSize,
  ] = useElementSize();

  const today =
    useMemo(
      () => new Date(),
      []
    );

  const [year, setYear] =
    useState(
      today.getFullYear()
    );
  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    String(today.getMonth() + 1)
  );

  const currentYear =
    today.getFullYear();
  const currentMonth =
    today.getMonth() + 1;

  const joinedYear =
    useMemo(() => {
      const joinedDate =
        user?.createdAt
          ? new Date(user.createdAt)
          : today;

      if (
        Number.isNaN(
          joinedDate.getTime()
        )
      ) {
        return currentYear;
      }

      return Math.min(
        joinedDate.getFullYear(),
        currentYear
      );
    }, [
      currentYear,
      today,
      user,
    ]);
  const joinedMonth =
    useMemo(() => {
      const joinedDate =
        user?.createdAt
          ? new Date(user.createdAt)
          : today;

      if (
        Number.isNaN(
          joinedDate.getTime()
        )
      ) {
        return currentMonth;
      }

      return joinedDate.getMonth() + 1;
    }, [
      currentMonth,
      today,
      user,
    ]);

  const yearOptions =
    useMemo(() => {
      return Array.from(
        {
          length:
            currentYear -
            joinedYear +
            1,
        },
        (_, index) =>
          String(
            currentYear -
              index
          )
      );
    }, [
      currentYear,
      joinedYear,
    ]);
  const monthOptions =
    useMemo(
      () => {
        const startMonth =
          year === joinedYear
            ? joinedMonth
            : 1;
        const endMonth =
          year === currentYear
            ? currentMonth
            : 12;

        return MONTH_NAMES.slice(
          startMonth - 1,
          endMonth
        ).map(
          (monthName, index) => ({
            value: String(
              startMonth + index
            ),
            label: monthName,
          })
        );
      },
      [
        currentMonth,
        currentYear,
        joinedMonth,
        joinedYear,
        year,
      ]
    );

  const activeSelectedMonth =
    monthOptions.some(
      (option) =>
        option.value === selectedMonth
    )
      ? selectedMonth
      : monthOptions[0]?.value ||
        String(currentMonth);
  const selectedMonthNumber =
    Number(activeSelectedMonth);
  const isCurrentMonthView =
    year === currentYear &&
    selectedMonthNumber ===
      currentMonth;
  const activeRange =
    useMemo(() => {
      if (isCurrentMonthView) {
        const startDate =
          getPreviousMonthSameDate(
            today
          );
        const endDate =
          new Date(today);
        const endExclusive =
          new Date(endDate);

        startDate.setHours(
          0,
          0,
          0,
          0
        );
        endDate.setHours(
          0,
          0,
          0,
          0
        );
        endExclusive.setDate(
          endExclusive.getDate() +
            1
        );
        endExclusive.setHours(
          0,
          0,
          0,
          0
        );

        return {
          startDate,
          endDate,
          endExclusive,
        };
      }

      return {
        startDate:
          new Date(
            year,
            selectedMonthNumber - 1,
            1
          ),
        endDate:
          new Date(
            year,
            selectedMonthNumber,
            0
          ),
        endExclusive:
          new Date(
            year,
            selectedMonthNumber,
            1
          ),
      };
    }, [
      isCurrentMonthView,
      selectedMonthNumber,
      today,
      year,
    ]);
  const selectedRangeLabel =
    isCurrentMonthView
      ? `${formatShortDate(
          activeRange.startDate
        )} - ${formatShortDate(
          activeRange.endDate
        )}`
      : `${MONTH_NAMES[
          selectedMonthNumber - 1
        ]} ${year}`;

  useEffect(() => {
    fetchAnalytics(
      isCurrentMonthView
        ? "range"
        : "month",
      year,
      isCurrentMonthView
        ? undefined
        : selectedMonthNumber,
      undefined,
      isCurrentMonthView
        ? {
            startDate:
              toDateKey(
                activeRange.startDate
              ),
            endDate:
              toDateKey(
                activeRange.endExclusive
              ),
          }
        : undefined
    );
    // Keep analytics requests tied to selected controls only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeRange.endExclusive,
    activeRange.startDate,
    isCurrentMonthView,
    selectedMonthNumber,
    year,
  ]);

  const chartData =
    useMemo(() => {
      const analyticsByDate =
        analytics.reduce(
          (
            acc,
            item
          ) => {
            acc[item.date] =
              item;

            return acc;
          },
          {}
        );

      return getRangeDates({
        startDate:
          activeRange.startDate,
        endDate:
          activeRange.endDate,
      }).map((date) => {
        const dateKey =
          toDateKey(date);

        const item =
          analyticsByDate[
            dateKey
          ] || {};

        const total =
          difficultyKeys.reduce(
            (
              sum,
              key
            ) =>
              sum +
              (item[key] || 0),
            0
          );

        return {
          date: dateKey,
          label:
            formatShortDate(
              date
            ),
          tooltipLabel:
            formatShortDate(
              date
            ),
          Easy:
            item.Easy || 0,
          Medium:
            item.Medium || 0,
          Hard:
            item.Hard || 0,
          total,
        };
      });
    }, [
      analytics,
      activeRange.endDate,
      activeRange.startDate,
    ]);

  const totals =
    useMemo(() => {
      return chartData.reduce(
        (
          acc,
          item
        ) => {
          acc.easy +=
            item.Easy;

          acc.medium +=
            item.Medium;

          acc.hard +=
            item.Hard;

          acc.total +=
            item.total;

          return acc;
        },
        {
          easy: 0,
          medium: 0,
          hard: 0,
          total: 0,
        }
      );
    }, [chartData]);

  const xAxisTicks =
    useMemo(() => {
      const rangeDates =
        getRangeDates({
          startDate:
            activeRange.startDate,
          endDate:
            activeRange.endDate,
        });
      const tickEvery =
        isNarrowScreen
          ? 10
          : 7;
      const ticks =
        rangeDates
          .filter(
            (_, index) =>
              index % tickEvery === 0 ||
              index ===
                rangeDates.length - 1
          )
          .map((date) =>
            formatShortDate(date)
          );

      return ticks.filter(
        (
          tick,
          index,
          ticks
        ) =>
          ticks.indexOf(tick) ===
          index
      );
    }, [
      activeRange.endDate,
      activeRange.startDate,
      isNarrowScreen,
    ]);

  return (
    <div className="graph-card">
      <div className="graph-header">
        <div className="graph-title-block">
          <span className="graph-kicker">
            {selectedRangeLabel}
          </span>

          <div className="graph-total">
            {totals.total}
          </div>

          <span className="graph-caption">
            problems solved
          </span>
        </div>

        <div className="top-right-controls">
          <Dropdown
            value={
              String(year)
            }
            width={115}
            options={
              yearOptions
            }
            onChange={(
              value
            ) =>
              setYear(
                Number(value)
              )
            }
          />

          <Dropdown
            value={
              activeSelectedMonth
            }
            width={115}
            options={
              monthOptions
            }
            onChange={
              setSelectedMonth
            }
          />
        </div>
      </div>

      <div
        className="chart-shell"
        ref={chartShellRef}
      >
        {chartSize.width > 0 &&
        chartSize.height > 0 ? (
          <BarChart
            data={chartData}
            width={chartSize.width}
            height={chartSize.height}
            margin={{
              top: 14,
              right: 0,
              left: 0,
              bottom: 4,
            }}
            barCategoryGap={
              isNarrowScreen
                ? "30%"
                : "42%"
            }
          >
            <defs>
              <linearGradient
                id="graphEasyGradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="var(--graph-easy-start)"
                />

                <stop
                  offset="100%"
                  stopColor="var(--graph-easy-end)"
                />
              </linearGradient>

              <linearGradient
                id="graphMediumGradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="var(--graph-medium-start)"
                />

                <stop
                  offset="100%"
                  stopColor="var(--graph-medium-end)"
                />
              </linearGradient>

              <linearGradient
                id="graphHardGradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="var(--graph-hard-start)"
                />

                <stop
                  offset="100%"
                  stopColor="var(--graph-hard-end)"
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--graph-grid)"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              padding={{
                left: 22,
                right: 22,
              }}
              ticks={[
                ...xAxisTicks,
              ]}
              tick={{
                fill:
                  "var(--graph-axis)",
                fontSize:
                  isNarrowScreen
                    ? 11
                    : 12,
              }}
            />

            <YAxis
              orientation="right"
              width={0}
              mirror
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{
                fill:
                  "var(--graph-axis)",
                fontSize:
                  isNarrowScreen
                    ? 11
                    : 12,
                dx: -4,
              }}
            />

            <Tooltip
              cursor={{
                fill:
                  "var(--graph-cursor)",
              }}
              content={
                <CustomTooltip />
              }
            />

            <Bar
              dataKey="Easy"
              stackId="solved"
              fill="url(#graphEasyGradient)"
              stroke="none"
              strokeWidth={0}
              radius={[
                0,
                0,
                0,
                0,
              ]}
              barSize={
                isNarrowScreen
                  ? 6
                  : 8
              }
            >
              {chartData.map(
                (item) => (
                  <Cell
                    key={`easy-${item.date}`}
                    radius={getStackRadius(
                      item,
                      "Easy"
                    )}
                  />
                )
              )}
            </Bar>

            <Bar
              dataKey="Medium"
              stackId="solved"
              fill="url(#graphMediumGradient)"
              stroke="none"
              strokeWidth={0}
              barSize={
                isNarrowScreen
                  ? 6
                  : 8
              }
            >
              {chartData.map(
                (item) => (
                  <Cell
                    key={`medium-${item.date}`}
                    radius={getStackRadius(
                      item,
                      "Medium"
                    )}
                  />
                )
              )}
            </Bar>

            <Bar
              dataKey="Hard"
              stackId="solved"
              fill="url(#graphHardGradient)"
              stroke="none"
              strokeWidth={0}
              radius={roundedTopRadius}
              barSize={
                isNarrowScreen
                  ? 6
                  : 8
              }
            >
              {chartData.map(
                (item) => (
                  <Cell
                    key={`hard-${item.date}`}
                    radius={getStackRadius(
                      item,
                      "Hard"
                    )}
                  />
                )
              )}
            </Bar>
          </BarChart>
        ) : null}
      </div>

      <div className="graph-footer">
        <span className="easy-text">
          Easy {totals.easy}
        </span>

        <span className="medium-text">
          Med. {totals.medium}
        </span>

        <span className="hard-text">
          Hard {totals.hard}
        </span>
      </div>
    </div>
  );
};

export default Graph;
