import { z } from "zod";

import {
  roleProtectedProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getLatestPost: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userDetails = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          student: {
            select: {
              passOutYear: true,
              program: true,

            },
          },
        },
      });
      const data = await ctx.db.post.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        where: {
          published: true,
          year: ctx.session.user.year,
          OR: [
            {
              participatingGroups: {
                some: {
                  passOutYear: userDetails.student.passOutYear,
                  program: userDetails.student.program,
                },
              },
            },
            {
              individualParticipants: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.pageSize + 1, // Fetch one extra to check hasMore
        skip: (input.page - 1) * input.pageSize,
      });
      
      return {
        data: data.slice(0, input.pageSize),
        hasMore: data.length > input.pageSize,
      };      
    }),
    
  getPost: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userDetails = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          student: {
            select: {
              passOutYear: true,
              program: true,
            },
          },
        },
      });
      const data = await ctx.db.post.findUniqueOrThrow({
        where: {
          published: true,
          id: input,
          OR: [
            {
              participatingGroups: {
                some: {
                  passOutYear: userDetails.student.passOutYear,
                  program: userDetails.student.program,
                },
              },
            },
            {
              individualParticipants: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          createdAt: true,
          title: true,
          content: true,
          author: {
            select: {
              name: true,
            },
          },
          participatingGroups: {
            select: {
              passOutYear: true,
              minCgpa: true,
              program: true,
            }
          },
          individualParticipants: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            }
          }
        },
      });
      return data;
    }),
  addNewPost: roleProtectedProcedure('superAdmin')
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        participatingGroups: z.array(
          z.object({
            passOutYear: z.number(),
            program: z.string(),
            minCgpa: z.number().max(10).optional().default(0),
          }),
        ),
        jobType: z.string().nullable().default(null),
        individualParticipants: z.array(z.string()).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          year: ctx.session.user.year,
          authorId: ctx.session.user.id,
          published: true,
          jobType: input.jobType,
          participatingGroups: {
            createMany: {
              data: input.participatingGroups.map((group) => ({
                passOutYear: group.passOutYear,
                program: group.program,
                minCgpa: group.minCgpa,
              })),
            }
          },
          individualParticipants: {
            createMany: {
              data: input.individualParticipants.map((userId) => ({
                userId,
              })),
            },
          },

        },
      });
      return true;
    }),
  updatePost: roleProtectedProcedure('superAdmin')
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        participatingGroups: z.array(
          z.object({
            passOutYear: z.number(),
            program: z.string(),
            minCgpa: z.number().max(10).optional().default(0),
          }),
        ),
        jobType: z.string().nullable().default(null),
        individualParticipants: z.array(z.string()).nullable(),

      }),

    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([ctx.db.postParticipantGroups.deleteMany({
        where: {
          postId: input.id
        }
      }),
      ctx.db.postIndividualParticipants.deleteMany({
        where: {
          postId: input.id
        },
      }),
      ]);


      await ctx.db.post.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.content,
          authorId: ctx.session.user.id,
          published: true,
          jobType: input.jobType,
          participatingGroups: {
            createMany: {
              data: input.participatingGroups.map((group) => ({
                passOutYear: group.passOutYear,
                program: group.program,
                minCgpa: group.minCgpa,
              })),
            }
          },
          individualParticipants: {
            createMany: {
              data: input.individualParticipants.map((userId) => ({
                userId,
              })),
            },
          },
        },
      });
      return true;
    }),
  deletePost: roleProtectedProcedure('superAdmin')
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.post.delete({
        where: {
          id: input,
        },
      });

      return true;
    }),

  getLatestPostAdmin: roleProtectedProcedure("superAdmin")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().max(100).default(10),
        jobType: z.string().nullable().default("All"),
        passOutYear: z.number().nullable().default(2026),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, jobType, passOutYear } = input;
  
      const posts = await ctx.db.post.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        where: {
          published: true,
          year: passOutYear,
          jobType: jobType,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize + 1, // Fetch one extra to determine hasMore
        skip: (page - 1) * pageSize,
      });
  
      return {
        data: posts.slice(0, pageSize),
        hasMore: posts.length > pageSize,
      };
    }),
  
  getPostAdmin: roleProtectedProcedure('superAdmin')
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userDetails = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          student: {
            select: {
              passOutYear: true,
              program: true,
            },
          },
        },
      });
      const data = await ctx.db.post.findUniqueOrThrow({
        where: {
          published: true,
          id: input,
          OR: [
            {
              participatingGroups: {
                some: {
                  passOutYear: userDetails.student.passOutYear,
                  program: userDetails.student.program,
                },
              },
            },
            {
              individualParticipants: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          createdAt: true,
          title: true,
          content: true,
          jobType: true,
          author: {
            select: {
              name: true,
            },
          },
          participatingGroups: {
            select: {
              passOutYear: true,
              minCgpa: true,
              program: true,
            }
          },
          individualParticipants: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            }
          }
        },
      });
      return data;
    }),

});
