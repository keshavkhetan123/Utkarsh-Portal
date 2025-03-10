import { z } from "zod";

import {
  roleProtectedProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const placementConfigRouter = createTRPCRouter({
  getStudentPlacementYears: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.students.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });
    const data = await ctx.db.participatingGroups.groupBy({
      by: ["year", "admissionYear", "program"],
      having: {
        program: user.program,
        admissionYear: user.admissionYear,
      },
    });
    return data.map((el) => el.year);
  }),
  getAdminPlacementYears: roleProtectedProcedure('superAdmin').query(async ({ ctx }) => {
    const data = await ctx.db.participatingGroups.groupBy({
      by: ["year"],
      orderBy: [{ year: "desc" }],
    });
    return data.map((el) => el.year);
  }),
  getPlacementTypes: roleProtectedProcedure('superAdmin').query(async ({ ctx }) => {
    const data = await ctx.db.placementType.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return data;
  }),
  getYearwisePrograms: roleProtectedProcedure('superAdmin').query(async ({ ctx }) => {
    const data = await ctx.db.students.groupBy({
      by: ["admissionYear", "program"],
    });

    const yearWisePrograms: {
      [key: number]: string[];
    } = {};

    data.forEach((el) => {
      if (!yearWisePrograms[el.admissionYear]) {
        yearWisePrograms[el.admissionYear] = [];
      }
      yearWisePrograms[el.admissionYear].push(el.program);
    });

    return yearWisePrograms;
  }),
  getParticipatingGroups: roleProtectedProcedure('superAdmin')
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.participatingGroups.findMany({
        where: {
          year: input,
        },
        include: {
          placementType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return data;
    }),
  createParticipatingGroups: roleProtectedProcedure('superAdmin')
    .input(
      z.object({
        year: z.number(),
        placementConfigs: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            batches: z.array(
              z.object({
                program: z.string(),
                admissionYear: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const allGroups = [];
      for (const config of input.placementConfigs) {
        for (const batch of config.batches) {
          allGroups.push({
            year: input.year,
            placementTypeId: config.id,
            program: batch.program,
            admissionYear: batch.admissionYear,
          });
        }
      }
      await ctx.db.participatingGroups.createMany({
        data: allGroups,
      });
      return true;
    }),

  editParticipatingGroups: roleProtectedProcedure('superAdmin')
    .input(
      z.object({
        year: z.number(),
        placementConfigs: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            batches: z.array(
              z.object({
                program: z.string(),
                admissionYear: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.participatingGroups.deleteMany({
        where: {
          year: input.year,
        },
      });
      const allGroups = [];
      for (const config of input.placementConfigs) {
        for (const batch of config.batches) {
          allGroups.push({
            year: input.year,
            placementTypeId: config.id,
            program: batch.program,
            admissionYear: batch.admissionYear,
          });
        }
      }
      await ctx.db.participatingGroups.createMany({
        data: allGroups,
      });
      return true;
    }),
  getParticipatingGroupsForPlacementType: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.participatingGroups.groupBy({
        by: ["admissionYear", "program"],
        where: {
          placementTypeId: input,
          year: 2026,
        },
      });
      const yearWisePrograms: {
        [key: number]: string[];
      } = {};

      data.forEach((el) => {
        if (!yearWisePrograms[el.admissionYear]) {
          yearWisePrograms[el.admissionYear] = [];
        }
        yearWisePrograms[el.admissionYear].push(el.program);
      });
      return yearWisePrograms;
    }),
});
