import { z } from "zod";
import { createTRPCRouter, roleProtectedProcedure, publicProcedure } from "../trpc";

// const fallbackJobTypeId = "1";
// const fullTime = await ctx.db.placementType.findFirst({
//   where: { name: "Full Time" },
// });
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
        offerLetter: z.string().optional(), // ✅ Optional field for offer letter URL
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
        offerLetter,
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
          offerLetter: offerLetter || "", // ✅ Save it if provided
        },
      });

      return noc;
    }),

  // Update the NOC status (admin only)
  updateStatus: roleProtectedProcedure("superAdmin")
  .input(
    z.object({
      nocId: z.number(),
      status: z.enum(["Approved", "Rejected"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const noc = await ctx.db.placementNOC.update({
      where: { id: input.nocId },
      data: { status: input.status },
      // include: { user: true }, // To get userId
    });

    if (input.status === "Approved") {
      // Check if a selection already exists
      const exists = await ctx.db.selectedStudents.findFirst({
        where: {
          student: {
            userId: noc.userId,
          },
          company: {
            name: noc.companyName,
          },
        },
      });

      if (!exists) {
        // Create or get the company
        let company = await ctx.db.company.findFirst({
          where: { name: noc.companyName },
          select: { id: true },
        });

        if (!company) {
          company = await ctx.db.company.create({
            data: {
              name: noc.companyName,
              website: "", // Optional, update if available
              logo: "",    // Optional, update if available
            },
            select: { id: true },
          });
        }

        await ctx.db.selectedStudents.create({
          data: {
            year: ctx.session.user.year,
            selectedAt: new Date(noc.todaysDate),
            role: "N/A",
            payNumeric: noc.salary,
            basePay: noc.salary,
            stipend: 0,
            isOnCampus: false,
            company: {
              connect: { id: company.id },
            },
            student: {
              connect: { userId: noc.userId },
            },
            placementType: {
              connect: {
                id: 1,
                // create: { name: "Full Time" },
              },
            },
            author: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      }
    }

    return true;
  }),

  // Fetch the logged-in user's NOC
  getMyNoc: roleProtectedProcedure("student").query(async ({ ctx }) => {
    return ctx.db.placementNOC.findFirst({
      where: { userId: ctx.session.user.id },
    });
  }),

  // Fetch all NOC requests (admin only)
  getAllNocs: roleProtectedProcedure("superAdmin").query(async ({ ctx }) => {
    return ctx.db.placementNOC.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});
