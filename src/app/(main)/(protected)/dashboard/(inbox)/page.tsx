"use client";

import { useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";

import { api } from "~/trpc/react";
import PostRow from "./_components/PostRow";

const PAGE_SIZE = 10;

function Page() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } =
    api.post.getLatestPost.useQuery({
      page,
      pageSize: PAGE_SIZE,
    });

  const posts = data?.data ?? [];
  const hasMore = data?.hasMore ?? false;

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  return (
    <Container className="flex flex-col gap-4 py-4">
      <Typography variant="h5" color="primary" className="px-4">
        Inbox
      </Typography>
      <Divider />

      {isLoading ? (
        <Container className="h-96 w-full flex justify-center items-center">
          <CircularProgress />
        </Container>
      ) : (
        <>
          <Box className="flex flex-col gap-2">
            {posts.length ? (
              posts.map((post) => (
                <PostRow
                  id={post.id}
                  key={post.id}
                  title={post.title}
                  createdAt={post.createdAt}
                />
              ))
            ) : (
              <div className="flex flex-col justify-center items-center gap-2">
                <MailOutlineIcon sx={{ fontSize: 100 }} />
                <Typography variant="h6" color="primary">
                  No posts yet!
                </Typography>
              </div>
            )}
          </Box>

          {/* Pagination Controls */}
          {posts.length > 0 && (
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
                disabled={!hasMore || isFetching}
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
