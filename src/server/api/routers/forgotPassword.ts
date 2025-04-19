import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import bcrypt from "bcryptjs";
import { db } from "~/server/db"; // or however your DB is accessed
import crypto from "crypto";

export const forgotPasswordRouter = createTRPCRouter({
  sendResetEmail: publicProcedure
    .input(z.object({ username: z.string()}))
    .mutation(async ({ input }) => {

    const token = crypto.randomBytes(32).toString("hex");

    const user = await db.user.update({
      where:{
        username : input.username,
      },
      data: {
        passwordResetToken: token,
      }
    });

    if(!user){
      throw new Error('User does not exist!');
    }

    const email = `${input.username}@iiita.ac.in`;  

    const resetUrl = new URL(`/reset/${input.username}`, process.env.CLIENT_URL);
    resetUrl.searchParams.set("token", token);
    const resetLink = resetUrl.toString();
     

      const transporter = nodemailer.createTransport({
        service: "gmail",
        port:465,
        secure:true,
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
      token: z.string(),   
    }))
    .mutation(async ({ input }) => {
      const { username, pass, token } = input;

      console.log(username);
  
      // Check if user exists
      const user = await db.user.findUnique({
        where: { username: username, passwordResetToken : token },
      });
  
      if (!user) {
        throw new Error("User not found OR invalid token");
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(pass, 10);
  
      // Update password in DB
      await db.user.update({
        where: { username : username },
        data: { password: hashedPassword, passwordResetToken : undefined },
      });
  
      return { message: "Password reset successful." };
    }),

});
