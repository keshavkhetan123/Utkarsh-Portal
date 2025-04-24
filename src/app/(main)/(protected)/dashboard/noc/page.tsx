"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
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
    details: "",
  });
  const [acceptedTnC, setAcceptedTnC] = useState(false);
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);

  const {
    data: myNoc,
    isLoading: loadingNoc,
    refetch,
  } = api.noc.getMyNoc.useQuery();


  const { data: user, isLoading: userLoading } = api.user.getProfile.useQuery();

  const createNoc = api.noc.createNoc.useMutation({
    onSuccess: async () => {
      await refetch();
    },
    onError: (err) => {
      alert(err.message || "Something went wrong");
    },
  });

  const uploadOfferLetter = api.studentResume.uploadNoc.useMutation();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ 
      ...prev, 
      todaysDate: today,
      name: user?.name || "",
      rollNo: user?.username
    }));
  }, [user]);

  console.log("yaha dekho");
  console.log(formData);
  console.log(formData.name);
  console.log(user);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    let offerLetterUrl = "";

    if (offerLetterFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileDataUrl = e.target?.result as string;
        const fileName = "offer_letter_" + Date.now();

        try {
          const res = await uploadOfferLetter.mutateAsync({
            key: fileName,
            fileDataUrl,
          });
          offerLetterUrl = res.url;
        } catch (err) {
          console.error("Offer Letter upload failed", err);
          alert("Failed to upload offer letter");
          return;
        }

        createNoc.mutate({
          ...formData,
          offerLetter: offerLetterUrl,
        });
      };
      reader.readAsDataURL(offerLetterFile);
    } else {
      createNoc.mutate({
        ...formData,
        offerLetter: "",
      });
    }
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
  else if(userLoading){
    if (userLoading) {
      return (
        <Container className="flex justify-center items-center h-80">
          <CircularProgress />
        </Container>
      );
    }
  }

  return (
    <Container fixed className="flex flex-col gap-8 py-4">
      <Typography variant="h4" color="primary">
        NOC Request
      </Typography>
      <Divider />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
            required
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Roll No"
            value={formData.rollNo}
            onChange={(e) => handleChange("rollNo", e.target.value)}
            fullWidth
            required
            InputProps={{ readOnly: true }}
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
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Salary"
            type="number"
            value={formData.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Additional Details (How did you land the Job)"
            multiline
            rows={3}
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="outlined" component="label">
            Upload Offer Letter PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.type === "application/pdf") setOfferLetterFile(f);
              }}
            />
          </Button>
          <Typography variant="body2" className="mt-2">
            {offerLetterFile ? `Selected: ${offerLetterFile.name}` : "No file selected"}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTnC}
                onChange={(e) => setAcceptedTnC(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                I have read and agree to the{" "}
                <MuiLink href="https://utkarsh-resume.buddylonglegs.tech/Terms%20and%20Conditions.pdf" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </MuiLink>
              </Typography>
            }
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={createNoc.isLoading || uploadOfferLetter.isLoading || !acceptedTnC}
      >
        {createNoc.isLoading || uploadOfferLetter.isLoading
          ? "Submitting..."
          : "Submit NOC Request"}
      </Button>
    </Container>
  );
}
