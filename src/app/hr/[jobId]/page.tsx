import { Alert, Container, IconButton, Link } from "@mui/material";

import { api } from "~/trpc/server";

import ApplicantsTable from "../_components/ApplicantsTable";
import JobRow from "../_components/jobRow/JobRow";
import RegDetails from "../_components/RegDetails";
import React from "react";

export default async function Page({
  params,
}: {
  params: {
    jobId: string;
  };
}) {
  const opening = await api.jobOpenings.hrGetJobOpening.query(params.jobId);
  return (
    <>
    {
      opening.hr.viewPermissions
      ?<Container className="py-4 flex flex-col gap-4">
        <JobRow {...opening} />
        <RegDetails jobId={params.jobId} />
        <ApplicantsTable
          jobId={params.jobId}
          extraApplicationFields={null}
        />
      </Container>
      :<Container className="flex flex-col gap-4 py-4">
        <Alert severity="info">This token has been disabled by Admin. Please Contact IIITA Placement cell for Enabling this token </Alert>
      </Container>
    }
      
    </>
  );
}
