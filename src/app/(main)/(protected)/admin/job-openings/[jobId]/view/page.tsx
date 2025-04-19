"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import dayjs from "dayjs";

import { Button, Autocomplete, Avatar, Container, Divider, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Paper, Select, TextField, Typography, Checkbox, CircularProgress } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useQuery } from "@tanstack/react-query";

import FullPageLoader from "~/app/common/components/FullPageLoader";
import TextEditor from "~/app/common/components/TextEditor";
import { api } from "~/trpc/react";


import JobOpeningGroupSelector from "../../_components/ParticipatingGroupsSelector";

import { DEFAULT_JOB_OPENING } from "../edit/constants";

export default function ViewJobOpening() {
  const { jobId }: { jobId: string } = useParams();
  const router = useRouter();

  const { data: originalJobOpening, isLoading } =
    api.jobOpenings.adminGetJobOpening.useQuery(jobId);

  const [jobOpening, setJobOpening] = useState(DEFAULT_JOB_OPENING);

  useEffect(() => {
    if (originalJobOpening) {
      setJobOpening({
        ...originalJobOpening,
        company: {
          ...originalJobOpening.company,
          domain: originalJobOpening.company.website,
        },
        registrationStart: dayjs(originalJobOpening.registrationStart),
        registrationEnd: dayjs(originalJobOpening.registrationEnd),
        allowedJobTypes: JSON.parse(
          originalJobOpening.allowedJobTypes as string
        ) as string[],
        jobType: originalJobOpening.placementType.id,
        participatingGroups: originalJobOpening.JobOpeningParticipantGroups,
      });
    }
  }, [originalJobOpening]);
  

  if (isLoading) return <FullPageLoader />;

  return (
    <Container className="flex flex-col gap-4 py-4">
      <Typography variant="h5" color="primary" className="px-4">
        View Job Opening
      </Typography>
      <Divider />

      {/* Title */}
      <TextField
        label="Title"
        value={jobOpening.title}
        InputProps={{ readOnly: true }}
        variant="standard"
      />

      {/* Company */}
      <Autocomplete
        value={jobOpening.company}
        options={[]}
        getOptionLabel={(o) => o.name}
        disabled
        renderInput={(params) => (
          <TextField {...params} label="Company" variant="standard" />
        )}
      />

      {/* Job Type */}
      <FormControl variant="standard" fullWidth>
        <InputLabel>Job Type</InputLabel>
        <Select value={jobOpening.jobType} disabled>
          {/* you could map jobTypes here if you fetched them */}
          <MenuItem value={jobOpening.jobType}>
            {originalJobOpening.placementType.name}
          </MenuItem>
        </Select>
      </FormControl>

      {/* Location, Role, Pay */}
      <TextField
        label="Location"
        value={jobOpening.location}
        InputProps={{ readOnly: true }}
        variant="standard"
      />
      <TextField
        label="Role"
        value={jobOpening.role}
        InputProps={{ readOnly: true }}
        variant="standard"
      />
      <TextField
        label="Pay"
        value={jobOpening.pay}
        InputProps={{ readOnly: true }}
        variant="standard"
      />
      <TextField
        label="Pay (Numeric)"
        value={jobOpening.payNumeric}
        InputProps={{ readOnly: true }}
        variant="standard"
      />

      {/* Dates */}
      <DateTimePicker
        label="Registration Start"
        value={jobOpening.registrationStart}
        disabled
      />
      <DateTimePicker
        label="Registration End"
        value={jobOpening.registrationEnd}
        disabled
      />

      {/* Participating Groups (view‑only) */}
      <JobOpeningGroupSelector
        jobTypeId={jobOpening.jobType}
        value={jobOpening.participatingGroups}
        onChange={() => {}}
        disabled
      />

      {/* Description */}
      <Typography variant="body1" color="text.disabled">
        Detailed Job Description
      </Typography>
      <TextEditor value={jobOpening.description} height="40vh" />

      {/* Additional Fields */}
      {/* <AdditionalFieldSelector
        value={jobOpening.extraApplicationFields}
        onChange={() => {}}
        disabled
      /> */}

      {/* Flags */}
      <FormControlLabel
        control={<Checkbox checked={jobOpening.hidden} disabled />}
        label="Hidden"
      />
      <FormControlLabel
        control={<Checkbox checked={jobOpening.autoApprove} disabled />}
        label="Auto Approve"
      />
      <FormControlLabel
        control={<Checkbox checked={jobOpening.autoVisible} disabled />}
        label="Auto Visible"
      />
      <FormControlLabel
        control={<Checkbox checked={jobOpening.allowSelected} disabled />}
        label="Allow Already Selected Students"
      />

      <Divider className="mt-4" />

      {/* Edit button */}
      <Button
        variant="contained"
        onClick={() => router.push(`/admin/job-openings/${jobId}/edit`)}
      >
        Edit
      </Button>
    </Container>
  );
}
