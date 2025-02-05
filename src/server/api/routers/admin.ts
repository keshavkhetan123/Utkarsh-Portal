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
      query: z.string().optional(),
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
            ...(input.query && {
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


  createAdmin: roleProtectedProcedure("superAdmin")
  .input(
    z.object({
      id: z.string()
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (ctx.session.user.id === input.id) {
      throw new Error("You can't assign a role to yourself.");
    }

    return await ctx.db.user.update({
      where: { id: input.id },
      data: {
        role: {
          connectOrCreate: {
            where: { name: "PlacementTeamMember" },
            create: { name: "PlacementTeamMember" },
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


  removeAdmin: roleProtectedProcedure('superAdmin')
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input) {
        throw new Error("You can't remove yourself from admin.");
      }
      return await ctx.db.admin.delete({
        where: {
          userId: input,
        },
      });
    }),

  updateAdminPermission: roleProtectedProcedure('superAdmin')
    .input(
      z.object({
        id: z.string(),
        permissions: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id == input.id) {
        throw new Error("You cannot make yourself admin.");
      }
      return await ctx.db.admin.update({
        where: {
          userId: input.id,
        },
        data: {
          permissions: input.permissions,
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
