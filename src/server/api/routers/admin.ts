import { z } from "zod";

import {
  roleProtectedProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getAdmins: roleProtectedProcedure("superAdmin")
  .input(
    z.object({
      query: z.string().optional().default(undefined),
    })
  )
  .query(async ({ ctx, input }) => {
    return await ctx.db.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: ctx.session.user.id,
            },
          },
          {
            ...(input.query && {  //what happens when input.query is undefine, what is the sql query of this procedure
              OR: [
                { name: { contains: input.query } },
                { username: { contains: input.query } },
              ],
            }),
          },
          {
            role: {
              name: {
                in: ["superAdmin", "PlacementCoreTeam", "PlacementTeamMember"], // Filtering by multiple roles
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        userGroup: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }),

  updateUserPermission: roleProtectedProcedure("superAdmin")
  .input(
    z.object({
      id: z.string(),
      // Only allow one of the allowed roles
      role: z.enum(["PlacementCoreTeam", "PlacementTeamMember", "student"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (ctx.session.user.id === input.id) {
      throw new Error("You can't change your own role.");
    }

    return await ctx.db.user.update({
      where: { id: input.id },
      data: {
        role: {
          connectOrCreate: {
            where: { name: input.role },
            create: { name: input.role },
          },
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: {
          select: { name: true },
        },
      },
    });
  }),


  // raiseAdminRequest: protectedProcedure.mutation(async ({ ctx }) => {
  //   const admin = await ctx.db.admin.findFirst({
  //     where: {
  //       userId: ctx.session.user.id,
  //     },
  //   });
  //   if (admin) {
  //     throw new Error("You are already an admin.");
  //   }
  //   return await ctx.db.admin.create({
  //     data: {
  //       user: {
  //         connect: {
  //           id: ctx.session.user.id,
  //         },
  //       },
  //       permissions: 0,
  //     },
  //   });
  // }),
});
