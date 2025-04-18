"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Autocomplete,
  Avatar,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useQuery } from "@tanstack/react-query";

import TextEditor from "~/app/common/components/TextEditor";
import { api } from "~/trpc/react";

import AdditionalFieldSelector from "~/app/hr/_components/AdditionalFieldsSelector"
import JobOpeningGroupSelector from "~/app/hr/_components/ParticipatingGroupsSelector";

import { DEFAULT_JOB_OPENING } from "./constants";
import { db } from "~/server/db";

export default function NewJobOpening() {

  // Other state hooks
  const [companyQuery, setCompanyQuery] = useState("");
  const [jobOpening, setJobOpening] = useState(DEFAULT_JOB_OPENING);
  const [manualCompany, setManualCompany] = useState(false);
  const descEditorRef = useRef<any>();
  const router = useRouter();


  // Always call hooks at the top
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = api.hrToken.verifyHRToken.useQuery({ token });

  const decodedToken = decodeURIComponent(token)
    .replace(/ /g, "+")
    .replace(/-/g, "+")
    .replace(/_/g, "/"); 

  const { data: jobTypes, isLoading: isJobTypesLoading } =
    api.jobType.getPlacementTypes.useQuery();

  const createJobOpeningMutation = api.jobOpenings.createJobOpening.useMutation({
    onSuccess: () => {
      router.replace("/hr?token="+decodedToken);
      router.refresh();
    },
  });

  const isCreationDisabled = useMemo(() => {
    if (
      !jobOpening.title ||
      !jobOpening.company ||
      !jobOpening.jobType ||
      !jobOpening.location ||
      !jobOpening.role ||
      !jobOpening.pay ||
      !jobOpening.payNumeric ||
      !jobOpening.registrationStart ||
      !jobOpening.registrationEnd ||
      !jobOpening.participatingGroups.length
    )
      return true;

    if (jobOpening.registrationStart > jobOpening.registrationEnd) return true;

    if (
      jobOpening.extraApplicationFields.some(
        (field) => !field.title || !field.format
      )
    )
      return true;

    if (
      jobOpening.participatingGroups.some(
        (group) => !group.admissionYear || !group.program
      )
    )
      return true;

    return false;
  }, [jobOpening]);

  // Now conditionally render UI based on token verification:
  if (tokenLoading) {
    return (
      <Container className="flex flex-col gap-4 py-4">
        <Typography>Verifying token, please wait...</Typography>
      </Container>
    );
  }

  console.log("Token Data: ", tokenData);
  console.log("Token Error: ", tokenError);
  

  if (tokenError) {
    return (
      <Container className="flex flex-col gap-4 py-4">
        <Alert severity="error">Wrong link</Alert>
      </Container>
    );
  }

  if (!tokenData.valid) {
    return (
      <Container className="flex flex-col gap-4 py-4">
        <Alert severity="warning">This token has already been used and you cannot create new job openings from this token.</Alert>
      </Container>
    );
  }

  // Now render the form normally:
  return (
    <Container className="flex flex-col gap-4 py-4">
      <Typography variant="h5" color="primary" className="px-4">
        New Job Opening
      </Typography>
      <Divider />
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const reqData: any = jobOpening;
          reqData.registrationStart = new Date(
            reqData.registrationStart.toISOString()
          );
          reqData.registrationEnd = new Date(
            reqData.registrationEnd.toISOString()
          );
          reqData.description = descEditorRef.current.getContent();
          reqData.participatingGroups = reqData.participatingGroups.map(
            (group) => ({
              admissionYear: parseInt(group.admissionYear),
              program: group.program,
              minCgpa: group.minCgpa,
              minCredits: group.minCredits
            })
          );

          createJobOpeningMutation.mutate({...reqData,token});
        }}
      >
        <FormControl variant="standard">
          <TextField
            label="Title"
            name="title"
            value={jobOpening.title}
            onChange={(e) =>
              setJobOpening({ ...jobOpening, title: e.target.value , company : {
                name: tokenData.company.name,
                domain: tokenData.company.website || "" ,
                logo: tokenData.company.logo || "",
              }})
            }
            inputProps={{ maxLength: 180 }}
            required
          />
          <FormHelperText className="text-right">
            {jobOpening.title.length}/180
          </FormHelperText>
        </FormControl>

        {!tokenData.company.logo ? (
          <div className="flex flex-col gap-2">
            <TextField
              label="Company"
              name="company"
              value={tokenData.company.name}
              disabled
              fullWidth
            />
            <TextField
              label="Company Logo URL"
              name="companyLogo"
              value={jobOpening.company?.logo || ""}
              onChange={(e) =>
                setJobOpening({
                  ...jobOpening,
                  company: { ...jobOpening.company, logo: e.target.value },
                })
              }
              required
            />
          </div>
        ) : (
          // <Autocomplete
          //   value={jobOpening.company}
          //   onChange={(_, newValue) =>
          //     setJobOpening({ ...jobOpening, company: newValue })
          //   }
          //   options={companyOptions || []}
          //   getOptionKey={(option) => option.domain}
          //   getOptionLabel={(option) => option.name}
          //   renderOption={(props, option) => (
          //     // @ts-ignore
          //     <div
          //       {...props}
          //       className="flex flex-row items-center gap-2 px-3 py-2 cursor-pointer"
          //     >
          //       <Avatar
          //         sx={{ borderRadius: 1 }}
          //         variant="square"
          //         src={option.logo}
          //       />
          //       <Typography variant="body2">{option.name}</Typography>
          //       <Typography variant="caption" color="textSecondary">
          //         ({option.domain})
          //       </Typography>
          //     </div>
          //   )}
          //   renderInput={(params) => (
          //     <div className="flex flex-row gap-2 items-center">
          //       {jobOpening.company?.logo && (
          //         <Avatar
          //           sx={{ borderRadius: 1, height: 54, width: 54 }}
          //           variant="square"
          //           src={jobOpening.company.logo}
          //         />
          //       )}
          //       <TextField
          //         {...params}
          //         label="Company"
          //         name="company"
          //         onChange={(e) => setCompanyQuery(e.target.value)}
          //         InputProps={{
          //           ...params.InputProps,
          //           required: true,
          //           endAdornment: (
          //             <React.Fragment>
          //               {debouncedQuery && isCompaniesLoading ? (
          //                 <CircularProgress color="inherit" size={20} />
          //               ) : null}
          //               {params.InputProps.endAdornment}
          //             </React.Fragment>
          //           ),
          //         }}
          //         required
          //       />
          //     </div>
          //   )}
          // />
          <div className="flex flex-row gap-2 items-center">
                {tokenData.company.logo && (
                  <Avatar
                    sx={{ borderRadius: 1, height: 54, width: 54 }}
                    variant="square"
                    src={tokenData.company.logo}
                  />
                )}
                <TextField
                  label="Company"
                  name="company"
                  value={tokenData.company.name}
                  disabled
                  fullWidth
                />
          </div>
        )}

        <FormControl>
          <InputLabel>Job Type *</InputLabel>
          <Select
            value={jobOpening.jobType}
            onChange={(e) =>
              setJobOpening({ ...jobOpening, jobType: e.target.value })
            }
            label="Job Type"
            endAdornment={
              isJobTypesLoading && (
                <CircularProgress color="inherit" size={20} className="mr-8" />
              )
            }
            required
          >
            {jobTypes?.map((jobType, index) => (
              <MenuItem key={index} value={jobType.id}>
                {jobType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Location"
          name="location"
          value={jobOpening.location}
          onChange={(e) =>
            setJobOpening({ ...jobOpening, location: e.target.value })
          }
          inputProps={{ maxLength: 180 }}
          required
        />
        <TextField
          label="Role"
          name="role"
          value={jobOpening.role}
          onChange={(e) =>
            setJobOpening({ ...jobOpening, role: e.target.value })
          }
          inputProps={{ maxLength: 180 }}
          required
        />
        <FormControl variant="standard">
          <TextField
            label="Pay"
            name="pay"
            value={jobOpening.pay}
            onChange={(e) =>
              setJobOpening({ ...jobOpening, pay: e.target.value })
            }
            inputProps={{ maxLength: 180 }}
            required
          />
          <FormHelperText>
          Specify the pay of the company as a string, same will be displayed
          to the user, e.g. "Rs. 12 LPA"
          </FormHelperText>
        </FormControl>
        <FormControl variant="standard">
          <TextField
            label="Pay(Numeric)"
            name="payNumeric"
            type="number"
            value={jobOpening.payNumeric}
            onChange={(e) =>
              setJobOpening({
                ...jobOpening,
                payNumeric: Number(e.target.value),
              })
            }
            inputProps={{ maxLength: 180, min: 0 }}
            required
          />
          <FormHelperText>
             Specify the pay of the company on per month basis for internship and
             per year basis for full time, this number will <strong>NOT</strong>{" "}
             be displayed to user. It will only be used for analytics.
          </FormHelperText>
        </FormControl>
        <DateTimePicker
          name="registrationStart"
          value={jobOpening.registrationStart}
          onChange={(date) =>
            setJobOpening({ ...jobOpening, registrationStart: date })
          }
          label="Registration Start Date and Time"
        />
        <DateTimePicker
          name="registrationEnd"
          value={jobOpening.registrationEnd}
          onChange={(date) =>
            setJobOpening({ ...jobOpening, registrationEnd: date })
          }
          label="Registration End Date and Time"
        />
        <JobOpeningGroupSelector
          jobTypeId={jobOpening.jobType}
          value={jobOpening.participatingGroups}
          onChange={(value) =>
            setJobOpening({ ...jobOpening, participatingGroups: value })
          }
        />
        <Typography variant="body1" color="text.disabled">
          Detailed Job Description:
        </Typography>
        <TextEditor
          height="60vmin"
          value={jobOpening.description}
          ref={descEditorRef}
        />
        <AdditionalFieldSelector
          value={jobOpening.extraApplicationFields}
          onChange={(value) =>
            setJobOpening({ ...jobOpening, extraApplicationFields: value })
          }
        />
        <div className="flex flex-row gap-4 justify-end flex-wrap">
          <FormControlLabel
            label="Create Hidden"
            control={
              <Checkbox
                size="small"
                checked={jobOpening.hidden}
                onChange={(e) =>
                  setJobOpening({ ...jobOpening, hidden: e.target.checked })
                }
              />
            }
          />
          <FormControlLabel
            label="Auto Approve"
            control={
              <Checkbox
                size="small"
                checked={jobOpening.autoApprove}
                onChange={(e) =>
                  setJobOpening({
                    ...jobOpening,
                    autoApprove: e.target.checked,
                  })
                }
              />
            }
          />
          <FormControlLabel
            label="Auto Visible"
            control={
              <Checkbox
                size="small"
                checked={jobOpening.autoVisible}
                onChange={(e) =>
                  setJobOpening({
                    ...jobOpening,
                    autoVisible: e.target.checked,
                  })
                }
              />
            }
          />
          <FormControlLabel
            label="Allow Already Selected Students"
            control={
              <Checkbox
                size="small"
                checked={jobOpening.allowSelected}
                onChange={(e) =>
                  setJobOpening({
                    ...jobOpening,
                    allowSelected: e.target.checked,
                  })
                }
              />
            }
          />
        </div>

        <Divider className="mt-12" />
        <Container className="flex flex-row justify-end">
          <LoadingButton
            type="submit"
            variant="contained"
            disabled={isCreationDisabled}
            loading={createJobOpeningMutation.isLoading}
          >
            Create
          </LoadingButton>
        </Container>
      </form>
    </Container>
  );
}