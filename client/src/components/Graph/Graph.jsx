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

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload
  )
    return null;

  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">
        {label}
      </div>

      <div className="tooltip-row easy-text">
        <span>
          Easy
        </span>

        <strong>
          {
            payload[0]
              ?.value
          }
        </strong>
      </div>

      <div className="tooltip-row medium-text">
        <span>
          Medium
        </span>

        <strong>
          {
            payload[1]
              ?.value
          }
        </strong>
      </div>

      <div className="tooltip-row hard-text">
        <span>
          Hard
        </span>

        <strong>
          {
            payload[2]
              ?.value
          }
        </strong>
      </div>
    </div>
  );
};

const Graph = () => {
  const {
    analytics,
    fetchAnalytics,
  } = useProgress();

  const [mode, setMode] =
    useState("Solved");

  const [range, setRange] =
    useState("Monthly");
    
  const [year, setYear] =
    useState(
      new Date().getFullYear()
    );

  const [month, setMonth] =
    useState(
      new Date().getMonth() + 1
    );

  useEffect(() => {
    const typeMap = {
      Daily: "day",
      Weekly: "week",
      Monthly: "month",
    };

    fetchAnalytics(
      typeMap[range],
      year,
      month
    );
  }, [
    range,
    year,
    month,
  ]);

  const totals =
    useMemo(() => {
      return analytics.reduce(
        (
          acc,
          item
        ) => {
          acc.easy +=
            item.Easy || 0;

          acc.medium +=
            item.Medium || 0;

          acc.hard +=
            item.Hard || 0;

          return acc;
        },
        {
          easy: 0,
          medium: 0,
          hard: 0,
        }
      );
    }, [analytics]);

  const monthLabel = `${year}-${month}`;

  return (
    <div className="graph-card">

      <div className="graph-header">

        <div className="segment-pill">
          <button
            className={
              mode === "Solved"
                ? "segment-active"
                : ""
            }
            onClick={() =>
              setMode("Solved")
            }
          >
            Solved
          </button>
        </div>

        <div className="top-right-controls">
          <Dropdown
            value={
              range ===
              "Daily"
                ? "D"
                : range ===
                  "Weekly"
                ? "W"
                : "M"
            }
            width={150}
            options={[
              "D",
              "W",
              "M",
            ]}
            onChange={
              setRange
            }
          />

          <Dropdown
            value={`${year}-${month}`}
            width={170}
            options={[
              "2026-1",
              "2026-2",
              "2026-3",
              "2026-4",
              "2026-5",
              "2026-6",
            ]}
            onChange={(
              val
            ) => {
              const [
                y,
                m,
              ] =
                val.split(
                  "-"
                );

              setYear(
                Number(y)
              );

              setMonth(
                Number(m)
              );
            }}
          />
        </div>
      </div>

      <div className="chart-shell">

        <ResponsiveContainer
          width="100%"
          height={205}
        >
          <BarChart
            data={
              analytics
            }
            margin={{
              top: 12,
              right: 10,
              left: -20,
              bottom: 0,
            }}
            barGap={0}
            barCategoryGap="58%"
          >
            <CartesianGrid
              vertical={
                false
              }
              stroke="rgba(255,255,255,.06)"
            />

            <XAxis
              dataKey="date"
              axisLine={
                false
              }
              tickLine={
                false
              }
              tick={{
                fill:
                  "#7a7a7a",
                fontSize: 13,
              }}
            />

            <YAxis
              orientation="right"
              axisLine={
                false
              }
              tickLine={
                false
              }
              tick={{
                fill:
                  "#7a7a7a",
                fontSize: 13,
              }}
            />

            <Tooltip
              cursor={{
                fill:
                  "rgba(255,255,255,.03)",
              }}
              content={
                <CustomTooltip />
              }
            />

            <Bar
              dataKey="Easy"
              fill="#22d3ee"
              radius={[
                12,
                12,
                0,
                0,
              ]}
              barSize={4}
            />

            <Bar
              dataKey="Medium"
              fill="#facc15"
              radius={[
                12,
                12,
                0,
                0,
              ]}
              barSize={4}
            />

            <Bar
              dataKey="Hard"
              fill="#ff3d3d"
              radius={[
                12,
                12,
                0,
                0,
              ]}
              barSize={4}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="graph-footer">
        <span className="easy-text">
          Easy{" "}
          {
            totals.easy
          }
        </span>

        <span className="medium-text">
          Med.{" "}
          {
            totals.medium
          }
        </span>

        <span className="hard-text">
          Hard{" "}
          {
            totals.hard
          }
        </span>
      </div>
    </div>
  );
};

export default Graph;