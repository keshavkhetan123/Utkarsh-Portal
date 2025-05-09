"use client";

import { useRouter } from "next/navigation";
import { Button, Typography, Box } from "@mui/material";

export default function ErrorPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      textAlign="center"
      px={2}
    >
      <Typography variant="h4" gutterBottom>
        Something wrong happened,go back to the dashboard.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleBack} sx={{ mt: 2 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}