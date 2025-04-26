"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Button,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import FullPageLoader from "~/app/common/components/FullPageLoader";
import { api } from "~/trpc/react";

import JobAnalyticsRow from "./_components/JobAnalyticsRow";

export default function AdminHomePage() {
  const { data: jobTypes = [], isLoading } = api.analytics.getJobTypes.useQuery();

  const [filterType, setFilterType] = useState("program"); // default filter

  const handleFilterTypeChange = (e: any) => {
    setFilterType(e.target.value);
  };

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <Container className="py-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center gap-2 px-4">
        <Typography variant="h5" color="primary">
          Admin
        </Typography>
        <Link href="/admin/selects">
          <Button
            variant="outlined"
            startIcon={<HowToRegIcon />}
            endIcon={<ArrowForwardIosIcon className="text-sm" />}
          >
            Selects
          </Button>
        </Link>
      </div>

      {/* Filter Type Selection */}
      <div className="flex gap-4 px-4">
        <FormControl size="small" className="min-w-[160px]">
          <InputLabel>Filter By</InputLabel>
          <Select value={filterType} label="Filter By" onChange={handleFilterTypeChange}>
            <MenuItem value="program">Branch</MenuItem>
            <MenuItem value="gender">Gender</MenuItem>
            <MenuItem value="Religion">Religion</MenuItem>
            <MenuItem value="Caste">Caste</MenuItem>
          </Select>
        </FormControl>
      </div>

      <Divider />

      {/* Job Analytics Rows */}
      {jobTypes.map((jobType) => (
        <JobAnalyticsRow
          key={jobType.id}
          jobType={jobType}
          filterType={filterType}
        />
      ))}
    </Container>
  );
}
