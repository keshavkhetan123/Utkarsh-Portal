"use client";

import React, { useState } from "react";
import { Container, Typography, Alert, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { api } from "~/trpc/react";

export default function GenerateHRLinkPage() {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Mutation to generate HR link. This mutation doesn't require any input.
  // Adjust the TRPC mutation if needed.
  const generateLinkMutation = api.hrToken.generateHRToken.useMutation({
    onSuccess: (data) => {
      setGeneratedLink(data.link);
      setLinkError(null);
    },
    onError: (err: any) => {
      setLinkError(err.message || "Error generating link");
    },
  });

  const handleGenerateLink = () => {
    setGeneratedLink(null);
    setLinkError(null);
    generateLinkMutation.mutate();
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  return (
    <Container className="flex flex-col gap-4 py-4" maxWidth="sm">
      <Typography variant="h5" color="primary">
        Generate HR Link
      </Typography>
      <LoadingButton
        variant="contained"
        onClick={handleGenerateLink}
        loading={generateLinkMutation.isLoading}
      >
        Generate Link
      </LoadingButton>
      {generatedLink && (
        <>
          <Alert severity="success">
            Your HR link: <strong>{generatedLink}</strong>
          </Alert>
          <Button variant="outlined" onClick={copyToClipboard}>
            Copy Link
          </Button>
        </>
      )}
      {linkError && <Alert severity="error">{linkError}</Alert>}
    </Container>
  );
}
