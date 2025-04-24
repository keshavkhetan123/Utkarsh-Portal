"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Select,
  Typography,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function NocAdminPage() {
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  const { data: allNocs, isLoading, refetch } = api.noc.getAllNocs.useQuery();

  const updateStatus = api.noc.updateStatus.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => alert(err.message),
  });

  const handleStatusUpdate = (nocId: number, status: "Approved" | "Rejected") => {
    updateStatus.mutate({ nocId, status });
  };

  const filteredNocs = allNocs?.filter((noc) =>
    filterStatus === "All" ? true : noc.status === filterStatus
  );

  return (
    <Container className="py-6 flex flex-col gap-4">
      <Typography variant="h4" color="primary">
        NOC Submissions
      </Typography>

      <Divider />

      <Box className="flex justify-end">
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) =>
              setFilterStatus(e.target.value as "All" | "Pending" | "Approved" | "Rejected")
            }
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box className="h-80 flex justify-center items-center">
          <CircularProgress />
        </Box>
      ) : (
        filteredNocs?.map((noc) => (
          <Accordion key={noc.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box className="flex flex-col sm:flex-row sm:justify-between w-full">
                <Typography className="font-medium">{noc.name}</Typography>
                <Typography className="text-sm text-gray-600">
                  Roll No: {noc.rollNo}
                </Typography>
                <Typography className="text-sm text-gray-600">
                  Company: {noc.companyName}
                </Typography>
                <Chip
                  size="small"
                  label={noc.status}
                  color={
                    noc.status === "Approved"
                      ? "success"
                      : noc.status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                  className="ml-2"
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails className="flex flex-col gap-2 text-sm text-gray-700">
  <Typography><strong>Name:</strong> {noc.name}</Typography>
  <Typography><strong>Roll No:</strong> {noc.rollNo}</Typography>
  <Typography><strong>Company:</strong> {noc.companyName}</Typography>
  <Typography><strong>Location:</strong> {noc.location}</Typography>
  <Typography><strong>Offer Letter Date:</strong> {new Date(noc.offerLetterDate).toDateString()}</Typography>
  <Typography><strong>Submitted On:</strong> {new Date(noc.todaysDate).toDateString()}</Typography>
  <Typography><strong>Salary:</strong> ₹{noc.salary}</Typography>

  {noc.offerLetter && (
    <Typography>
      <strong>Offer Letter:</strong>{" "}
      <a
        href={noc.offerLetter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View PDF
      </a>
    </Typography>
  )}

  {noc.status === "Pending" && (
    <Box className="flex gap-4 pt-2">
      <Button
        size="small"
        color="success"
        variant="outlined"
        onClick={() => handleStatusUpdate(noc.id, "Approved")}
      >
        Approve
      </Button>
      <Button
        size="small"
        color="error"
        variant="outlined"
        onClick={() => handleStatusUpdate(noc.id, "Rejected")}
      >
        Reject
      </Button>
    </Box>
  )}
</AccordionDetails>

          </Accordion>
        ))
      )}
    </Container>
  );
}
