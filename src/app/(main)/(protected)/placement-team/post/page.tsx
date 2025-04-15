"use client";

import Link from "next/link";
import PostAddIcon from "@mui/icons-material/PostAdd";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { api } from "~/trpc/react";
import PlacementTypeSelector from "../_components/PlacementTypeSelector";
import PostRow from "./_components/PostRow";

const PAGE_SIZE = 10;

function Page() {
  const [jobType, setJobType] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: session } = useSession();

  const postsQuery = api.post.getLatestPostAdmin.useQuery(
    {
      jobType,
      passOutYear: year,
      page,
      pageSize: PAGE_SIZE,
    },
    {
      enabled: !!year,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (session?.user?.year) {
      setYear(session.user.year);
    }
  }, [session?.user?.year]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [jobType, year]);

  const posts = postsQuery.data?.data ?? [];
  const hasMore = postsQuery.data?.hasMore ?? false;

  return (
    <Container className="flex flex-col gap-4 py-4">
      <div className="flex flex-row justify-between flex-wrap gap-4 items-center">
        <Typography variant="h5" color="primary" className="px-4">
          All Posts
        </Typography>
        <div className="flex flex-row items-center gap-4">
          <PlacementTypeSelector
            selectedPlacementTypes={jobType}
            setSelectedPlacementTypes={setJobType}
          />
          <Select
            size="small"
            value={year ?? ""}
            displayEmpty
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 100 }}
          >
            <MenuItem disabled value="">
              Select Year
            </MenuItem>
            {[2026, 2027, 2028, 2029, 2030].map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>

          <Link href="./post/new">
            <IconButton>
              <PostAddIcon />
            </IconButton>
          </Link>
        </div>
      </div>

      <Divider />

      {postsQuery.isLoading ? (
        <Container className="h-96 w-full flex justify-center items-center">
          <CircularProgress />
        </Container>
      ) : (
        <>
          <Box className="flex flex-col gap-2">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                id={post.id}
                title={post.title}
                createdAt={post.createdAt}
              />
            ))}
          </Box>

          {/* Pagination Controls */}
          {posts.length > 0 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outlined"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || postsQuery.isFetching}
              >
                Previous
              </Button>
              <Typography variant="body2">Page {page}</Typography>
              <Button
                variant="outlined"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || postsQuery.isFetching}
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

export default Page;
