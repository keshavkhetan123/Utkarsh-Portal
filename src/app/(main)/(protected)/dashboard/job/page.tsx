"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";

import { api } from "~/trpc/react";
import JobDetails from "./_components/JobDetails";

const LIMIT = 10;

export default function JobPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } =
    api.jobOpenings.getLatestJobOpenings.useQuery({
      limit: LIMIT,
      page,
    });

  const openings = data?.data ?? [];

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (data?.hasMore) setPage((prev) => prev + 1);
  };

  return (
    <Container className="flex flex-col gap-4 py-4">
      <Typography variant="h5" color="primary" className="px-4">
        Job Openings
      </Typography>
      <Divider />

      {isLoading ? (
        <Container className="h-96 w-full flex justify-center items-center">
          <CircularProgress />
        </Container>
      ) : (
        <>
          <Box className="flex flex-col gap-2">
            {openings && openings.map((jobs) => (
              <JobDetails key={jobs.id} {...jobs} />
            ))}
          </Box>

          {data.debarred ? (
            <Typography variant="body1" color="error" className="pt-4 text-center">
              YOU ARE DEBARRED FROM THIS SEASON
            </Typography>
          ) : (
            // Pagination Controls
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={page === 1 || isFetching}
              >
                Previous
              </Button>
              <Typography variant="body2" className="text-center px-4">
                Page {page}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={!data?.hasMore || isFetching}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
