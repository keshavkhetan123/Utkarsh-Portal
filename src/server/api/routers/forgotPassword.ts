import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import bcrypt from "bcryptjs";
import { db } from "~/server/db"; // or however your DB is accessed

export const forgotPasswordRouter = createTRPCRouter({
  sendResetEmail: publicProcedure
    .input(z.object({ email: z.string()}))
    .mutation(async ({ input }) => {
     const email = `${input.email}@iiita.ac.in`;

      // const token = Math.random().toString(36).substring(2); // You can store this token in DB if needed
      const resetLink = `${process.env.CLIENT_URL}/reset/${input.email}`;

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

    resetPassword : publicProcedure
    .input(z.object({
      username: z.string(),       
      pass: z.string(),     
    }))
    .mutation(async ({ input }) => {
      const { username, pass } = input;

      console.log(username);
  
      // Check if user exists
      const user = await db.user.findUnique({
        where: { username: username },
      });
  
      if (!user) {
        throw new Error("User not found.");
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(pass, 10);
  
      // Update password in DB
      await db.user.update({
        where: { username : username },
        data: { password: hashedPassword },
      });
  
      return { message: "Password reset successful." };
    }),
});
