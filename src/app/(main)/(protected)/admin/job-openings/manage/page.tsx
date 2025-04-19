"use client";

import Link from "next/link";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import HomeIcon from "@mui/icons-material/Home";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";

import { api } from "~/trpc/react";

import Token from "../_components/tokenManage";

export default function managePage() {
  const { data: openings, isLoading } =
    api.hrToken.adminGetHrToken.useQuery();

  return (
    <Container className="flex flex-col gap-4 py-4">
      <div className="flex flex-row justify-between items-center">
        <Link
        href={"/admin/job-openings"}
        > 
        <Button
          variant="outlined"
          color="primary"
          className="inline-flex p-2 min-w-0"
        >
          <HomeIcon />
        </Button>
        </Link>
      </div>
      <Divider />

      {isLoading && (
        <Container className="h-96 w-full flex justify-center items-center">
          <CircularProgress />
        </Container>
      )}
      {
        <Box className="flex flex-col gap-2">
          {openings &&
            openings.data.map((token) => (
                <Token {...token} />
            ))}
        </Box>
      }
    </Container>
  );
}
