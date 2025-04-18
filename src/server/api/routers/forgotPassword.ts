import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const forgotPasswordRouter = createTRPCRouter({
  sendResetEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      const token = Math.random().toString(36).substring(2); // You can store this token in DB if needed
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      try {
        await transporter.sendMail({
          from: `"Support Team" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Password Reset Request",
          html: `
            <p>Hello,</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetLink}" style="color:blue;">Reset Password</a>
            <p>This link will expire in 15 minutes.</p>
          `,
        });

        return { message: "Reset email sent successfully." };
      } catch (error) {
        console.error("Email error:", error);
        throw new Error("Failed to send reset email.");
      }
    }),
});
