"use client";

import Link from "next/link";
import PostAddIcon from "@mui/icons-material/PostAdd";
import {
  Box,
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

function Page() {
  const [jobType, setJobType] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  const { data: session } = useSession();

  // const { data: availableYears, isLoading: yearsLoading } =
  //   api.placementConfig.getStudentPlacementYears.useQuery();

  const availableYears = [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035];
  console.log(availableYears);
  const postsQuery = api.post.getLatestPostAdmin.useQuery(
    {
      jobType: jobType ?? null,
      admissionYear: year,
    },
    {
      enabled: false,
    }
  );

  // Set default year from session when available
  useEffect(() => {
    if (session?.user?.year) {
      setYear(session.user.year);
    }
  }, [session?.user?.year]);

  // Refetch posts on year/jobType change
  useEffect(() => {
    if (!year) return;

    setLoading(true);
    postsQuery
      .refetch()
      .then((res) => {
        if (res.data) setAllPosts(res.data);
      })
      .finally(() => setLoading(false));
  }, [year, jobType]);

  return (
    <Container className="flex flex-col gap-4 py-4">
      <div className="flex flex-row justify-between flex-wrap gap-4 items-center">
        <Typography variant="h5" color="primary" className="px-4">
          All Posts
        </Typography>
        <div className="flex flex-row items-center gap-4">
          {/* Placement Type Filter */}
          <PlacementTypeSelector
            selectedPlacementTypes={jobType}
            setSelectedPlacementTypes={setJobType}
          />

          {/* Year Filter */}
          <Select
            size="small"
            value={year ?? ""}
            displayEmpty
            onChange={(e) => setYear(Number(e.target.value))}
            // disabled={yearsLoading}
            sx={{ minWidth: 100 }}
          >
            <MenuItem disabled value="">
              Select Year
            </MenuItem>
            {availableYears?.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>

          {/* Add Post Button */}
          <Link href="./post/new">
            <IconButton>
              <PostAddIcon />
            </IconButton>
          </Link>
        </div>
      </div>

      <Divider />

      {loading ? (
        <Container className="h-96 w-full flex justify-center items-center">
          <CircularProgress />
        </Container>
      ) : (
        <Box className="flex flex-col gap-2">
          {allPosts.map((post) => (
            <PostRow
              key={post.id}
              id={post.id}
              title={post.title}
              createdAt={post.createdAt}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Page;
