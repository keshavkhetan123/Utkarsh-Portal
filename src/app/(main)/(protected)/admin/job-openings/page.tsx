"use client";

import Link from "next/link";
import { useState } from "react";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";

import { api } from "~/trpc/react";
import JobRow from "./_components/jobRow/JobRow";

export const LIMIT = 2;

export default function JobOpeningsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } =
    api.jobOpenings.adminGetJobOpenings.useQuery({
      limit: LIMIT,
      page,
    });

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (data?.hasMore) setPage((prev) => prev + 1);
  };

  const openings = data?.data ?? [];

  return (
    <Container className="flex flex-col gap-4 py-4">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="h5" color="primary" className="px-4">
          Job Openings
        </Typography>
        <div className="flex gap-2">
          <Link href="./job-openings/manage">
            <Button
              variant="outlined"
              color="primary"
              className="inline-flex p-2 min-w-0"
            >
              Manage HR Tokens
            </Button>
          </Link>
          <Link href="./job-openings/new">
            <Button
              variant="outlined"
              color="primary"
              className="inline-flex p-2 min-w-0"
            >
              <AddCircleIcon />
            </Button>
          </Link>
        </div>
      </div>
      <Divider />

      {isLoading ? (
        <Container className="h-96 w-full flex justify-center items-center">
          <CircularProgress />
        </Container>
      ) : (
        <>
          <Box className="flex flex-col gap-2">
            {openings.map((jobs) => (
              <Link key={jobs.id} href={"./job-openings/" + jobs.id}>
                <JobRow {...jobs} />
              </Link>
            ))}
          </Box>

          {/* Pagination Controls */}
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
        </>
      )}
    </Container>
  );
}
