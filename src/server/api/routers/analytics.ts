import { z } from "zod";

import { roleProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  getJobTypes: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember']).query(async ({ ctx }) => {
    const data = await ctx.db.placementType.findMany({
      where: {
        ParticipatingGroups: {
          some: {
            year: ctx.session.user.year,
          },
        },
      },
    });
    return data;
  }),

  getJobTypeSelectionAnalytics: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember'])
    .input(z.object({
      jobTypeId: z.string(),
      filterType: z.enum(["program", "Caste", "Religion", "gender"]),
    }))
    .query(async ({ ctx, input }) => {
      const { jobTypeId, filterType } = input;

      const allStudents = await ctx.db.students.findMany({
        where: {
          passOutYear: ctx.session.user.year,
        },
        select: {
          userId : true,
          [filterType]: true,
        },
      });

      const selectedStudents = await ctx.db.selectedStudents.findMany({
        where: {
          year: ctx.session.user.year,
          jobType: jobTypeId,
        },
        select: {
          userId: true,
        },
      });

      const selectedStudentIds = new Set(selectedStudents.map((s) => s.userId));

      const groupedData: Record<string, { selected: number; all: number }> = {};

      console.log(selectedStudentIds);
      for (const student of allStudents) {
        const key = (student as any)[filterType] ?? "Unknown";

        if (!groupedData[key]) {
          groupedData[key] = { selected: 0, all: 0 };
        }
        groupedData[key].all += 1;

        console.log("hello");
        console.log(student);
        if (selectedStudentIds.has(student.userId)) {
          groupedData[key].selected += 1;
        }
      }

      const result = Object.entries(groupedData).map(([key, val]) => ({
        group: { [filterType]: key },
        all: val.all,
        selected: val.selected,
      }));

      return result;
    }),

  getJobTypePaymentAnalytics: roleProtectedProcedure('superAdmin')
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.$transaction([
        // @ts-ignore
        ctx.db.selectedStudents.groupBy({
          by: "payNumeric",
          _count: {
            payNumeric: true,
          },
          _min: {
            payNumeric: true,
          },
          _max: {
            payNumeric: true,
          },
          where: {
            year: ctx.session.user.year,
            jobType: input,
          },
        }),
        // @ts-ignore
        ctx.db.selectedStudents.groupBy({
          by: "basePay",
          _count: {
            basePay: true,
          },
          _min: {
            basePay: true,
          },
          _max: {
            basePay: true,
          },
          where: {
            year: ctx.session.user.year,
            jobType: input,
          },
        }),
        // @ts-ignore
        ctx.db.selectedStudents.groupBy({
          by: "stipend",
          _count: {
            stipend: true,
          },
          _min: {
            stipend: true,
          },
          _max: {
            stipend: true,
          },
          where: {
            year: ctx.session.user.year,
            jobType: input,
          },
        }),
      ]);
      return data;
    }),
});
