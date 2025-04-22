import { z } from "zod";

import { roleProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";

//not working yet need some dummy data.
export const userRouter = createTRPCRouter({
  getUserGroups: roleProtectedProcedure('superAdmin').query(async ({ ctx }) => {
    const data = await ctx.db.students.groupBy({
      by: ["passOutYear", "program"],
    });

    let result = data;
    // data.forEach((item) => {
    //   result[item] = item.programs;
    // });
    return result;
  }),

  searchUser: roleProtectedProcedure(['superAdmin','PlacementCoreTeam','PlacementTeamMember']).input(
    z.object({
      q: z.string(),
      exclude: z.array(z.string()).optional(),
      include: z.array(z.string()).optional(),
      isAdmin: z.boolean().optional(),
      year: z.number().optional(),
    })
  ).query(async ({ ctx, input }) => {
    const data = await ctx.db.user.findMany({
      where: {
        AND: [
          // Search users where name or username contains input.q
          ...(input.year ? [{ year: input.year }] : []),
          {
            OR: [
              { name: { contains: input.q } },
              { username: { contains: input.q } },
            ],
          },
          // Exclude or include specific user IDs if provided
          {
            OR: [
              input.exclude
                ? { NOT: { id: { in: input.exclude } } }
                : {},
              input.include
                ? { id: { in: input.include } }
                : {},
            ],
          },
          // Ensure users have one of the required roles
          {
            role: {
              name: {
                in: ["PlacementCoreTeam", "PlacementTeamMember", "student"],
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: {
          select: { name: true }, // Get user role
        },
      },
      take: 10, 
    });
  
    return data;
  }),
  
});
