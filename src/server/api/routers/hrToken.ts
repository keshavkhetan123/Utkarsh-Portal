// In a new HRToken router file (e.g., src/server/api/routers/hrToken.ts):

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const hrTokenRouter = createTRPCRouter({
  generateHRToken: protectedProcedure.mutation(async ({ input }) => {
    // Create a random token (for example, using crypto):
    const token = require("crypto").randomBytes(16).toString("hex");

    // Create the HRToken record
    const hrToken = await db.hRToken.create({
      data: { token, isValid: true },
    });

    // Here you might also store the title/company if needed (or later associate them)
    // For now, simply return the token or the generated link (for example, a URL with the token as query parameter)
    return { token, link: `http://localhost:3000/hr?token=${token}` };
  }),

  // This procedure verifies a token, marks it as used (or simply returns valid) and allows access to the job opening form
  verifyHRToken: publicProcedure.input(
    z.object({
      token: z.string(),
    })
  ).query(async ({ input }) => {
    const hrToken = await db.hRToken.findUnique({
      where: { token: input.token },
    });
    if (!hrToken || !hrToken.isValid) {
      throw new Error("Invalid token");
    }
    // Optionally, mark the token as used:
    // await db.hRToken.update({ where: { token: input.token }, data: { isValid: false } });

    return { valid: true };
  }),
});
