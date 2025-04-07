import { z } from "zod";
import { createTRPCRouter, roleProtectedProcedure, publicProcedure } from "../trpc";

export const nocRouter = createTRPCRouter({
  // Create a NOC request
  createNoc: roleProtectedProcedure("student")
    .input(
      z.object({
        name: z.string(),
        rollNo: z.string(),
        offerLetterDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date",
        }),
        todaysDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date",
        }),
        companyName: z.string(),
        salary: z.union([z.string(), z.number()]),
        location: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.placementNOC.findFirst({
            where: { userId: ctx.session.user.id },
          });
          if (existing) throw new Error("NOC already submitted");
        const {
        name,
        rollNo,
        offerLetterDate,
        todaysDate,
        companyName,
        salary,
        location,
      } = input;

      const noc = await ctx.db.placementNOC.create({
        data: {
          name,
          rollNo,
          offerLetterDate: new Date(offerLetterDate),
          todaysDate: new Date(todaysDate),
          companyName,
          salary: parseFloat(salary.toString()),
          location,
          userId: ctx.session.user.id,
          // Optional: Add `reason` and `details` to Prisma schema if needed
        },
      });

      return noc;
    }),
    updateStatus: roleProtectedProcedure("superAdmin")
  .input(
    z.object({
      nocId: z.number(),
      status: z.enum(["Approved", "Rejected"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.db.placementNOC.update({
      where: { id: input.nocId },
      data: { status: input.status },
    });
    return true;
  }),
    getMyNoc: roleProtectedProcedure("student").query(async ({ ctx }) => {
        return ctx.db.placementNOC.findFirst({
          where: { userId: ctx.session.user.id },
        });
      }),
  // Optional: Fetch all NOC requests (for admin dashboard)
  getAllNocs: roleProtectedProcedure("superAdmin").query(async ({ ctx }) => {
    return ctx.db.placementNOC.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});
