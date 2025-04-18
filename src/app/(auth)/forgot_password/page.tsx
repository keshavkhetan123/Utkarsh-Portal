"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  FormControl,
  OutlinedInput,
  Button,
} from "@mui/material";
import { api } from "~/trpc/react"; // <-- Import tRPC

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Use tRPC mutation
  const sendResetEmail = api.forgotPassword.sendResetEmail.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      alert(error.message || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // if (!email || !email.includes("@")) {
    //   setEmailError(true);
    //   return;
    // }

    sendResetEmail.mutate({ email: email });
};

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Container maxWidth="sm">
        <Paper
          component="form"
          className="flex flex-col w-full px-6 py-6"
          elevation={4}
          onSubmit={handleSubmit}
        >
          <Typography variant="h5" className="text-center font-semibold mb-4">
            Forgot Password
          </Typography>

          {!isSubmitted ? (
            <>
              <Typography variant="body2" className="mb-2">
                Enter your Username and we'll send you a link to reset your password.
              </Typography>

              <FormControl margin="dense" error={emailError} required>
                <OutlinedInput
                  id="Username"
                  name="Username"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  fullWidth
                  autoComplete="Username"
                />
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="mt-4"
                disabled={sendResetEmail.isLoading}
              >
                {sendResetEmail.isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </>
          ) : (
            <Typography variant="body1" className="text-green-600 text-center">
              If this Username exists, a reset link has been sent!
            </Typography>
          )}

          <Typography
            variant="body2"
            className="mt-4 text-center cursor-pointer text-blue-600 hover:underline"
            onClick={() => router.push("/")}
          >
            Back to Login
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}
