import Question from "../models/Question.js";

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

      const questions =
        await Question.find({
          userId: req.user._id,
          completed: true,
          completedAt: {
            $gte:
              startDate,
            $lt: endDate,
          },
        });

      const groupedData =
        {};

      questions.forEach((question) => {
        const dateKey =
          new Date(
            question.completedAt
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
          question.difficulty
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
      const questions =
        await Question.find({
          userId: req.user._id,
          completed: true,
          completedAt: {
            $ne: null,
          },
        });

      const heatmapMap = {};

      questions.forEach((question) => {
        const date =
          question.completedAt
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
