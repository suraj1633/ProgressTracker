import ProgressLog from "../models/ProgressLog.js";

/*
==================================
GET ANALYTICS
GET /api/analytics
==================================

Query params:

type=week | month
year=2026
month=5
*/

export const getAnalytics =
  async (req, res) => {
    try {
      const {
        type = "month",
        year,
        month,
      } = req.query;

      const selectedYear =
        Number(year) ||
        new Date().getFullYear();

      const selectedMonth =
        Number(month) ||
        new Date().getMonth() + 1;

      let startDate;
      let endDate;

      /*
      ==========================
      MONTH MODE
      ==========================
      */

      if (type === "month") {
        startDate =
          new Date(
            selectedYear,
            selectedMonth - 1,
            1
          );

        endDate =
          new Date(
            selectedYear,
            selectedMonth,
            1
          );
      }

      /*
      ==========================
      WEEK MODE
      ==========================
      */

      else {
        const today =
          new Date();

        const firstDay =
          new Date(today);

        firstDay.setDate(
          today.getDate() -
            6
        );

        startDate =
          firstDay;

        endDate = today;
      }

      const logs =
        await ProgressLog.find({
          completedAt: {
            $gte:
              startDate,
            $lt: endDate,
          },
        });

      const groupedData =
        {};

      logs.forEach((log) => {
        const dateKey =
          new Date(
            log.completedAt
          )
            .toISOString()
            .split("T")[0];

        if (
          !groupedData[
            dateKey
          ]
        ) {
          groupedData[
            dateKey
          ] = {
            date: dateKey,
            Easy: 0,
            Medium: 0,
            Hard: 0,
            total: 0,
          };
        }

        groupedData[
          dateKey
        ][
          log.difficulty
        ] += 1;

        groupedData[
          dateKey
        ].total += 1;
      });

      const analytics =
        Object.values(
          groupedData
        );

      res.status(200).json(
        analytics
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

  /*
==================================
YEARLY HEATMAP
GET /api/analytics/heatmap
==================================
*/

export const getHeatmapData =
  async (req, res) => {
    try {
      const logs =
        await ProgressLog.find();

      const heatmapMap = {};

      logs.forEach((log) => {
        const date =
          log.completedAt
            .toISOString()
            .split("T")[0];

        heatmapMap[date] =
          (heatmapMap[
            date
          ] || 0) + 1;
      });

      const result =
        Object.entries(
          heatmapMap
        ).map(
          ([
            date,
            count,
          ]) => ({
            date,
            count,
          })
        );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };