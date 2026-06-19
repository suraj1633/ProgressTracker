import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  useProgress,
} from "../../context/ProgressContext";

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

const parseDateKey = (
  value
) =>
  new Date(
    `${value}T00:00:00`
  );

const formatShortDate = (
  date
) =>
  `${MONTH_NAMES[
    date.getMonth()
  ]} ${date.getDate()}`;

const getRangeDates = ({
  year,
  month,
}) => {
  const daysInMonth =
    new Date(
      year,
      month,
      0
    ).getDate();

  return Array.from(
    {
      length: daysInMonth,
    },
    (_, index) =>
      new Date(
        year,
        month - 1,
        index + 1
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
    heatmapData,
  } = useProgress();

  const today =
    useMemo(
      () => new Date(),
      []
    );

  const [year, setYear] =
    useState(
      today.getFullYear()
    );

  const [month, setMonth] =
    useState(
      today.getMonth() + 1
    );

  const yearOptions =
    useMemo(() => {
      const dataYears =
        heatmapData
          .map((item) =>
            parseDateKey(
              item.date
            ).getFullYear()
          )
          .filter(Boolean);

      const minYear =
        Math.min(
          today.getFullYear(),
          ...dataYears
        );

      const maxYear =
        Math.max(
          today.getFullYear(),
          ...dataYears
        );

      return Array.from(
        {
          length:
            maxYear -
            minYear +
            1,
        },
        (_, index) =>
          String(
            maxYear -
              index
          )
      );
    }, [
      heatmapData,
      today,
    ]);

  const monthOptions =
    useMemo(
      () =>
        MONTH_NAMES,
      []
    );

  const selectedMonthLabel =
    MONTH_NAMES[
      month - 1
    ];

  useEffect(() => {
    fetchAnalytics(
      "month",
      year,
      month
    );
    // Keep analytics requests tied to selected controls only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    month,
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
        year,
        month,
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
            String(
              date.getDate()
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
      month,
      year,
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

  return (
    <div className="graph-card">
      <div className="graph-header">
        <div className="graph-title-block">
          <span className="graph-kicker">
            Solved
          </span>

          <div className="graph-total">
            {totals.total}
          </div>
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
              selectedMonthLabel
            }
            width={110}
            options={
              monthOptions
            }
            onChange={(
              value
            ) => {
              const nextMonth =
                MONTH_NAMES.indexOf(
                  value
                ) + 1;

              setMonth(
                nextMonth
              );
            }}
          />
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer
          width="100%"
          height={220}
        >
          <BarChart
            data={chartData}
            margin={{
              top: 14,
              right: 0,
              left: -18,
              bottom: 0,
            }}
            barCategoryGap={
              "48%"
            }
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,.06)"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              padding={{
                left: 8,
                right: 8,
              }}
              ticks={[
                "1",
                "2",
                "5",
                "9",
                "13",
                "17",
                "21",
                "25",
                "29",
              ]}
              tick={{
                fill:
                  "#8a8a8a",
                fontSize: 12,
              }}
            />

            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{
                fill:
                  "#8a8a8a",
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{
                fill:
                  "rgba(255,255,255,.04)",
              }}
              content={
                <CustomTooltip />
              }
            />

            <Bar
              dataKey="Easy"
              stackId="solved"
              fill="#00b8a3"
              radius={[
                0,
                0,
                5,
                5,
              ]}
              barSize={
                8
              }
            />

            <Bar
              dataKey="Medium"
              stackId="solved"
              fill="#ffc01e"
              barSize={
                8
              }
            />

            <Bar
              dataKey="Hard"
              stackId="solved"
              fill="#ff375f"
              radius={[
                5,
                5,
                0,
                0,
              ]}
              barSize={
                8
              }
            />
          </BarChart>
        </ResponsiveContainer>
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
