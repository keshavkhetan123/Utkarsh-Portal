import { z } from "zod";

import {
  roleProtectedProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const jobOpeningRouter = createTRPCRouter({
  createJobOpening: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        location: z.string(),
        role: z.string(),
        pay: z.string(),
        payNumeric: z.number(),
        empBenefits: z.string().optional(),
        company: z.object({
          name: z.string(),
          domain: z.string(),
          logo: z.string(),
        }),
        token: z.string(),
        jobType: z.string(),
        registrationStart: z.date(),
        registrationEnd: z.date(),
        noResumes: z.boolean().optional().default(false),
        hidden: z.boolean().optional().default(false),
        autoApprove: z.boolean().optional().default(true),
        autoVisible: z.boolean().optional().default(false),
        allowSelected: z.boolean().optional().default(false),
        allowedJobTypes: z.array(z.string()).optional().default([]),
        participatingGroups: z.array(
          z.object({
            passOutYear: z.number(),
            program: z.string(),
            minCgpa: z.number().max(10).optional().default(0),
            // minCredits: z.number().optional().default(0),
            backlog:z.boolean().default(false),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if company exists
      let company = await ctx.db.company.findUnique({
        where: { website: input.company.domain },
        select: { id: true },
      });

      if (!company) {
        company = await ctx.db.company.create({
          data: {
            name: input.company.name,
            website: input.company.domain,
            logo: input.company.logo,
          },
          select: { id: true },
        });
      }

      const decodedToken = decodeURIComponent(input.token)
      .replace(/ /g, "+")
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const hr = await ctx.db.hR.findUnique({
      where: { token: decodedToken },
    });

    if (!hr || !hr.isValid) {
      throw new Error("Invalid or unauthorized HR token");
    }

      await ctx.db.jobOpening.create({
        data: {
          year : input.participatingGroups[0].passOutYear,
          title: input.title,
          description: input.description,
          location: input.location,
          role: input.role,
          pay: input.pay,
          payNumeric: input.payNumeric,
          empBenefits: input.empBenefits,
          company: {
            connect: { id: company.id },
          },
          placementType: {
            connect: {
              id: input.jobType,
            },
          },
          hr: {
            connect: {
              token: decodeURIComponent(input.token).replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/"),
            },
          },
          registrationStart: input.registrationStart,
          registrationEnd: input.registrationEnd,
          noResumes: input.noResumes,
          hidden: input.hidden,
          autoApprove: input.autoApprove,
          autoVisible: input.autoVisible,
          allowSelected: input.allowSelected,
          allowedJobTypes: input.allowedJobTypes,
          JobOpeningParticipantGroups: {
            createMany: {
              data: input.participatingGroups.map((group) => ({
                passOutYear: group.passOutYear,
                program: group.program,
                minCgpa: group.minCgpa,
                backlog:group.backlog,
              })),
            },
          },
        },
      });

      await ctx.db.hR.update({
        where:{
          token: decodeURIComponent(input.token)
          .replace(/ /g, "+")
          .replace(/-/g, "+")
          .replace(/_/g, "/")
        },
        data:{
          isValid:false
        }
      });

      return true;
    }),

  updateJobOpening: roleProtectedProcedure('superAdmin')
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        location: z.string(),
        role: z.string(),
        pay: z.string(),
        payNumeric: z.number(),
        empBenefits: z.string().optional(),
        company: z.object({
          name: z.string(),
          domain: z.string(),
          logo: z.string(),
        }),
        jobType: z.string(),
        registrationStart: z.date(),
        registrationEnd: z.date(),
        extraApplicationFields: z.any(),
        noResumes: z.boolean().optional().default(false),
        hidden: z.boolean().optional().default(false),
        autoApprove: z.boolean().optional().default(false),
        autoVisible: z.boolean().optional().default(false),
        allowSelected: z.boolean().optional().default(false),
        allowedJobTypes: z.array(z.string()).optional().default([]),
        participatingGroups: z.array(
          z.object({
            id: z.string().optional(),
            passOutYear: z.number(),
            program: z.string(),
            minCgpa: z.number().max(10).optional().default(0),
            backlog:z.boolean().default(true),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if company exists
      let company = await ctx.db.company.findUnique({
        where: { website: input.company.domain },
        select: { id: true },
      });

      if (!company) {
        company = await ctx.db.company.create({
          data: {
            name: input.company.name,
            website: input.company.domain,
            logo: input.company.logo,
          },
          select: { id: true },
        });
      }

      let tasks = [];

      tasks.push(
        ctx.db.jobOpeningParticipantGroups.deleteMany({
          where: {
            id: {
              notIn: input.participatingGroups
                .filter((group) => group.id)
                .map((group) => group.id),
            },
            jobOpeningId: input.id,
          },
        }),
      );

      input.participatingGroups
        .filter((group) => group.id)
        .forEach((group) => {
          tasks.push(
            ctx.db.jobOpeningParticipantGroups.update({
              where: {
                id: group.id,
              },
              data: {
                passOutYear: group.passOutYear,
                program: group.program,
                minCgpa: group.minCgpa,
                backlog:group.backlog,
              },
            }),
          );
        });

      tasks.push(
        ctx.db.jobOpening.update({
          where: {
            id: input.id,
          },
          data: {
            title: input.title,
            description: input.description,
            location: input.location,
            role: input.role,
            pay: input.pay,
            payNumeric: input.payNumeric,
            empBenefits: input.empBenefits,
            company: {
              connect: { id: company.id },
            },
            placementType: {
              connect: {
                id: input.jobType,
              },
            },
            registrationStart: input.registrationStart,
            registrationEnd: input.registrationEnd,
            noResumes: input.noResumes,
            hidden: input.hidden,
            autoApprove: input.autoApprove,
            autoVisible: input.autoVisible,
            allowSelected: input.allowSelected,
            allowedJobTypes: input.allowedJobTypes,
            JobOpeningParticipantGroups: {
              createMany: {
                data: input.participatingGroups
                  .filter((group) => !group.id)
                  .map((group) => ({
                    passOutYear: group.passOutYear,
                    program: group.program,
                    minCgpa: group.minCgpa,
                    backlog:group.backlog,
                  })),
              },
            },
          },
        }),
      );

      await Promise.all(tasks);
      return true;
    }),

  deleteJobOpening: roleProtectedProcedure('superAdmin')
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.jobOpening.delete({
        where: {
          id: input,
        },
      });
      return true;
    }),

    getLatestJobOpenings: protectedProcedure
  .input(
    z.object({
      onlyApplicable: z.boolean().default(false),
      limit: z.number().default(10),
      page: z.number().default(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (ctx.session.user.userGroup !== "student") {
      throw new Error("Only students can view job openings");
    }
    const userDetails = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        student: {
          select: {
            passOutYear: true,
            program: true,
            cgpa: true,
            backlog: true,
            isDebarred: true,
            selections: {
              where: {
                year: ctx.session.user.year,
              },
            },
          },
        },
      },
    });

    if(userDetails.student.isDebarred){
      return {data : undefined, total : undefined, hasMore : undefined, debarred : true};
    }

    const query = {
      passOutYear: userDetails.student.passOutYear,
      program: userDetails.student.program,
      ...(input.onlyApplicable && {
        minCgpa: { lte: userDetails.student.cgpa },
        backlog: userDetails.student.backlog,
      }),
      jobOpening: {
        year: ctx.session.user.year,
        OR: [
          {
            hidden: false,
          },
          {
            AND: [
              {
                registrationStart: { lte: new Date() },
              },
              {
                autoVisible: true,
              },
            ],
          },
        ],
      },
    };

    const [total, jobOpenings] = await ctx.db.$transaction([
      ctx.db.jobOpeningParticipantGroups.count({
        where: query,
      }),
      ctx.db.jobOpeningParticipantGroups.findMany({
        where: query,
        select: {
          passOutYear: true,
          program: true,
          minCgpa: true,
          backlog: true,
          jobOpening: {
            select: {
              id: true,
              title: true,
              location: true,
              role: true,
              pay: true,
              company: {
                select: {
                  name: true,
                  website: true,
                  logo: true,
                },
              },
              placementType: {
                select: {
                  id: true,
                  name: true,
                },
              },
              // IMPORTANT: allowedJobTypes comes from the JobOpening model (as JSON array)
              allowedJobTypes: true,
              applications: {
                where: {
                  userId: ctx.session.user.id,
                },
                select: {
                  id: true,
                  latestStatus: {
                    select: {
                      status: true,
                    },
                  },
                },
              },
              allowSelected: true,
              registrationStart: true,
              registrationEnd: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          jobOpening: {
            registrationStart: "desc",
          },
        },
        take: input.limit + 1,
        skip: (input.page - 1) * input.limit,
      }),
    ]);

    const data = await Promise.all(jobOpenings.map(async (jobOpeningRecord) => {
      const jobWithoutCgpa = jobOpeningRecord.jobOpening;
      const job = {
        ...jobWithoutCgpa,
        minCgpa:jobOpeningRecord.minCgpa,
      }
      
      let whyNotRegister = "";

      // Extract student's selected job types (for the current year).
      const studentSelectedJobTypes = userDetails.student.selections.map(
        (sel) => sel.jobType
      );

      // If allowSelected is true then all students can apply.
      if(!job.allowSelected) {
        // When allowSelected is false, check the allowedJobTypes field.
        if (job.allowedJobTypes && Array.isArray(job.allowedJobTypes)) { 
          // Check if every selection is in the allowedJobTypes array.
          const allSelectionsAllowed = studentSelectedJobTypes.every((jobType) =>
            Array.isArray(job.allowedJobTypes) && (job.allowedJobTypes as string[]).includes(jobType)
          );
          if (!allSelectionsAllowed) {
            whyNotRegister = "Your previous selections include job types not allowed for this opening.";
          }
        }
        else if(studentSelectedJobTypes.length > 0)
          whyNotRegister = "Your previous selections include job types not allowed for this opening.";
      } 
      
      // Continue with the other validations already in place
      if (!whyNotRegister && jobOpeningRecord.passOutYear !== userDetails.student.passOutYear) {
        whyNotRegister = "Passout year does not match.";
      } else if (!whyNotRegister && jobOpeningRecord.program !== userDetails.student.program) {
        whyNotRegister = "Program does not match.";
      } else if (!whyNotRegister && job.minCgpa > userDetails.student.cgpa) {
        whyNotRegister = `Required CGPA: ${job.minCgpa}, Your CGPA: ${userDetails.student.cgpa}`;
      }
      else if (
        !whyNotRegister &&
        jobOpeningRecord.backlog === false &&
        userDetails.student.backlog === true
      ) {
        whyNotRegister = `Company does not allow students with backlog`;
      }

      return {
        ...job,
        canRegister: whyNotRegister === "", // True if no disqualifying reason exists
        whyNotRegister,
        alreadyRegistered: job.applications.length > 0,
      };
    }));

    return {
      data: data.slice(0, input.limit),
      total,
      hasMore: data.length > input.limit,
    };
  }),


  getJobOpening: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.userGroup !== "student") {
        throw new Error("Only students can view job openings");
      }
      const userDetails = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          student: {
            select: {
              passOutYear: true,
              program: true,
              cgpa: true,
              selections: {
                where: {
                  year: ctx.session.user.year,
                },
              },
              backlog: true,
            },
          },
        },
      });
      const jobOpening = await ctx.db.jobOpening.findUnique({
        where: {
          id: input,
          hidden: false,
          year: ctx.session.user.year,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          role: true,
          pay: true,
          empBenefits: true,
          company: {
            select: {
              name: true,
              website: true,
              logo: true,
            },
          },
          placementType: {
            select: {
              id: true,
              name: true,
            },
          },
          applications: {
            where: {
              userId: ctx.session.user.id,
            },
            select: {
              id: true,
              latestStatus: {
                select: {
                  status: true,
                },
              },
            },
          },
          allowSelected: true,
          registrationStart: true,
          registrationEnd: true,
          JobOpeningParticipantGroups: {
            select: {
              id: true,
              passOutYear: true,
              program: true,
              minCgpa: true,
              // minCredits: true,
              backlog:true,
            },
          },
          createdAt: true,
        },
      });

      type JobOpening = typeof jobOpening;
      type Data = {
        canRegister: boolean;
        whyNotRegister:string;
        alreadyRegistered: boolean;
      };

      const data: JobOpening & Data = {
        ...jobOpening,
        canRegister: false,
        whyNotRegister:"",
        alreadyRegistered: false,
      };

      delete data.JobOpeningParticipantGroups;

      if (jobOpening) {
        data.canRegister =
          (jobOpening.allowSelected ||
            userDetails.student.selections.filter(
              (sel) => sel.jobType === jobOpening.placementType.id,
            ).length === 0) &&
          jobOpening.JobOpeningParticipantGroups.some(
            (group) =>
              group.passOutYear === userDetails.student.passOutYear &&
              group.program === userDetails.student.program &&
              group.minCgpa <= userDetails.student.cgpa &&
              ((group.backlog == false) ? !userDetails.student.backlog : true)
          );

        data.alreadyRegistered = jobOpening.applications.length > 0;
      }

      return jobOpening;
    }),

  adminGetJobOpenings: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember'])
    .input(
      z.object({
        limit: z.number().default(2),
        page: z.number().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [count, jobOpenings] = await ctx.db.$transaction([
        ctx.db.jobOpening.count(),
        ctx.db.jobOpening.findMany({
          where: {
            year: ctx.session.user.year,
          },
          select: {
            id: true,
            title: true,
            location: true,
            role: true,
            pay: true,
            company: {
              select: {
                name: true,
                website: true,
                logo: true,
              },
            },
            placementType: {
              select: {
                name: true,
              },
            },
            registrationStart: true,
            registrationEnd: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: input.limit >= 0 ? input.limit + 1 : undefined,
          skip: (input.page - 1) * (input.limit >= 0 ? input.limit : 0),
        }),
      ]);

      return {
        data:
          input.limit >= 0 ? jobOpenings.slice(0, input.limit) : jobOpenings,
        total: count,
        hasMore: input.limit >= 0 && jobOpenings.length > input.limit,
      };
    }),

  adminGetJobOpening: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember'])
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.jobOpening.findUnique({
        where: {
          id: input,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          role: true,
          pay: true,
          payNumeric: true,
          empBenefits: true,
          company: {
            select: {
              name: true,
              website: true,
              logo: true,
            },
          },
          placementType: {
            select: {
              id: true,
              name: true,
            },
          },
          registrationStart: true,
          registrationEnd: true,
          noResumes: true,
          hidden: true,
          autoApprove: true,
          autoVisible: true,
          allowSelected: true,
          allowedJobTypes: true,
          JobOpeningParticipantGroups: {
            select: {
              id: true,
              passOutYear: true,
              program: true,
              minCgpa: true,
              // minCredits: true,
              backlog:true,
            },
          },
        },
      });
    }),

  adminGetRegDetails: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember'])
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.students.groupBy({
        by: ["passOutYear", "program"],
        where: {
          applications: {
            some: {
              jobId: input,
            },
          },
        },
        _count: {
          _all: true,
        },
      });
    }),
    hrGetJobOpenings: publicProcedure
    .input(
      z.object({
        token: z.string()
      }),
    )
    .query(async ({ ctx, input }) => {

    async function jobID() {
      const encodedDesiredToken = encodeURI(input.token.toString().trim());
      const records = await ctx.db.jobOpening.findMany();
      const matchedRecord = records.find(record => encodeURI(record.token) === encodedDesiredToken);
      console.log("token==========="+encodedDesiredToken+"\n"+"records============="+records+"\n"+"matched records=============="+matchedRecord)
      return matchedRecord.id;
    }

    // const record = await jobID();

    // if(typeof(record)!="string")
    //   throw new Error("Invalid Token");
    
            
    const jobOpenings = await ctx.db.jobOpening.findMany({
      where: {
        token:decodeURIComponent(input.token)
        .replace(/ /g, "+")
        .replace(/-/g, "+")
        .replace(/_/g, "/")
      },
      select: {
        id: true,
        title: true,
        location: true,
        role: true,
        pay: true,
        company: {
          select: {
            name: true,
            website: true,
            logo: true,
          },
        },
        placementType: {
          select: {
            name: true,
          },
        },
        registrationStart: true,
        registrationEnd: true,
      }
    });
    return {
      data:jobOpenings,
      // jobid:record
    };
  }),
    hrGetJobOpening: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.jobOpening.findUnique({
        where: {
          id: input,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          role: true,
          pay: true,
          payNumeric: true,
          empBenefits: true,
          company: {
            select: {
              name: true,
              website: true,
              logo: true,
            },
          },
          placementType: {
            select: {
              id: true,
              name: true,
            },
          },
          registrationStart: true,
          registrationEnd: true,
          noResumes: true,
          hidden: true,
          autoApprove: true,
          autoVisible: true,
          allowSelected: true,
          allowedJobTypes: true,
          JobOpeningParticipantGroups: {
            select: {
              id: true,
              passOutYear: true,
              program: true,
              minCgpa: true,
              // minCredits: true,
              backlog:true,
            },
          },
          hr: {
            select: {
              viewPermissions : true,
            }
          }
        },
      });
    }),

    hrGetRegDetails: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.students.groupBy({
        by: ["passOutYear", "program"],
        where: {
          applications: {
            some: {
              jobId: input,
            },
          },
        },
        _count: {
          _all: true,
        },
      });
    }),
});
