import ProgressLog from "../models/ProgressLog.js";

/*
==================================
GET ANALYTICS
GET /api/analytics
==================================

Query params:

type=week | month | year
year=2026
month=5
week=22
startDate=2026-05-26
endDate=2026-06-27
*/

export const getAnalytics =
  async (req, res) => {
    try {
      const {
        type = "month",
        year,
        month,
        week,
        startDate: rangeStart,
        endDate: rangeEnd,
      } = req.query;

      const selectedYear =
        Number(year) ||
        new Date().getFullYear();

      const selectedMonth =
        Number(month) ||
        new Date().getMonth() + 1;

      const selectedWeek =
        Number(week);

      let startDate;
      let endDate;

      /*
      ==========================
      RANGE MODE
      ==========================
      */

      if (
        type === "range" &&
        rangeStart &&
        rangeEnd
      ) {
        startDate =
          new Date(rangeStart);

        endDate =
          new Date(rangeEnd);
      }

      /*
      ==========================
      YEAR MODE
      ==========================
      */

      else if (type === "year") {
        startDate =
          new Date(
            selectedYear,
            0,
            1
          );

        endDate =
          new Date(
            selectedYear + 1,
            0,
            1
          );
      }

      /*
      ==========================
      MONTH MODE
      ==========================
      */

      else if (
        type === "month" ||
        !selectedWeek
      ) {
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
        const firstDayOfYear =
          new Date(
            selectedYear,
            0,
            1
          );

        startDate =
          new Date(
            selectedYear,
            0,
            1 +
              (selectedWeek -
                1) *
                7
          );

        startDate.setDate(
          startDate.getDate() -
            firstDayOfYear.getDay()
        );

        endDate =
          new Date(startDate);

        endDate.setDate(
          startDate.getDate() +
            7
        );
      }

      const analytics =
        await ProgressLog.aggregate([
          {
            $match: {
              userId: req.user._id,
              completedAt: {
                $gte:
                  startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format:
                    "%Y-%m-%d",
                  date:
                    "$completedAt",
                },
              },
              Easy: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$difficulty",
                        "Easy",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              Medium: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$difficulty",
                        "Medium",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              Hard: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$difficulty",
                        "Hard",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              total: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              Easy: 1,
              Medium: 1,
              Hard: 1,
              total: 1,
            },
          },
          {
            $sort: {
              date: 1,
            },
          },
        ]);

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
      const result =
        await ProgressLog.aggregate([
          {
            $match: {
              userId: req.user._id,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format:
                    "%Y-%m-%d",
                  date:
                    "$completedAt",
                },
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              count: 1,
            },
          },
          {
            $sort: {
              date: 1,
            },
          },
        ]);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };
