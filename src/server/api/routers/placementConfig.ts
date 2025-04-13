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
      by: ["year", "passOutYear", "program"],
      having: {
        program: user.program,
        passOutYear: user.passOutYear,
      },
    });
    return data.map((el) => el.year);
  }),
  getAdminPlacementYears: roleProtectedProcedure(['superAdmin','PlacementCoreTeam','PlacementTeamMember']).query(async ({ ctx }) => {
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
      by: ["passOutYear", "program"],
    });

    const yearWisePrograms: {
      [key: number]: string[];
    } = {};

    data.forEach((el) => {
      if (!yearWisePrograms[el.passOutYear]) {
        yearWisePrograms[el.passOutYear] = [];
      }
      yearWisePrograms[el.passOutYear].push(el.program);
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
                passOutYear: z.number(),
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
            passOutYear: batch.passOutYear,
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
                passOutYear: z.number(),
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
            passOutYear: batch.passOutYear,
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
        by: ["passOutYear", "program"],
        where: {
          placementTypeId: input,
          year: 2026,
        },
      });
      const yearWisePrograms: {
        [key: number]: string[];
      } = {};

      data.forEach((el) => {
        if (!yearWisePrograms[el.passOutYear]) {
          yearWisePrograms[el.passOutYear] = [];
        }
        yearWisePrograms[el.passOutYear].push(el.program);
      });
      return yearWisePrograms;
    }),
});
