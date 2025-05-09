"use client";

import {
  CircularProgress,
  Paper,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import {
  PieChart,
  useDrawingArea,
  blueberryTwilightPalette,
} from "@mui/x-charts";
import { api } from "~/trpc/react";

interface JobAnalyticsRowProps {
  // jobType: {
  //   id: string;
  //   name: string;
  //   description: string;
  // };
  filterType: string; // Like "Religion", "Caste", etc.
}

const StyledText = styled("text")(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 20,
}));


function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2} fontWeight={700}>
      {children}
    </StyledText>
  );
}

export default function JobAnalyticsRow({ jobType, filterType }: JobAnalyticsRowProps) {
  const { data, isLoading } = api.analytics.getJobTypeSelectionAnalytics.useQuery({
    filterType, // Passing filterType like "Religion", "Caste"
  });
  const { data: jobTypes = [] } = api.analytics.getJobTypes.useQuery();

  console.log("data yaha h", jobTypes);
  const theme = useTheme();

  if (isLoading) {
    return (
      <Paper elevation={1} className="p-4 pb-5 flex flex-col gap-4">
        <Typography variant="h6">Job Type Analytics</Typography>
        <div className="flex items-center justify-center py-20">
          <CircularProgress />
        </div>
      </Paper>
    );
  }

  // Group data by filterType (Religion, Caste, etc.)
  // const groupedData: Record<string, Record<string, { selected: number; all: number }>> = {};

  // (data ?? []).forEach((item) => {
  //   // Calculate the total number of selected students across all job types
  //   const totalSelected = item.jobTypes.reduce((acc, job) => acc + job.selected, 0);
  
  //   // Calculate the total number of students (all students) for the group
  //   const totalAll = item.jobTypes.reduce((acc, job) => acc + job.all, 0);
  
  //   // Calculate unplaced students as the difference between totalAll and totalSelected
  //   const unplaced = totalAll - totalSelected;
  
  //   // Add the "unplaced" job type if unplaced students are more than 0
  //   if (unplaced > 0) {
  //     item.jobTypes.push({
  //       jobType: "Unplaced", // Job type name
  //       selected: 0, // No selected students for "Unplaced"
  //       all: unplaced, // The number of unplaced students
  //     });
  //   }
  // });

  console.log("dataaaaaaa", data);

  return (
    <Paper elevation={1} className="p-4 pb-5 flex flex-col gap-4">
      <div>
        <Typography variant="h6">Job Analytics by {filterType}</Typography>
      </div>

      {/* Loop over filter categories (e.g., Religion values like Hindu, Christian) */}
      {Object.entries(data).map(([group, jobTypeData]) => {
  // Mapping jobTypeData for each group
  console.log(jobTypeData.filterCount.get(filterType));
  const pieData = jobTypeData.jobTypes.map((job) => ({
    id: job.jobType,  // jobType ID as the id
    value: job.all,  // selected count as value
    label: `${
      job.jobType === "Unplaced"
        ? "Unplaced"
        : jobTypes[job.jobType - 1]?.name
    } ${`${job.all} / ${jobTypeData.filterCount.get(jobTypeData.group.filterType)}`}`,  // Label format
  }));

  const totalSelected = jobTypeData.jobTypes
    .filter((job) => job.jobType !== "Unplaced") // Filter out "Unplaced"
    .reduce((acc, curr) => acc + curr.all, 0);
  const totalAll = jobTypeData.jobTypes.reduce((acc, curr) => acc + curr.all, 0);
console.log("group", group);
console.log("jobTypeData", jobTypeData);
  return (
    <div key={group}>
      <Typography variant="h6" color="primary" className="mt-4">
        {filterType}: {jobTypeData.group.filterType} {/* Group will be the program type like ECE, IT-BI */}
      </Typography>

      {pieData.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Typography variant="body1" color="textSecondary">
            No data available for {group}
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <PieChart
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            width={300}
            height={300}
            series={[{ data: pieData, innerRadius: 70, outerRadius: 100, paddingAngle: 2 }]}
            colors={blueberryTwilightPalette(theme.palette.mode)}
            slotProps={{
              pieArc: { cornerRadius: 5 },
              legend: { hidden: true },
            }}
          >
            <PieCenterLabel>{`${totalSelected}/${totalAll}`}</PieCenterLabel>
          </PieChart>

          {/* Legends */}
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {pieData.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      blueberryTwilightPalette(theme.palette.mode)[
                        i % blueberryTwilightPalette(theme.palette.mode).length
                      ],
                  }}
                />
                <Typography variant="body2">{d.label}</Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
})}

    </Paper>
  );
}
