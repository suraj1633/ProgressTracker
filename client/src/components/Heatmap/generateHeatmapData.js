export const generateYearGrid = (
  heatmapData
) => {
  const today = new Date();

  const startDate = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );

  const dataMap = {};

  heatmapData.forEach((item) => {
    dataMap[item.date] =
      item.count;
  });

  const weeks = [];
  let currentWeek = [];

  const current = new Date(
    startDate
  );

  while (current <= today) {
    const formatted =
      current
        .toISOString()
        .split("T")[0];

    currentWeek.push({
      date: formatted,
      count:
        dataMap[
          formatted
        ] || 0,
      month:
        current.toLocaleString(
          "default",
          {
            month:
              "short",
          }
        ),
    });

    if (
      current.getDay() ===
      6
    ) {
      weeks.push(
        currentWeek
      );

      currentWeek = [];
    }

    current.setDate(
      current.getDate() +
        1
    );
  }

  if (
    currentWeek.length
  ) {
    weeks.push(
      currentWeek
    );
  }

  return weeks;
};