"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import { api } from "~/trpc/react";

export default function NocRequestPage() {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    offerLetterDate: "",
    todaysDate: "",
    companyName: "",
    salary: "",
    location: "",
    reason: "",
    details: "",
  });

  const {
    data: myNoc,
    isLoading: loadingNoc,
    refetch,
  } = api.noc.getMyNoc.useQuery();

  const createNoc = api.noc.createNoc.useMutation({
    onSuccess: async () => {
      await refetch();
    },
    onError: (err) => {
      alert(err.message || "Something went wrong");
    },
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, todaysDate: today }));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    createNoc.mutate(formData);
  };

  if (loadingNoc) {
    return (
      <Container className="flex justify-center items-center h-80">
        <CircularProgress />
      </Container>
    );
  }

  if (myNoc) {
    return (
      <Container className="flex flex-col items-center justify-center gap-6 py-10">
        <Typography variant="h5" color="primary">
          You have already submitted a NOC
        </Typography>
        <Box className="flex flex-col gap-2 text-center">
          <Typography>Name: {myNoc.name}</Typography>
          <Typography>Roll No: {myNoc.rollNo}</Typography>
          <Typography>Company: {myNoc.companyName}</Typography>
          <Typography>Location: {myNoc.location}</Typography>
          <Typography>
            Status:{" "}
            <Chip
              label={myNoc.status}
              color={
                myNoc.status === "Approved"
                  ? "success"
                  : myNoc.status === "Rejected"
                  ? "error"
                  : "warning"
              }
            />
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container fixed className="flex flex-col gap-8 py-4">
      <Typography variant="h4" color="primary">
        NOC Request
      </Typography>
      <Divider />

      <Grid container spacing={2}>
        {/* same TextFields as before */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Roll No"
            value={formData.rollNo}
            onChange={(e) => handleChange("rollNo", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Offer Letter Date"
            type="date"
            value={formData.offerLetterDate}
            onChange={(e) => handleChange("offerLetterDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Today's Date"
            type="date"
            value={formData.todaysDate}
            InputLabelProps={{ shrink: true }}
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Salary"
            type="number"
            value={formData.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Reason for NOC"
            multiline
            rows={3}
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Additional Details"
            multiline
            rows={3}
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={createNoc.isLoading}
      >
        {createNoc.isLoading ? "Submitting..." : "Submit NOC Request"}
      </Button>
    </Container>
  );
}
