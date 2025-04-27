import { z } from "zod";

import { roleProtectedProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const faqRouter = createTRPCRouter({
    getFaqs: publicProcedure.query(async ({ ctx }) => {
        const data = await ctx.db.faq.findMany({
            where:{
                year:ctx.session.user.year,
            },
            select: {
                id: true,
                question: true,
                answer: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });
        return data;
    }),
    addFaq: roleProtectedProcedure(['superAdmin','PlacementTeamMember','PlacementCoreTeam']).input(z.object({
        question: z.string(),
        answer: z.string(),
    })).mutation(async ({ ctx, input }) => {
        await ctx.db.faq.create({
            data: {
                question: input.question,
                answer: input.answer,
                year:ctx.session.user.year,
                authorId: ctx.session.user.id,
            }
        });
        return true;
    }),
    deleteFaq: roleProtectedProcedure(['superAdmin','PlacementCoreTeam','PlacementTeamMember'])
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            await ctx.db.faq.delete({
                where: {
                    id: input,
                },
            });
            return true;
        }),

});
