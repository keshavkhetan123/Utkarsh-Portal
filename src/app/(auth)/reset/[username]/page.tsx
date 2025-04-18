"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Typography,
} from "@mui/material";

import vector from "~/assets/vectors/login.svg";

export default function Login() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  const resetPassword = api.forgotPassword.resetPassword.useMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [pass, setPass] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pass.trim() === "") {
      setPasswordError(true);
      return;
    }

    setPasswordError(false);

    try {
      await resetPassword.mutateAsync({username, pass });
      alert("Password reset successful.");
      router.push("/login"); // or wherever you want
    } catch (error) {
      console.error("Reset error:", error);
      alert("Error resetting password.");
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 absolute top-0">
      <Container className="flex flex-col justify-center items-center">
        <Paper
          component="form"
          className="flex flex-col w-full max-w-sm px-6 py-4"
          elevation={4}
          onSubmit={handleSubmit}
        >
          <Typography
            variant="h5"
            className="w-full text-center font-semibold mb-2"
          >
            Reset Password
          </Typography>

          <FormControl margin="dense" error={passwordError} required>
            <OutlinedInput
              id="password"
              name="password"
              placeholder="New Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              fullWidth
              type={showPassword ? "text" : "password"}
              autoComplete="on"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            className="mt-6"
            fullWidth
            size="large"
            loading={resetPassword.isLoading}
          >
            <span>Reset Password</span>
          </LoadingButton>
        </Paper>
      </Container>

      <Container
        className="hidden md:flex flex-col justify-center items-center max-h-svh"
        sx={{ bgcolor: "primary.main" }}
      >
        <Image src={vector} alt="Login" className="max-w-full max-h-min" />
      </Container>

      <Container
        className="z-10 w-full h-5 absolute bottom-0"
        maxWidth={false}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          color: "text.disabled",
          fontSize: "0.8rem",
          backgroundColor: "bgclear",
          backdropFilter: "blur(10px)",
        }}
      >
        Created by Sugam Sareen and his team
      </Container>
    </div>
  );
}
