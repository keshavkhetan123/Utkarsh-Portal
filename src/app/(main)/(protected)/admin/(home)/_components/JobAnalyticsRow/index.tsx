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
  jobType: {
    id: string;
    name: string;
    description: string;
  };
  filterType: string;
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
    jobTypeId: jobType.id,
    filterType,
  });
console.log("data yaha h");
console.log(data);
  const theme = useTheme();

  if (isLoading) {
    return (
      <Paper elevation={1} className="p-4 pb-5 flex flex-col gap-4">
        <Typography variant="h6">{jobType.name}</Typography>
        <div className="flex items-center justify-center py-20">
          <CircularProgress />
        </div>
      </Paper>
    );
  }

  const groupedData: Record<string, { selected: number; all: number }> = {};

  (data ?? []).forEach((item) => {
    console.log("item")
    console.log(item);
    let key = "";
    if (filterType === "program") key = item.group.program ?? "Unknown";
    if (filterType === "Caste") key = item.group.Caste ?? "Unknown";
    if (filterType === "Religion") key = item.group.Religion ?? "Unknown";
    if (filterType === "gender") key = item.group.gender ?? "Unknown";

    if (!groupedData[key]) {
      groupedData[key] = { selected: 0, all: 0 };
    }
    groupedData[key].selected += item.selected;
    groupedData[key].all += item.all;
  });

  const pieData = Object.entries(groupedData).map(([label, stats]) => ({
    id: label,
    value: stats.selected === 0 ? `(${stats.all-stats.selected}/${stats.all})` : stats.selected, // so that 0s are still slightly visible
    label: `${label} (${stats.selected}/${stats.all})`,
  }));

  const totalSelected = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const totalAll = Object.values(groupedData).reduce((acc, curr) => acc + curr.all, 0);

  return (
    <Paper elevation={1} className="p-4 pb-5 flex flex-col gap-4">
      <div>
        <Typography variant="h6">{jobType.name}</Typography>
        <Typography variant="body1" color="GrayText">
          {jobType.description}
        </Typography>
      </div>

      {pieData.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Typography variant="body1" color="textSecondary">
            No data available
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <PieChart
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            width={300}
            height={300}
            series={[
              {
                data: pieData,
                innerRadius: 70,
              },
            ]}
            colors={blueberryTwilightPalette(theme.palette.mode)}
            slotProps={{
              pieArc: { cornerRadius: 5 },
              legend: { hidden: true },
            }}
          >
            <PieCenterLabel>
              {`${totalSelected}/${totalAll}`}
            </PieCenterLabel>
          </PieChart>

          {/* Legends */}
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {pieData.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: blueberryTwilightPalette(theme.palette.mode)[
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
    </Paper>
  );
}
